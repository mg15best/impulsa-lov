-- Ensure PostgREST schema cache is refreshed after the recent feature-expansion migrations.
--
-- This migration is intentionally idempotent in effect and safe to run in all environments.
-- It addresses cases where frontend writes include recently added columns but PostgREST
-- still serves an outdated schema cache snapshot.

NOTIFY pgrst, 'reload schema';
