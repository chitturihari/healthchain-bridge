
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
  eth_address TEXT NOT NULL,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(aadhar_number),
  UNIQUE(eth_address)
);

-- Create doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  specialized_areas TEXT[] NOT NULL,
  phone_number TEXT NOT NULL,
  eth_address TEXT NOT NULL,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(eth_address)
);

-- Create doctor_patient_access table for managing access control
CREATE TABLE doctor_patient_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_revoked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient_access ENABLE ROW LEVEL SECURITY;

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

-- Doctor-Patient Access policies
CREATE POLICY "Doctors can view their patient access"
ON doctor_patient_access FOR SELECT
USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view their doctor access"
ON doctor_patient_access FOR SELECT
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can grant access to doctors"
ON doctor_patient_access FOR INSERT
WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Patients can revoke access from doctors"
ON doctor_patient_access FOR UPDATE
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

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

CREATE TRIGGER update_doctor_patient_access_updated_at
BEFORE UPDATE ON doctor_patient_access
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
