import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface XeroInvoice {
  InvoiceID: string
  InvoiceNumber: string
  Type: string
  Contact: {
    ContactID: string
    Name: string
  }
  Date: string
  DueDate: string
  Status: string
  LineAmountTypes: string
  LineItems: Array<{
    Description: string
    Quantity: number
    UnitAmount: number
    LineAmount: number
    AccountCode: string
  }>
  SubTotal: number
  TotalTax: number
  Total: number
  AmountDue: number
  CurrencyCode: string
}

// Helper function to parse Xero date format
function parseXeroDate(xeroDateString: string): string | null {
  if (!xeroDateString) return null;
  
  // Check if it's in Microsoft JSON date format: /Date(timestamp+timezone)/
  const match = xeroDateString.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    const timestamp = parseInt(match[1]);
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }
  
  // If it's already in ISO format or other standard format, try to parse it
  try {
    const date = new Date(xeroDateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Failed to parse date:', xeroDateString, e);
  }
  
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    console.log('Starting Xero invoice sync for user:', user.id)

    // Get user's Xero connection
    const { data: xeroConnection, error: connectionError } = await supabase
      .from('xero_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !xeroConnection) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No Xero connection found. Please connect to Xero first.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(xeroConnection.expires_at)
    
    if (now >= expiresAt) {
      // TODO: Implement token refresh logic here
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Xero token expired. Please reconnect to Xero.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Fetching invoices from Xero API...')

    // Fetch invoices from Xero
    const xeroApiUrl = `https://api.xero.com/api.xro/2.0/Invoices`
    const xeroResponse = await fetch(xeroApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${xeroConnection.access_token}`,
        'Xero-tenant-id': xeroConnection.tenant_id,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!xeroResponse.ok) {
      const errorText = await xeroResponse.text()
      console.error('Xero API Error:', errorText)
      throw new Error(`Xero API error: ${xeroResponse.status} ${errorText}`)
    }

    const xeroData = await xeroResponse.json()
    console.log('Raw Xero Response Data:', JSON.stringify(xeroData, null, 2))
    
    const invoices: XeroInvoice[] = xeroData.Invoices || []

    console.log(`Found ${invoices.length} invoices from Xero`)
    
    if (invoices.length === 0) {
      console.log('No invoices found - this could mean:')
      console.log('1. The Xero organization has no invoices')
      console.log('2. The Xero app lacks invoice read permissions')  
      console.log('3. The API scopes don\'t include accounting.transactions')
    }

    let syncedCount = 0
    let newIncomes = 0

    // Process each invoice
    for (const invoice of invoices) {
      try {
        // Only process ACCREC (received/income) invoices - all statuses
        if (invoice.Type === 'ACCREC') {
          
          // Check if we already have this invoice
          const { data: existingInvoice } = await supabase
            .from('xero_invoices')
            .select('id')
            .eq('user_id', user.id)
            .eq('xero_invoice_id', invoice.InvoiceID)
            .single()

          if (!existingInvoice) {
            // Parse dates properly
            const parsedDate = parseXeroDate(invoice.Date);
            const parsedDueDate = parseXeroDate(invoice.DueDate);
            
            console.log(`Processing invoice ${invoice.InvoiceNumber}: Date=${invoice.Date} -> ${parsedDate}, DueDate=${invoice.DueDate} -> ${parsedDueDate}`);
            
            // Store the invoice in xero_invoices table
            const { error: invoiceError } = await supabase
              .from('xero_invoices')
              .insert({
                user_id: user.id,
                xero_invoice_id: invoice.InvoiceID,
                invoice_number: invoice.InvoiceNumber,
                contact_name: invoice.Contact.Name,
                date: parsedDate,
                due_date: parsedDueDate,
                status: invoice.Status,
                sub_total: invoice.SubTotal,
                total_tax: invoice.TotalTax,
                total: invoice.Total,
                amount_due: invoice.AmountDue,
                currency_code: invoice.CurrencyCode,
                sync_timestamp: new Date().toISOString()
              })

            if (invoiceError) {
              console.error('Error storing invoice:', invoiceError)
              continue
            }

            // Create income entry for the main income table (if you have one)
            // This would go to your main income/revenue tracking table
            console.log(`Synced invoice ${invoice.InvoiceNumber}: ${invoice.Contact.Name} - ${invoice.CurrencyCode} ${invoice.Total}`)
            
            newIncomes++
          }
          
          syncedCount++
        }
      } catch (invoiceError) {
        console.error(`Error processing invoice ${invoice.InvoiceID}:`, invoiceError)
        continue
      }
    }

    // Update last sync timestamp
    await supabase
      .from('xero_connections')
      .update({ 
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    console.log(`Sync completed. Processed ${syncedCount} invoices, ${newIncomes} new entries`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${syncedCount} invoices from Xero`,
        processed: syncedCount,
        new_entries: newIncomes
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Xero sync error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || 'Failed to sync with Xero' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})