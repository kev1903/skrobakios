import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetContractFileRequest {
  contractId: string;
  expiresIn?: number; // seconds, defaults to 3600 (1 hour)
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for storage operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize regular client for user validation
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify the user making the request
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { contractId, expiresIn = 3600 }: GetContractFileRequest = await req.json();

    if (!contractId) {
      return new Response(
        JSON.stringify({ error: 'Missing contractId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate contract exists and user has access using RLS
    const { data: contract, error: contractError } = await supabaseUser
      .from('project_contracts')
      .select(`
        id,
        contract_number,
        title,
        file_path,
        project_id,
        projects (
          id,
          name,
          company_id
        )
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      console.error('Contract access error:', contractError);
      return new Response(
        JSON.stringify({ error: 'Contract not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!contract.file_path) {
      return new Response(
        JSON.stringify({ error: 'Contract file not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed URL using service role
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('contracts')
      .createSignedUrl(contract.file_path, expiresIn);

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate signed URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString();

    // Extract filename from file path
    const fileName = contract.file_path.split('/').pop() || 'contract.pdf';

    console.log(`Generated signed URL for contract ${contractId}`, {
      contractNumber: contract.contract_number,
      fileName,
      expiresIn,
      userId: user.id
    });

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl: signedUrlData.signedUrl,
        expiresAt,
        fileName,
        contractNumber: contract.contract_number,
        contractTitle: contract.title
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-contract-file function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);