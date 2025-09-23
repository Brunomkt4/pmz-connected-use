-- Add user_id column to companies table
ALTER TABLE public.companies 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policy for companies to allow users to manage their own companies
DROP POLICY IF EXISTS "Users can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Users can manage companies they belong to" ON public.companies;

-- Create new policies based on user_id ownership
CREATE POLICY "Users can view all companies" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own companies" 
ON public.companies 
FOR ALL
USING (auth.uid() = user_id);