-- Update handle_new_user function to work with account_type_id and conditional company_name
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