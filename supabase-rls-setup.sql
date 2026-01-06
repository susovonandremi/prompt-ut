-- ============================================================
-- Supabase Row Level Security (RLS) Setup for AI UI Generator
-- Run this SQL in Supabase SQL Editor
-- ============================================================

-- ==================== 1. ENABLE RLS ON ALL TABLES ====================

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Vote" ENABLE ROW LEVEL SECURITY;

-- ==================== 2. USER TABLE POLICIES ====================

-- Allow users to read all profiles (public profiles)
CREATE POLICY user_select_all ON public."User"
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow users to update their own profile
CREATE POLICY user_update_own ON public."User"
  FOR UPDATE
  TO authenticated
  USING ("clerkId" = auth.jwt() ->> 'sub')
  WITH CHECK ("clerkId" = auth.jwt() ->> 'sub');

-- Allow service role to insert new users (for signup flow)
-- Note: INSERT happens via service role from your API
CREATE POLICY user_insert ON public."User"
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ==================== 3. POST TABLE POLICIES ====================

-- Allow everyone to read all posts (public feed)
CREATE POLICY post_select_all ON public."Post"
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to create posts for themselves
CREATE POLICY post_insert_own ON public."Post"
  FOR INSERT
  TO authenticated
  WITH CHECK ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ));

-- Allow users to update their own posts
CREATE POLICY post_update_own ON public."Post"
  FOR UPDATE
  TO authenticated
  USING ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ))
  WITH CHECK ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ));

-- Allow users to delete their own posts
CREATE POLICY post_delete_own ON public."Post"
  FOR DELETE
  TO authenticated
  USING ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ));

-- ==================== 4. VOTE TABLE POLICIES ====================

-- Allow everyone to read votes (for displaying vote counts)
CREATE POLICY vote_select_all ON public."Vote"
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert their own votes
CREATE POLICY vote_insert_own ON public."Vote"
  FOR INSERT
  TO authenticated
  WITH CHECK ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ));

-- Allow users to update their own votes
CREATE POLICY vote_update_own ON public."Vote"
  FOR UPDATE
  TO authenticated
  USING ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ))
  WITH CHECK ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ));

-- Allow users to delete their own votes
CREATE POLICY vote_delete_own ON public."Vote"
  FOR DELETE
  TO authenticated
  USING ("userId" IN (
    SELECT id FROM public."User" WHERE "clerkId" = auth.jwt() ->> 'sub'
  ));

-- ==================== 5. ADD INDEXES FOR PERFORMANCE ====================

CREATE INDEX IF NOT EXISTS idx_user_clerk_id ON public."User"("clerkId");
CREATE INDEX IF NOT EXISTS idx_post_user_id ON public."Post"("userId");
CREATE INDEX IF NOT EXISTS idx_vote_user_id ON public."Vote"("userId");
CREATE INDEX IF NOT EXISTS idx_vote_post_id ON public."Vote"("postId");

-- ==================== 6. GRANT ACCESS ====================

-- Revoke broad public access
REVOKE ALL ON public."User" FROM PUBLIC;
REVOKE ALL ON public."Post" FROM PUBLIC;
REVOKE ALL ON public."Vote" FROM PUBLIC;

-- Grant specific role access
GRANT SELECT ON public."User" TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Post" TO authenticated;
GRANT SELECT ON public."Post" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Vote" TO authenticated;
GRANT SELECT ON public."Vote" TO anon;

-- ============================================================
-- DONE! Your tables now have Row Level Security enabled.
-- ============================================================
