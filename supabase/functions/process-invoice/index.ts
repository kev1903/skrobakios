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

    // Convert PDF to base64 for processing
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    console.log('PDF converted to base64 for processing');

    // Use OpenAI vision API to analyze the PDF image
    const prompt = `
      I need to extract key information from this invoice PDF. Please analyze and extract the following fields:
      
      - supplier_name: Company/vendor name sending the invoice
      - supplier_email: Email address (if visible on invoice)
      - bill_no: Invoice/bill number
      - bill_date: Invoice date (format: YYYY-MM-DD)
      - due_date: Due date (format: YYYY-MM-DD)
      - subtotal: Subtotal amount before tax (number only)
      - tax: Tax/GST amount (number only)
      - total: Total amount including tax (number only)
      - reference_number: Purchase order or reference number (if available)
      - description: Brief description of services/goods listed
      - wbs_code: Any WBS code mentioned (if available)
      - notes: Any additional notes or payment terms
      
      Please return ONLY a valid JSON object with these fields. Use null for missing values.
      For amounts, extract only the numeric value without currency symbols.
      
      Analyze this PDF file: ${fileName}
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
              {
                type: 'text',
                text: prompt
              },
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

    // Parse the extracted JSON or provide fallback data
    let extractedData;
    try {
      // Clean the response to extract JSON from markdown code blocks if present
      let cleanedResponse = extractedResponse.trim();
      
      // Remove markdown code block markers if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned response for parsing:', cleanedResponse);
      extractedData = JSON.parse(cleanedResponse);
      
    } catch (parseError) {
      console.error('Failed to parse extracted data as JSON:', extractedResponse);
      console.error('Parse error:', parseError.message);
      
      // Try to extract some basic information from the response text
      const lines = extractedResponse.split('\n');
      let supplierName = 'Unknown Supplier';
      let billNo = `INV-${Date.now()}`;
      let total = 0;
      
      // Look for common patterns in the text response
      for (const line of lines) {
        if (line.toLowerCase().includes('supplier') || line.toLowerCase().includes('company')) {
          const match = line.match(/[:"]\s*(.+?)[\s,]/);
          if (match) supplierName = match[1].replace(/["\{\}]/g, '').trim();
        }
        if (line.toLowerCase().includes('invoice') || line.toLowerCase().includes('bill')) {
          const match = line.match(/[:"]\s*([A-Z0-9\-]+)/);
          if (match) billNo = match[1];
        }
        if (line.toLowerCase().includes('total')) {
          const match = line.match(/(\d+\.?\d*)/);
          if (match) total = parseFloat(match[1]);
        }
      }
      
      // Fallback: extract basic info from filename and create default structure
      extractedData = {
        supplier_name: supplierName,
        supplier_email: null,
        bill_no: billNo,
        bill_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: Math.max(0, total * 0.9), // Estimate subtotal as 90% of total
        tax: Math.max(0, total * 0.1), // Estimate tax as 10% of total
        total: total,
        reference_number: null,
        description: 'Extracted from AI analysis - may require verification',
        wbs_code: null,
        notes: 'This invoice was processed with partial AI extraction. Please verify details.'
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