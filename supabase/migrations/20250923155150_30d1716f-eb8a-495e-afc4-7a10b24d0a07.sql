-- Restore basic company information for suppliers from the suppliers table
INSERT INTO public.companies (
  user_id, name, email, phone, address, cnpj, account_type_id, created_at, updated_at
)
SELECT 
  user_id, name, email, phone, address, cnpj, 1 as account_type_id, created_at, updated_at
FROM public.suppliers
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  cnpj = EXCLUDED.cnpj,
  updated_at = EXCLUDED.updated_at;