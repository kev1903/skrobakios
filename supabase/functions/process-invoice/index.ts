import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, projectId } = await req.json();
    
    console.log('Processing invoice:', { fileUrl, fileName, projectId });

    // Download the PDF file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }
    
    const fileBuffer = await fileResponse.arrayBuffer();
    console.log('File downloaded, size:', fileBuffer.byteLength);

    // Convert PDF to base64 for OpenAI vision processing
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    console.log('PDF converted to base64, ready for OpenAI processing');

    // Use OpenAI vision to extract invoice data from the PDF
    const prompt = `
      You are an expert invoice data extraction AI. Extract key information from this PDF invoice and return it as a JSON object.
      
      Extract the following fields:
      - supplier_name: Company/vendor name
      - supplier_email: Email address (if available)
      - bill_no: Invoice/bill number
      - bill_date: Invoice date (format: YYYY-MM-DD)
      - due_date: Due date (format: YYYY-MM-DD)
      - subtotal: Subtotal amount (number only)
      - tax: Tax amount (number only)
      - total: Total amount (number only)
      - reference_number: Purchase order or reference number (if available)
      - description: Brief description of services/goods
      - wbs_code: Any WBS code mentioned (if available)
      - notes: Any additional notes or terms
      
      Return ONLY a valid JSON object with these fields. Use null for missing values.
      For amounts, extract only the numeric value without currency symbols.
    `;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${fileBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const extractedResponse = openaiData.choices[0].message.content;
    
    console.log('OpenAI extracted response:', extractedResponse);

    // Parse the extracted JSON
    let extractedData;
    try {
      extractedData = JSON.parse(extractedResponse);
    } catch (parseError) {
      console.error('Failed to parse extracted data as JSON:', extractedResponse);
      // Fallback: try to extract basic info with regex
      extractedData = {
        supplier_name: fileName.split('.')[0] || 'Unknown Supplier',
        bill_no: 'EXTRACTED',
        bill_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total: 0,
        subtotal: 0,
        tax: 0,
        description: 'AI extraction failed - manual review required'
      };
    }

    console.log('Parsed extracted data:', extractedData);

    // Store processed invoice record
    const { data: processedInvoice, error: processedError } = await supabase
      .from('processed_invoices')
      .insert({
        project_id: projectId,
        file_url: fileUrl,
        file_name: fileName,
        extracted_data: extractedData,
        processing_status: 'completed'
      })
      .select()
      .single();

    if (processedError) {
      console.error('Error storing processed invoice:', processedError);
      throw processedError;
    }

    // Create bill record from extracted data
    const billData = {
      project_id: projectId,
      supplier_name: extractedData.supplier_name || 'Unknown Supplier',
      supplier_email: extractedData.supplier_email,
      bill_no: extractedData.bill_no || `AUTO-${Date.now()}`,
      bill_date: extractedData.bill_date || new Date().toISOString().split('T')[0],
      due_date: extractedData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: parseFloat(extractedData.subtotal) || 0,
      tax: parseFloat(extractedData.tax) || 0,
      total: parseFloat(extractedData.total) || 0,
      reference_number: extractedData.reference_number,
      status: 'draft',
      file_attachments: JSON.stringify([{
        name: fileName,
        url: fileUrl,
        type: 'application/pdf'
      }])
    };

    console.log('Creating bill with data:', billData);

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert(billData)
      .select()
      .single();

    if (billError) {
      console.error('Error creating bill:', billError);
      throw billError;
    }

    // Update processed invoice with bill_id
    await supabase
      .from('processed_invoices')
      .update({ bill_id: bill.id })
      .eq('id', processedInvoice.id);

    console.log('Successfully processed invoice and created bill:', bill.id);

    return new Response(JSON.stringify({
      success: true,
      bill,
      processedInvoice,
      extractedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing invoice:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});