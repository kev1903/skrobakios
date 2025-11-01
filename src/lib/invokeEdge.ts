import { supabase } from "@/integrations/supabase/client";

export async function invokeEdge(name: string, body: any) {
  // Validate body is not empty
  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    throw new Error('Request body cannot be empty');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  // Always use direct fetch for reliability
  const SUPABASE_URL = "https://xtawnkhvxgxylhxwqnmm.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXdua2h2eGd4eWxoeHdxbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDUyMjksImV4cCI6MjA2NjUyMTIyOX0.Ip_bdI4HjsfUdsy6WXLJwvQ2mo_Cm0lBAB50nJt5OPw";
  
  const url = `${SUPABASE_URL}/functions/v1/${name}`;
  const bodyString = JSON.stringify(body);
  
  console.log(`Calling edge function ${name} with body length:`, bodyString.length);
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`
    },
    body: bodyString
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error(`Edge function ${name} failed:`, res.status, text);
    throw new Error(`Edge ${name} failed: ${res.status} ${text}`);
  }
  
  return await res.json();
}