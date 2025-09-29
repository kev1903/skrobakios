-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily check reset to run every day at 5:00 AM
SELECT cron.schedule(
  'daily-check-reset',
  '0 5 * * *', -- 5:00 AM every day
  $$
  select
    net.http_post(
        url:='https://xtawnkhvxgxylhxwqnmm.supabase.co/functions/v1/daily-check-reset',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXdua2h2eGd4eWxoeHdxbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDUyMjksImV4cCI6MjA2NjUyMTIyOX0.Ip_bdI4HjsfUdsy6WXLJwvQ2mo_Cm0lBAB50nJt5OPw"}'::jsonb,
        body:=concat('{"scheduled_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);