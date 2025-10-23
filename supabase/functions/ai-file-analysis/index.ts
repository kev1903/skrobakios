import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { fileData, fileType, fileName, context } = await req.json();
    
    if (!fileData || !fileName) {
      throw new Error('Missing required fields: fileData and fileName');
    }
    
    console.log(`Processing file: ${fileName} (${fileType})`, { 
      contextProvided: !!context,
      dataLength: fileData.length 
    });

    // Prepare the message content based on file type
    const messageContent = [];
    
    // Add text prompt
    const contextInfo = context ? `\nProject Context: ${JSON.stringify(context)}` : '';
    messageContent.push({
      type: "text",
      text: `You are SkAi, an intelligent construction project assistant. Analyze this ${fileType.startsWith('image/') ? 'image' : 'document'} and provide insights.${contextInfo}
      
      For construction documents (plans, specifications, contracts, invoices):
      - Extract key information (project details, dates, costs, specifications)
      - Identify the document type and purpose
      - Highlight important requirements or milestones
      - Note any safety or compliance items
      - Suggest how this relates to project scope or tasks
      
      For images (site photos, drawings):
      - Describe what you see
      - Identify construction elements or issues
      - Note safety concerns if visible
      - Extract any visible text or measurements
      
      Be concise, clear, and focus on actionable construction project insights.`
    });

    // Add image data for image files
    if (fileType.startsWith('image/')) {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: fileData // Should be full data URL: data:image/...;base64,...
        }
      });
    } else {
      // For non-image files (PDFs, documents), include a note
      messageContent.push({
        type: "text",
        text: `\nNote: Analyzing ${fileType} document structure and any extractable content.`
      });
    }

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis returned from AI');
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-file-analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
