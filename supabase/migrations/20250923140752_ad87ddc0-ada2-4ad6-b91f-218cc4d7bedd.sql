-- Add user_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_type TEXT;

-- Add check constraint to ensure valid user types
ALTER TABLE public.profiles 
ADD CONSTRAINT check_user_type 
CHECK (user_type IN ('Seller', 'Buyer', 'Insurance Company', 'Carrier / Transportation Company', 'Bank Guarantee', 'Financing'));