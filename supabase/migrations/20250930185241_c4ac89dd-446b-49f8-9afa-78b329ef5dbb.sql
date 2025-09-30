-- Create account_types table
CREATE TABLE public.account_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default account types
INSERT INTO public.account_types (id, name, description) VALUES
  (1, 'Supplier', 'Meat supplier/exporter'),
  (2, 'Buyer', 'Meat buyer/importer'),
  (3, 'Transport', 'Transportation company'),
  (4, 'Certification', 'Certification body'),
  (5, 'Bank', 'Financial institution');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  account_type_id INTEGER REFERENCES public.account_types(id),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notifications_enabled BOOLEAN DEFAULT true,
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  cnpj TEXT,
  account_type_id INTEGER REFERENCES public.account_types(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  products TEXT[] DEFAULT '{}',
  product_types TEXT[] DEFAULT '{}',
  sif_registration TEXT,
  contact_person TEXT,
  available_certifications TEXT[] DEFAULT '{}',
  production_capacity TEXT,
  export_experience TEXT,
  quality_standards TEXT[] DEFAULT '{}',
  geographical_focus TEXT[] DEFAULT '{}',
  minimum_order_quantity TEXT,
  lead_time TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buyers table
CREATE TABLE public.buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  business_number TEXT,
  contact_person TEXT,
  product_requirements TEXT[] DEFAULT '{}',
  quantity_required TEXT,
  target_price TEXT,
  delivery_terms TEXT,
  payment_terms TEXT,
  quality_requirements TEXT[] DEFAULT '{}',
  certification_requirements TEXT[] DEFAULT '{}',
  import_licenses TEXT[] DEFAULT '{}',
  preferred_origins TEXT[] DEFAULT '{}',
  delivery_schedule TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bank_guarantees table
CREATE TABLE public.bank_guarantees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant TEXT NOT NULL,
  beneficiary TEXT NOT NULL,
  guarantor_bank TEXT NOT NULL,
  underlying_transaction_reference TEXT,
  guarantee_amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  terms_for_drawing TEXT,
  applicable_law TEXT,
  dispute_resolution TEXT,
  amendments TEXT,
  status TEXT DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_guarantees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_types (public read)
CREATE POLICY "Account types are viewable by everyone"
  ON public.account_types FOR SELECT
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "Users can view their own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for suppliers
CREATE POLICY "Users can view their own supplier data"
  ON public.suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplier data"
  ON public.suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplier data"
  ON public.suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplier data"
  ON public.suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for buyers
CREATE POLICY "Users can view their own buyer data"
  ON public.buyers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buyer data"
  ON public.buyers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyer data"
  ON public.buyers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buyer data"
  ON public.buyers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for bank_guarantees
CREATE POLICY "Users can view their own bank guarantees"
  ON public.bank_guarantees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank guarantees"
  ON public.bank_guarantees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank guarantees"
  ON public.bank_guarantees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank guarantees"
  ON public.bank_guarantees FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON public.buyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_guarantees_updated_at
  BEFORE UPDATE ON public.bank_guarantees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, account_type_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    (NEW.raw_user_meta_data->>'account_type_id')::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();