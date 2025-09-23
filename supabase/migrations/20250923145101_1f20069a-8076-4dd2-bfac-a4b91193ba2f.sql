-- Create junction table for user-company many-to-many relationship
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on user_companies table
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Create policies for user_companies
CREATE POLICY "Users can view their own company relationships" 
ON public.user_companies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own company relationships" 
ON public.user_companies 
FOR ALL
USING (auth.uid() = user_id);

-- Migrate existing company relationships from profiles to user_companies
INSERT INTO public.user_companies (user_id, company_id, role, created_at, updated_at)
SELECT 
  user_id, 
  company_id, 
  'owner', 
  created_at, 
  updated_at
FROM public.profiles 
WHERE company_id IS NOT NULL;

-- Drop the existing policy that depends on company_id
DROP POLICY "Users can manage their own company" ON public.companies;

-- Remove company_id column from profiles table
ALTER TABLE public.profiles 
DROP COLUMN company_id;

-- Add trigger for user_companies updated_at
CREATE TRIGGER update_user_companies_updated_at
BEFORE UPDATE ON public.user_companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create new policy that works with junction table
CREATE POLICY "Users can manage companies they belong to" 
ON public.companies 
FOR ALL
USING (id IN (
  SELECT company_id 
  FROM public.user_companies 
  WHERE user_id = auth.uid()
));