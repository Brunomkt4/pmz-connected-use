-- Create suppliers table with supplier-specific fields
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  cnpj TEXT,
  sif_registration TEXT,
  contact_person TEXT,
  product_types TEXT[], -- Type of Protein/Product
  products TEXT[], -- Product Description and Quality
  available_certifications TEXT[],
  available_quantity TEXT,
  price_per_unit TEXT,
  incoterm TEXT, -- Terms of Sale – Incoterm
  payment_method TEXT,
  shipping_details TEXT,
  packaging TEXT,
  offer_validity TEXT,
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on suppliers table
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for suppliers
CREATE POLICY "Users can view all suppliers" 
ON public.suppliers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own supplier profile" 
ON public.suppliers 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing supplier data (account_type_id = 1) from companies to suppliers
INSERT INTO public.suppliers (
  user_id, name, email, phone, address, cnpj, sif_registration, contact_person,
  product_types, products, available_certifications, available_quantity,
  price_per_unit, incoterm, payment_method, shipping_details, packaging,
  offer_validity, additional_comments, created_at, updated_at
)
SELECT 
  user_id, name, email, phone, address, cnpj, sif_registration, contact_person,
  product_types, products, available_certifications, available_quantity,
  price_per_unit, incoterm, payment_method, shipping_details, packaging,
  offer_validity, additional_comments, created_at, updated_at
FROM public.companies 
WHERE account_type_id = 1;

-- Remove supplier-specific columns from companies table
ALTER TABLE public.companies 
DROP COLUMN IF EXISTS sif_registration,
DROP COLUMN IF EXISTS contact_person,
DROP COLUMN IF EXISTS product_types,
DROP COLUMN IF EXISTS products,
DROP COLUMN IF EXISTS available_certifications,
DROP COLUMN IF EXISTS available_quantity,
DROP COLUMN IF EXISTS price_per_unit,
DROP COLUMN IF EXISTS incoterm,
DROP COLUMN IF EXISTS payment_method,
DROP COLUMN IF EXISTS shipping_details,
DROP COLUMN IF EXISTS packaging,
DROP COLUMN IF EXISTS offer_validity,
DROP COLUMN IF EXISTS additional_comments;

-- Delete supplier records from companies table since they're now in suppliers table
DELETE FROM public.companies WHERE account_type_id = 1;