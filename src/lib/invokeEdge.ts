import { supabase } from "@/integrations/supabase/client";

export async function invokeEdge(name: string, body: any) {
  // Prefer invoke (adds auth automatically if logged in)
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers: { 
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json" 
    }
  });
  
  if (!error && data) return data;

  // Fallback to direct fetch (handles CORS with apikey)
  const SUPABASE_URL = "https://xtawnkhvxgxylhxwqnmm.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXdua2h2eGd4eWxoeHdxbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDUyMjksImV4cCI6MjA2NjUyMTIyOX0.Ip_bdI4HjsfUdsy6WXLJwvQ2mo_Cm0lBAB50nJt5OPw";
  
  const url = `${SUPABASE_URL}/functions/v1/${name}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge ${name} failed: ${res.status} ${text}`);
  }
  
  return await res.json();
}