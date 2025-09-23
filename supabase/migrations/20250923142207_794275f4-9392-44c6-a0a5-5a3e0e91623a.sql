-- Create account_types table
CREATE TABLE public.account_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the account types
INSERT INTO public.account_types (name, description) VALUES 
  ('Seller', 'Companies that sell products or services'),
  ('Buyer', 'Companies that purchase products or services'),
  ('Insurance Company', 'Insurance providers offering coverage'),
  ('Carrier / Transportation Company', 'Transportation and logistics providers'),
  ('Bank Guarantee', 'Financial institutions providing guarantees'),
  ('Financing', 'Financial institutions providing financing services');

-- Enable RLS on account_types (publicly readable)
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;

-- Create policy "Account types are publicly readable" 
CREATE POLICY "Account types are publicly readable"
ON public.account_types 
FOR SELECT 
USING (true);

-- Drop the old check constraint and user_type column
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_user_type;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;

-- Add foreign key column to profiles
ALTER TABLE public.profiles 
ADD COLUMN account_type_id INTEGER REFERENCES public.account_types(id);

-- Set default value for existing data, then make it required
UPDATE public.profiles SET account_type_id = 1 WHERE account_type_id IS NULL;
ALTER TABLE public.profiles ALTER COLUMN account_type_id SET NOT NULL;

-- Add constraint to ensure company_name is only set for business account types
-- Business account types: Seller(1), Insurance Company(3), Carrier(4), Bank Guarantee(5), Financing(6)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_company_name_business_only 
CHECK (
  (company_name IS NULL) OR 
  (account_type_id IN (1, 3, 4, 5, 6))
);