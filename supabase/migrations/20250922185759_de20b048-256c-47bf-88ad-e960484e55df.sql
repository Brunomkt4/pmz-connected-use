-- Fix RLS policy for profile creation during signup
-- The issue is that the trigger function runs in system context, not user context
-- We need to allow the system to create profiles during user signup

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new policy that allows both user inserts and system inserts during signup
CREATE POLICY "Allow profile creation"
ON public.profiles
FOR INSERT
WITH CHECK (
  -- Allow users to insert their own profile
  auth.uid() = user_id
  OR
  -- Allow system to insert during user signup (when auth.uid() might not be set yet)
  auth.uid() IS NULL
);