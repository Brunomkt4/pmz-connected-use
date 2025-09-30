-- Drop the existing function and recreate with correct type casting
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate the function with improved logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_name text;
  v_account_type_id integer;
BEGIN
  -- Extract account_type_id - handle both string and number types
  v_account_type_id := CASE 
    WHEN jsonb_typeof(NEW.raw_user_meta_data->'account_type_id') = 'string' 
    THEN (NEW.raw_user_meta_data->>'account_type_id')::INTEGER
    WHEN jsonb_typeof(NEW.raw_user_meta_data->'account_type_id') = 'number' 
    THEN (NEW.raw_user_meta_data->'account_type_id')::INTEGER
    ELSE NULL
  END;

  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, account_type_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    v_account_type_id
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
      v_account_type_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();