-- Add constraint to ensure company_name is only set for business account types
ALTER TABLE public.profiles 
ADD CONSTRAINT check_company_name_business_only 
CHECK (
  (company_name IS NULL) OR 
  (account_type_id IN (
    SELECT id FROM public.account_types 
    WHERE name IN ('Seller', 'Insurance Company', 'Carrier / Transportation Company', 'Bank Guarantee', 'Financing')
  ))
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