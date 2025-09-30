-- Update the handle_new_user trigger to also create a company record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_name text;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, account_type_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    (NEW.raw_user_meta_data->>'account_type_id')::INTEGER
  );
  
  -- Get company name from metadata
  v_company_name := NEW.raw_user_meta_data->>'company_name';
  
  -- Create company if company name is provided
  IF v_company_name IS NOT NULL AND v_company_name != '' THEN
    INSERT INTO public.companies (
      user_id, 
      name, 
      email, 
      phone,
      address,
      account_type_id
    )
    VALUES (
      NEW.id,
      v_company_name,
      NEW.email,
      '', -- phone will be updated later by user
      '', -- address will be updated later by user
      (NEW.raw_user_meta_data->>'account_type_id')::INTEGER
    );
  END IF;
  
  RETURN NEW;
END;
$$;