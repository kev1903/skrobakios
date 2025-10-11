-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule knowledge sync processor to run every 5 minutes
SELECT cron.schedule(
  'process-knowledge-sync-jobs',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://xtawnkhvxgxylhxwqnmm.supabase.co/functions/v1/sync-project-knowledge',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXdua2h2eGd4eWxoeHdxbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDUyMjksImV4cCI6MjA2NjUyMTIyOX0.Ip_bdI4HjsfUdsy6WXLJwvQ2mo_Cm0lBAB50nJt5OPw"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);