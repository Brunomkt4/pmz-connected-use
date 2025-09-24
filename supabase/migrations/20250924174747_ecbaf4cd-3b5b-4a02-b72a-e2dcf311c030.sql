-- Update the handle_new_user function to create records in appropriate tables based on account type
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  company_record_id UUID;
  account_type_id_val INTEGER;
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Get account type and basic user info
  account_type_id_val := COALESCE((NEW.raw_user_meta_data->>'account_type_id')::integer, 1);
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_email := NEW.email;
  
  -- Insert the user profile
  INSERT INTO public.profiles (user_id, email, full_name, account_type_id)
  VALUES (
    NEW.id,
    user_email,
    user_name,
    account_type_id_val
  );
  
  -- If user provided a company name, create/find the company and set user as owner
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL 
     AND NEW.raw_user_meta_data->>'company_name' != '' 
     AND account_type_id_val IN (1, 3, 4, 5, 6) THEN
    
    -- Try to find existing company with same name and account type without an owner
    SELECT id INTO company_record_id
    FROM public.companies 
    WHERE name = NEW.raw_user_meta_data->>'company_name'
      AND account_type_id = account_type_id_val
      AND user_id IS NULL
    LIMIT 1;
    
    -- If company doesn't exist, create it with the user as owner
    IF company_record_id IS NULL THEN
      INSERT INTO public.companies (name, account_type_id, user_id)
      VALUES (
        NEW.raw_user_meta_data->>'company_name',
        account_type_id_val,
        NEW.id
      )
      RETURNING id INTO company_record_id;
    ELSE
      -- Update existing company to set this user as owner
      UPDATE public.companies 
      SET user_id = NEW.id 
      WHERE id = company_record_id;
    END IF;
  END IF;
  
  -- Create records in specific tables based on account type
  CASE account_type_id_val
    WHEN 1 THEN -- Seller -> suppliers table
      INSERT INTO public.suppliers (user_id, name, email)
      VALUES (NEW.id, user_name, user_email);
      
    WHEN 2 THEN -- Buyer -> buyers table
      INSERT INTO public.buyers (user_id, name, email)
      VALUES (NEW.id, user_name, user_email);
      
    WHEN 4 THEN -- Carrier -> carriers table
      INSERT INTO public.carriers (user_id, company_name, email)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', user_name), user_email);
      
    WHEN 5 THEN -- Bank Guarantee -> bank_guarantees table
      INSERT INTO public.bank_guarantees (user_id)
      VALUES (NEW.id);
      
    ELSE
      -- For other account types (3-Insurance, 6-Financing), just create the profile
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$function$