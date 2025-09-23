-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  account_type_id INTEGER NOT NULL REFERENCES public.account_types(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create basic policies for companies (will update later)
CREATE POLICY "Users can view all companies" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Migrate existing company_name data to companies table
INSERT INTO public.companies (name, account_type_id, created_at, updated_at)
SELECT DISTINCT 
  p.company_name,
  p.account_type_id,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.company_name IS NOT NULL 
AND p.company_name != '';

-- Add company_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Update profiles to link to the new companies
UPDATE public.profiles p
SET company_id = c.id
FROM public.companies c
WHERE p.company_name = c.name 
AND p.account_type_id = c.account_type_id
AND p.company_name IS NOT NULL 
AND p.company_name != '';

-- Remove company_name column from profiles
ALTER TABLE public.profiles 
DROP COLUMN company_name;

-- Add trigger for companies updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Now update the company update policy to use company_id
DROP POLICY "Users can create companies" ON public.companies;
CREATE POLICY "Users can manage their own company" 
ON public.companies 
FOR ALL
USING (id IN (
  SELECT company_id 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND company_id IS NOT NULL
));