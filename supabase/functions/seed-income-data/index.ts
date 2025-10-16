import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user');
    }

    // Get user's active company
    const { data: companyData } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (!companyData) {
      throw new Error('No active company found');
    }

    const companyId = companyData.company_id;

    // Income data from the user's image
    const incomeData = [
      { date: '2025-07-09', client: 'Mr Benjamin & Mrs Jac', project: 'Site Surveillance', description: 'Site surveillance payment', amount: 1100.00, method: 'Fast Transfer' },
      { date: '2025-07-10', client: 'City of Kingston', project: null, description: 'Direct credit', amount: 2000.00, method: 'Direct Credit' },
      { date: '2025-07-14', client: 'Stripe', project: 'Horace Street', description: 'Stripe-HbAHF1qLMS', amount: 6201.91, method: 'Direct Credit' },
      { date: '2025-07-16', client: 'Mr Peter Wayne-Good', project: null, description: 'Credit to account (Peter Tiyago)', amount: 1650.00, method: 'Fast Transfer' },
      { date: '2025-07-16', client: 'TPM Consulting', project: '21 Sugarloaf Rd', description: 'INV-0309 Final Invoice', amount: 2609.20, method: 'Fast Transfer' },
      { date: '2025-08-05', client: 'Vishal Bhasin', project: '43 Iris Rd', description: 'Bank transfer', amount: 1630.00, method: 'NetBank' },
      { date: '2025-08-06', client: 'Stripe', project: null, description: 'Stripe-1Cord6Q8llT', amount: 4398.43, method: 'Direct Credit' },
      { date: '2025-08-12', client: 'Mr Benjamin & Mrs Jac', project: 'Base Thanet', description: 'Payment for base works', amount: 7000.00, method: 'Fast Transfer' },
      { date: '2025-08-12', client: 'WBC OLP MECON', project: 'Insurance Claim', description: 'MECON Claim 18118', amount: 10000.00, method: 'Direct Credit' },
      { date: '2025-08-01', client: 'Leongatha Christian R', project: null, description: 'Gravel refund', amount: 221.00, method: 'Fast Transfer' },
      { date: '2025-09-05', client: 'Stripe', project: 'High Society Café', description: 'Stripe-PYKfOuJqbrr', amount: 6201.91, method: 'Direct Credit' },
      { date: '2025-09-07', client: 'Ekta Bhasin', project: '43 Iris Rd', description: 'Deposit Invoice SK_25011', amount: 5452.92, method: 'Fast Transfer' },
      { date: '2025-09-16', client: 'Mr Benjamin & Mrs Jac', project: 'Thanet St', description: 'Concrete cutting Thanet', amount: 400.00, method: 'Fast Transfer' },
      { date: '2025-09-18', client: 'Stripe', project: null, description: 'Stripe-Pl4TlFpayWc', amount: 2199.06, method: 'Direct Credit' },
      { date: '2025-09-20', client: 'Ekta Bhasin', project: '43 Iris Rd', description: 'Inv 0328', amount: 20000.00, method: 'Fast Transfer' },
    ];

    const recordsToInsert = incomeData.map(record => ({
      company_id: companyId,
      transaction_date: record.date,
      client_source: record.client,
      project_name: record.project || '—',
      description: record.description,
      amount: record.amount,
      payment_method: record.method,
      status: 'received',
      created_by: user.id
    }));

    const { data, error } = await supabase
      .from('income_transactions')
      .insert(recordsToInsert)
      .select();

    if (error) throw error;

    console.log(`Successfully inserted ${data.length} income records`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Inserted ${data.length} income records`,
        count: data.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
