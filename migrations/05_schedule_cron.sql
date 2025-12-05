-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule safely using a DO block
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'invoke-send-reminders') THEN
        PERFORM cron.unschedule('invoke-send-reminders');
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if job doesn't exist or permission issues
    NULL;
END $$;

-- Schedule the cron job
SELECT cron.schedule(
    'invoke-send-reminders',
    '* * * * *', -- Run every minute
    $$
    SELECT
      net.http_post(
          url:='https://wzkaawcmxwvnrdksyodz.supabase.co/functions/v1/send-reminders',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6a2Fhd2NteHd2bnJka3N5b2R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkyNTcwNiwiZXhwIjoyMDgwNTAxNzA2fQ.rLBxRghzGn4_152BDOKidzDRNfwKQ97IhpiNlZAM15w"}'::jsonb
      ) as request_id;
    $$
);
