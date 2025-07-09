import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get user's Xero connection
    const { data: connection, error: connectionError } = await supabase
      .from('xero_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      throw new Error('No Xero connection found')
    }

    // Check if token needs refresh
    const now = new Date()
    const expiresAt = new Date(connection.expires_at)
    
    let accessToken = connection.access_token

    if (now >= expiresAt) {
      // Refresh token
      const xeroClientId = Deno.env.get('XERO_CLIENT_ID')
      const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')

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
        throw new Error('Failed to refresh access token')
      }

      const tokens = await refreshResponse.json()
      accessToken = tokens.access_token

      // Update stored tokens
      await supabase
        .from('xero_connections')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        })
        .eq('user_id', user.id)
    }

    const { action } = await req.json()

    switch (action) {
      case 'sync': {
        console.log('Starting Xero data sync for user:', user.id)

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

        // Sync invoices
        const invoicesResponse = await fetch(
          `https://api.xero.com/api.xro/2.0/Invoices?where=Date%3E%3DDateTime(2024,1,1)`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'xero-tenant-id': connection.tenant_id,
              'Accept': 'application/json'
            }
          }
        )

        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json()
          console.log(`Found ${invoicesData.Invoices?.length || 0} invoices`)

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

            console.log('Sample invoice data:', JSON.stringify(invoicesToInsert[0], null, 2))

            await supabase
              .from('xero_invoices')
              .upsert(invoicesToInsert, { onConflict: 'xero_invoice_id' })
          }
        }

        // Sync contacts
        const contactsResponse = await fetch(
          'https://api.xero.com/api.xro/2.0/Contacts',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'xero-tenant-id': connection.tenant_id,
              'Accept': 'application/json'
            }
          }
        )

        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json()
          console.log(`Found ${contactsData.Contacts?.length || 0} contacts`)

          // Store contacts in our database
          if (contactsData.Contacts?.length > 0) {
            const contactsToInsert = contactsData.Contacts.map((contact: any) => ({
              user_id: user.id,
              xero_contact_id: contact.ContactID,
              name: contact.Name,
              email: contact.EmailAddress,
              phone: contact.FirstName, // You might want to map this properly
              contact_status: contact.ContactStatus,
              is_supplier: contact.IsSupplier,
              is_customer: contact.IsCustomer,
              sync_timestamp: new Date().toISOString()
            }))

            await supabase
              .from('xero_contacts')
              .upsert(contactsToInsert, { onConflict: 'xero_contact_id' })
          }
        }

        // Sync accounts
        const accountsResponse = await fetch(
          'https://api.xero.com/api.xro/2.0/Accounts',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'xero-tenant-id': connection.tenant_id,
              'Accept': 'application/json'
            }
          }
        )

        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json()
          console.log(`Found ${accountsData.Accounts?.length || 0} accounts`)

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

            await supabase
              .from('xero_accounts')
              .upsert(accountsToInsert, { onConflict: 'xero_account_id' })
          }
        }

        // Update last sync timestamp
        await supabase
          .from('xero_connections')
          .update({ last_sync: new Date().toISOString() })
          .eq('user_id', user.id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Data synced successfully',
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})