-- Create carriers table for transportation companies
CREATE TABLE public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  license_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  vehicle_types TEXT[] DEFAULT '{}',
  capacity TEXT,
  service_areas TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  insurance_details TEXT,
  temperature_control BOOLEAN DEFAULT false,
  mode_of_transport TEXT[] DEFAULT '{}',
  origin_destinations TEXT[] DEFAULT '{}',
  estimated_transit_time TEXT,
  shipment_schedule TEXT,
  container_details TEXT,
  freight_cost TEXT,
  included_services TEXT[] DEFAULT '{}',
  documents_compliance TEXT[] DEFAULT '{}',
  tracking_support_details TEXT,
  special_requirements TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carriers
CREATE POLICY "Users can view their own carrier data"
  ON public.carriers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carrier data"
  ON public.carriers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carrier data"
  ON public.carriers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carrier data"
  ON public.carriers FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_carriers_updated_at
  BEFORE UPDATE ON public.carriers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();