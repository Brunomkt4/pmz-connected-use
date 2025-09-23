-- Create carriers table with transport/logistics-specific fields
CREATE TABLE public.carriers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  license_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  vehicle_types TEXT[],
  capacity TEXT,
  service_areas TEXT[],
  certifications TEXT[],
  insurance_details TEXT,
  temperature_control BOOLEAN DEFAULT false,
  mode_of_transport TEXT[],
  origin_destinations TEXT[],
  estimated_transit_time TEXT,
  shipment_schedule TEXT,
  container_details TEXT,
  freight_cost TEXT,
  included_services TEXT[],
  documents_compliance TEXT[],
  tracking_support_details TEXT,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on carriers table
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for carriers
CREATE POLICY "Users can view all carriers" 
ON public.carriers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own carrier profile" 
ON public.carriers 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_carriers_updated_at
BEFORE UPDATE ON public.carriers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();