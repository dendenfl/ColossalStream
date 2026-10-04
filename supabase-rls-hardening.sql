-- ColossalStream Supabase Row Level Security (RLS) Hardening
-- ============================================================================
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Paste -> Run
--
-- WHAT THIS DOES:
-- Locks the `user_sync` table so each user can ONLY read/write their own row.
-- Without this, anyone with your app's anon key (extractable from the APK)
-- could read or overwrite EVERY user's watch history, watchlists, and profiles.
--
-- The app already filters by user_id in its queries, but RLS enforces this
-- on the SERVER side, so a malicious client cannot bypass it.
-- ============================================================================

-- 1. Enable RLS on the user_sync table
ALTER TABLE public.user_sync ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing permissive policies (clean slate)
DROP POLICY IF EXISTS "Users can read own sync data" ON public.user_sync;
DROP POLICY IF EXISTS "Users can insert own sync data" ON public.user_sync;
DROP POLICY IF EXISTS "Users can update own sync data" ON public.user_sync;
DROP POLICY IF EXISTS "Users can delete own sync data" ON public.user_sync;

-- 3. SELECT: users can only read their own row
CREATE POLICY "Users can read own sync data"
  ON public.user_sync
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. INSERT: users can only create a row for themselves
CREATE POLICY "Users can insert own sync data"
  ON public.user_sync
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. UPDATE: users can only update their own row
CREATE POLICY "Users can update own sync data"
  ON public.user_sync
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. DELETE: users can only delete their own row
CREATE POLICY "Users can delete own sync data"
  ON public.user_sync
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION (run after the above):
-- This should return 0 rows when run as an authenticated user who owns no data,
-- and should NEVER return another user's row.
-- ============================================================================
-- SELECT user_id FROM public.user_sync LIMIT 5;
