import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to refresh token automatically
async function refreshTokenIfNeeded(connection: any, supabase: any, user: any) {
  const now = new Date()
  const expiresAt = new Date(connection.expires_at)
  
  // Refresh token if it expires within 5 minutes
  const bufferTime = 5 * 60 * 1000 // 5 minutes
  
  if (now.getTime() + bufferTime >= expiresAt.getTime()) {
    console.log('🔄 Token about to expire, refreshing...')
    
    const xeroClientId = Deno.env.get('XERO_CLIENT_ID')
    const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')
    
    if (!xeroClientId || !xeroClientSecret) {
      throw new Error('Xero credentials not configured')
    }

    const refreshResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${xeroClientId}:${xeroClientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token
      })
    })

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text()
      console.error('❌ Token refresh failed:', errorText)
      throw new Error('Failed to refresh access token - connection may be invalid')
    }

    const tokens = await refreshResponse.json()
    console.log('✅ Token refreshed successfully')

    // Update stored tokens
    const updatedTokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || connection.refresh_token,
      expires_at: new Date(Date.now() + (tokens.expires_in || 1800) * 1000).toISOString(),
      last_sync: new Date().toISOString()
    }
    
    await supabase
      .from('xero_connections')
      .update(updatedTokens)
      .eq('user_id', user.id)

    return {
      ...connection,
      ...updatedTokens
    }
  }
  
  return connection
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    console.log('📋 User authenticated:', user.email)

    // Get user's Xero connection
    const { data: connection, error: connectionError } = await supabase
      .from('xero_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      throw new Error('No Xero connection found - please reconnect to Xero')
    }

    // Refresh token if needed (with 5-minute buffer)
    const refreshedConnection = await refreshTokenIfNeeded(connection, supabase, user)

    const { action } = await req.json()
    console.log('📋 Action requested:', action)

    switch (action) {
      case 'sync': {
        console.log('🔄 Starting Xero data sync for user:', user.id)

        // Helper function to parse .NET JSON dates
        const parseXeroDate = (dateString: string | null): string | null => {
          if (!dateString) return null;
          
          // Handle .NET JSON date format: /Date(1705881600000+0000)/
          const match = dateString.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
          if (match) {
            const timestamp = parseInt(match[1]);
            return new Date(timestamp).toISOString().split('T')[0]; // Return YYYY-MM-DD format
          }
          
          // Handle ISO date format
          if (dateString.includes('T')) {
            return new Date(dateString).toISOString().split('T')[0];
          }
          
          // Return as-is if already in YYYY-MM-DD format
          return dateString;
        };

        // Use refreshed connection for API calls
        const accessToken = refreshedConnection.access_token
        const tenantId = refreshedConnection.tenant_id

        let syncResults = {
          invoices: 0,
          contacts: 0,
          accounts: 0,
          errors: []
        }

        // Sync invoices
        try {
          console.log('📄 Syncing invoices...')
          const invoicesResponse = await fetch(
            `https://api.xero.com/api.xro/2.0/Invoices?where=Date%3E%3DDateTime(2024,1,1)`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'xero-tenant-id': tenantId,
                'Accept': 'application/json'
              }
            }
          )

          if (invoicesResponse.ok) {
            const invoicesData = await invoicesResponse.json()
            console.log(`📄 Found ${invoicesData.Invoices?.length || 0} invoices`)

            // Store invoices in our database
            if (invoicesData.Invoices?.length > 0) {
              const invoicesToInsert = invoicesData.Invoices.map((invoice: any) => ({
                user_id: user.id,
                xero_invoice_id: invoice.InvoiceID,
                invoice_number: invoice.InvoiceNumber,
                contact_name: invoice.Contact?.Name,
                date: parseXeroDate(invoice.Date),
                due_date: parseXeroDate(invoice.DueDateString || invoice.DueDate),
                total: parseFloat(invoice.Total || 0),
                amount_due: parseFloat(invoice.AmountDue || 0),
                status: invoice.Status,
                type: invoice.Type,
                currency_code: invoice.CurrencyCode,
                reference: invoice.Reference,
                sync_timestamp: new Date().toISOString()
              }))

              const { error: invoiceError } = await supabase
                .from('xero_invoices')
                .upsert(invoicesToInsert, { onConflict: 'xero_invoice_id' })
              
              if (invoiceError) {
                console.error('❌ Error inserting invoices:', invoiceError)
                syncResults.errors.push(`Invoices: ${invoiceError.message}`)
              } else {
                syncResults.invoices = invoicesToInsert.length
              }
            }
          } else {
            console.error('❌ Failed to fetch invoices:', await invoicesResponse.text())
            syncResults.errors.push('Failed to fetch invoices from Xero')
          }
        } catch (error) {
          console.error('❌ Invoice sync error:', error)
          syncResults.errors.push(`Invoices: ${error.message}`)
        }

        // Sync contacts
        try {
          console.log('👥 Syncing contacts...')
          const contactsResponse = await fetch(
            'https://api.xero.com/api.xro/2.0/Contacts',
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'xero-tenant-id': tenantId,
                'Accept': 'application/json'
              }
            }
          )

          if (contactsResponse.ok) {
            const contactsData = await contactsResponse.json()
            console.log(`👥 Found ${contactsData.Contacts?.length || 0} contacts`)

            // Store contacts in our database
            if (contactsData.Contacts?.length > 0) {
              const contactsToInsert = contactsData.Contacts.map((contact: any) => ({
                user_id: user.id,
                xero_contact_id: contact.ContactID,
                name: contact.Name,
                email: contact.EmailAddress,
                phone: contact.Phones?.[0]?.PhoneNumber || null,
                contact_status: contact.ContactStatus,
                is_supplier: contact.IsSupplier,
                is_customer: contact.IsCustomer,
                sync_timestamp: new Date().toISOString()
              }))

              const { error: contactError } = await supabase
                .from('xero_contacts')
                .upsert(contactsToInsert, { onConflict: 'xero_contact_id' })
              
              if (contactError) {
                console.error('❌ Error inserting contacts:', contactError)
                syncResults.errors.push(`Contacts: ${contactError.message}`)
              } else {
                syncResults.contacts = contactsToInsert.length
              }
            }
          } else {
            console.error('❌ Failed to fetch contacts:', await contactsResponse.text())
            syncResults.errors.push('Failed to fetch contacts from Xero')
          }
        } catch (error) {
          console.error('❌ Contact sync error:', error)
          syncResults.errors.push(`Contacts: ${error.message}`)
        }

        // Sync accounts
        try {
          console.log('🏦 Syncing accounts...')
          const accountsResponse = await fetch(
            'https://api.xero.com/api.xro/2.0/Accounts',
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'xero-tenant-id': tenantId,
                'Accept': 'application/json'
              }
            }
          )

          if (accountsResponse.ok) {
            const accountsData = await accountsResponse.json()
            console.log(`🏦 Found ${accountsData.Accounts?.length || 0} accounts`)

            // Store accounts in our database
            if (accountsData.Accounts?.length > 0) {
              const accountsToInsert = accountsData.Accounts.map((account: any) => ({
                user_id: user.id,
                xero_account_id: account.AccountID,
                code: account.Code,
                name: account.Name,
                type: account.Type,
                tax_type: account.TaxType,
                enable_payments_to_account: account.EnablePaymentsToAccount,
                show_in_expense_claims: account.ShowInExpenseClaims,
                class: account.Class,
                sync_timestamp: new Date().toISOString()
              }))

              const { error: accountError } = await supabase
                .from('xero_accounts')
                .upsert(accountsToInsert, { onConflict: 'xero_account_id' })
              
              if (accountError) {
                console.error('❌ Error inserting accounts:', accountError)
                syncResults.errors.push(`Accounts: ${accountError.message}`)
              } else {
                syncResults.accounts = accountsToInsert.length
              }
            }
          } else {
            console.error('❌ Failed to fetch accounts:', await accountsResponse.text())
            syncResults.errors.push('Failed to fetch accounts from Xero')
          }
        } catch (error) {
          console.error('❌ Account sync error:', error)
          syncResults.errors.push(`Accounts: ${error.message}`)
        }

        // Update last sync timestamp
        await supabase
          .from('xero_connections')
          .update({ last_sync: new Date().toISOString() })
          .eq('user_id', user.id)

        console.log('✅ Sync completed:', syncResults)

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Data synced successfully',
            results: syncResults,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      default:
        throw new Error(`Invalid action: ${action}`)
    }

  } catch (error) {
    console.error('💥 Sync error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})