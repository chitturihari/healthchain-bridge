
-- Create users table extension (built-in with Supabase)
-- This is already created by Supabase by default

-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  blood_group TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  aadhar_number TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_married BOOLEAN DEFAULT FALSE,
  eth_address TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(aadhar_number)
);

-- Create doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  specialized_areas TEXT[] NOT NULL,
  phone_number TEXT NOT NULL,
  eth_address TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create patient-doctor access relationship table
CREATE TABLE patient_doctor_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_revoked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, doctor_id)
);

-- Create Row Level Security (RLS) policies

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_doctor_access ENABLE ROW LEVEL SECURITY;

-- Patients table policies
CREATE POLICY "Users can view their own patient profile"
ON patients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patient profile"
ON patients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient profile"
ON patients FOR UPDATE
USING (auth.uid() = user_id);

-- Doctors table policies
CREATE POLICY "Users can view their own doctor profile"
ON doctors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own doctor profile"
ON doctors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doctor profile"
ON doctors FOR UPDATE
USING (auth.uid() = user_id);

-- Patient-doctor access policies
CREATE POLICY "Patients can view their doctor access records"
ON patient_doctor_access FOR SELECT
USING ((SELECT user_id FROM patients WHERE id = patient_id) = auth.uid());

CREATE POLICY "Doctors can view their patient access records"
ON patient_doctor_access FOR SELECT
USING ((SELECT user_id FROM doctors WHERE id = doctor_id) = auth.uid());

CREATE POLICY "Patients can create doctor access records"
ON patient_doctor_access FOR INSERT
WITH CHECK ((SELECT user_id FROM patients WHERE id = patient_id) = auth.uid());

CREATE POLICY "Patients can update doctor access records"
ON patient_doctor_access FOR UPDATE
USING ((SELECT user_id FROM patients WHERE id = patient_id) = auth.uid());

-- Create storage buckets for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile_photos', 'profile_photos', true);

-- Set up storage bucket policies
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile_photos');

CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile_photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile_photos' AND owner = auth.uid());

-- Set up updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
