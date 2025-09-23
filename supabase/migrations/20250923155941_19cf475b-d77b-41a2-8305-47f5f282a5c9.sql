-- Create buyers table with buyer-specific fields
CREATE TABLE public.buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  business_number TEXT,
  contact_person TEXT,
  product_requirements TEXT[],
  quantity_required TEXT,
  target_price TEXT,
  delivery_destination TEXT,
  delivery_conditions TEXT,
  required_delivery_date DATE,
  preferred_payment_method TEXT,
  financing_needs TEXT,
  certification_requirements TEXT[],
  insurance_requirements TEXT,
  bank_guarantee_details TEXT,
  letter_of_credit_details TEXT,
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on buyers table
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for buyers
CREATE POLICY "Users can view all buyers" 
ON public.buyers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own buyer profile" 
ON public.buyers 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_buyers_updated_at
BEFORE UPDATE ON public.buyers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();