-- Create bank_guarantees table for storing bank guarantee registration data
CREATE TABLE public.bank_guarantees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant TEXT,
  beneficiary TEXT,
  guarantor_bank TEXT,
  underlying_transaction_reference TEXT,
  guarantee_amount TEXT,
  currency TEXT,
  expiry_date DATE,
  terms_for_drawing TEXT,
  form_of_presentation TEXT,
  charges TEXT,
  advising_bank TEXT,
  governing_rules TEXT,
  additional_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bank_guarantees table
ALTER TABLE public.bank_guarantees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bank_guarantees
CREATE POLICY "Users can view all bank guarantees" 
ON public.bank_guarantees 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own bank guarantee profile" 
ON public.bank_guarantees 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bank_guarantees_updated_at
BEFORE UPDATE ON public.bank_guarantees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();