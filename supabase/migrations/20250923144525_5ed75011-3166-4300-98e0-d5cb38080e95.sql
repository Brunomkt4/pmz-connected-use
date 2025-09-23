-- Update the handle_new_user function to work with companies table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  company_record_id UUID;
BEGIN
  -- If user provided a company name, create/find the company
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL 
     AND NEW.raw_user_meta_data->>'company_name' != '' 
     AND (NEW.raw_user_meta_data->>'account_type_id')::integer IN (1, 3, 4, 5, 6) THEN
    
    -- Try to find existing company with same name and account type
    SELECT id INTO company_record_id
    FROM public.companies 
    WHERE name = NEW.raw_user_meta_data->>'company_name'
      AND account_type_id = (NEW.raw_user_meta_data->>'account_type_id')::integer
    LIMIT 1;
    
    -- If company doesn't exist, create it
    IF company_record_id IS NULL THEN
      INSERT INTO public.companies (name, account_type_id)
      VALUES (
        NEW.raw_user_meta_data->>'company_name',
        (NEW.raw_user_meta_data->>'account_type_id')::integer
      )
      RETURNING id INTO company_record_id;
    END IF;
  END IF;
  
  -- Insert the user profile
  INSERT INTO public.profiles (user_id, email, full_name, account_type_id, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'account_type_id')::integer, 1),
    company_record_id
  );
  
  RETURN NEW;
END;
$$;