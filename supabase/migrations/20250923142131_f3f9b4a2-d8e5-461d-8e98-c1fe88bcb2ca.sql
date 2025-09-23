-- Add constraint to ensure company_name is only set for business account types
-- Business account types: Seller(1), Insurance Company(3), Carrier(4), Bank Guarantee(5), Financing(6)
-- Non-business account types: Buyer(2)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_company_name_business_only 
CHECK (
  (company_name IS NULL) OR 
  (account_type_id IN (1, 3, 4, 5, 6))
);

-- Update handle_new_user function to include account_type_id and company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, account_type_id, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'account_type_id')::integer, 1),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'account_type_id')::integer IN (1, 3, 4, 5, 6) 
      THEN NEW.raw_user_meta_data->>'company_name'
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;