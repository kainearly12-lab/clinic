-- =========================================================================
-- Supabase Activity Logs 30-Day Retention Policy & Automated Cleanup
-- Project: Androderma Clinic
-- =========================================================================

-- 1. Stored procedure / SQL function to delete logs older than 30 days
CREATE OR REPLACE FUNCTION clean_old_activity_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Strict retention: delete records created earlier than 30 days ago
  DELETE FROM activity_logs
  WHERE created_at < (NOW() - INTERVAL '30 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant execution permissions for RPC calls
GRANT EXECUTE ON FUNCTION clean_old_activity_logs() TO authenticated, service_role, anon;

-- =========================================================================
-- 2. Automated Scheduling with pg_cron in Supabase
-- =========================================================================
-- To run this function automatically in the background on a schedule:
--
-- A) Make sure the pg_cron extension is enabled in Supabase:
--    Dashboard -> Database -> Extensions -> Search for "pg_cron" and enable it.
--    Or run:
--    CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- B) Schedule a weekly cron job (runs every Sunday at 03:00 AM UTC):
--    SELECT cron.schedule(
--      'clean_old_activity_logs_weekly',
--      '0 3 * * 0',
--      'SELECT clean_old_activity_logs();'
--    );
--
-- C) (Alternative) Schedule a monthly cron job (runs 1st of each month at 00:00 UTC):
--    SELECT cron.schedule(
--      'clean_old_activity_logs_monthly',
--      '0 0 1 * *',
--      'SELECT clean_old_activity_logs();'
--    );
--
-- D) To inspect scheduled jobs:
--    SELECT * FROM cron.job;
--
-- E) To un-schedule if needed:
--    SELECT cron.unschedule('clean_old_activity_logs_weekly');
