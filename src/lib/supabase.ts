import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a check to ensure we don't create a client with empty values
if (!supabaseUrl) {
  console.error('Missing Supabase URL. Please set the VITE_SUPABASE_URL environment variable.');
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key. Please set the VITE_SUPABASE_ANON_KEY environment variable.');
}

// Use dummy values for local development if environment variables are not set
const effectiveUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const effectiveKey = supabaseAnonKey || 'placeholder-key-for-development-only';

export const supabase = createClient(effectiveUrl, effectiveKey);

export type UserRole = 'doctor' | 'patient';

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  eth_address?: string;
  created_at: string;
}

export interface PatientData {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  blood_group: string;
  weight: number;
  aadhar_number: string;
  phone_number: string;
  is_married: boolean;
  eth_address: string;
  profile_photo_url?: string;
  created_at: string;
}

export interface DoctorData {
  id: string;
  user_id: string;
  full_name: string;
  qualification: string;
  specialized_areas: string[];
  phone_number: string;
  eth_address: string;
  profile_photo_url?: string;
  created_at: string;
}

// Interface for doctor-patient access relationships
export interface DoctorPatientAccess {
  id: string;
  doctor_id: string;
  patient_id: string;
  access_granted_at: string;
  access_revoked_at?: string;
  is_active: boolean;
}

// Simplified authentication functions
export async function signUp(email: string, password: string, role: UserRole, eth_address: string) {
  console.log(`Signing up user with email: ${email}, role: ${role}, and eth_address: ${eth_address}`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          role,
          eth_address
        },
        // No email confirmation required
        emailRedirectTo: undefined
      }
    });
    
    if (error) {
      console.error("Sign up error:", error);
      throw error;
    }
    
    console.log("Sign up successful:", data);
    return data;
  } catch (error) {
    console.error("Sign up error caught:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  console.log(`Signing in user with email: ${email}`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }
    
    console.log("Sign in successful:", data);
    return data;
  } catch (error) {
    console.error("Sign in error caught:", error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
    throw error;
  }
  console.log("Sign out successful");
}

export async function getCurrentUser() {
  console.log("Getting current user");
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Get current user error:", error);
      throw error;
    }
    
    console.log("Current user retrieved:", user);
    return user;
  } catch (error) {
    console.error("Get current user error caught:", error);
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    console.error("Update password error:", error);
    throw error;
  }
  
  console.log("Password updated successfully");
}

export async function resetPassword(email: string) {
  console.log(`Sending password reset email to: ${email}`);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/change-password`,
  });
  
  if (error) {
    console.error("Reset password error:", error);
    throw error;
  }
  
  console.log("Password reset email sent successfully");
}

// Data functions
export async function createPatientProfile(patientData: Omit<PatientData, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function createDoctorProfile(doctorData: Omit<DoctorData, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('doctors')
    .insert([doctorData])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function getPatientProfile(userId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data as PatientData;
}

export async function getDoctorProfile(userId: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data as DoctorData;
}

export async function updatePatientProfile(userId: string, updates: Partial<PatientData>) {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('user_id', userId)
    .select();
  
  if (error) throw error;
  return data[0] as PatientData;
}

export async function updateDoctorProfile(userId: string, updates: Partial<DoctorData>) {
  const { data, error } = await supabase
    .from('doctors')
    .update(updates)
    .eq('user_id', userId)
    .select();
  
  if (error) throw error;
  return data[0] as DoctorData;
}

// Doctor-Patient Relationship Functions
export async function grantAccessToDoctor(patientId: string, doctorId: string) {
  const { data, error } = await supabase
    .from('doctor_patient_access')
    .insert([
      { 
        doctor_id: doctorId,
        patient_id: patientId,
        is_active: true
      }
    ])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function revokeAccessFromDoctor(accessId: string) {
  const { data, error } = await supabase
    .from('doctor_patient_access')
    .update({ 
      is_active: false,
      access_revoked_at: new Date().toISOString()
    })
    .eq('id', accessId)
    .select();
  
  if (error) throw error;
  return data[0];
}

// Get all patients that a doctor has access to
export async function getDoctorPatients(doctorId: string) {
  console.log(`Getting patients for doctor: ${doctorId}`);
  const { data, error } = await supabase
    .from('doctor_patient_access')
    .select(`
      id,
      patient_id,
      access_granted_at,
      access_revoked_at,
      is_active,
      patients:patient_id (
        id,
        full_name,
        date_of_birth,
        blood_group,
        weight,
        phone_number,
        profile_photo_url
      )
    `)
    .eq('doctor_id', doctorId)
    .eq('is_active', true);
  
  if (error) {
    console.error("Error getting doctor patients:", error);
    throw error;
  }
  
  console.log("Doctor patients retrieved:", data);
  return data;
}

// Get all doctors that a patient has given access to
export async function getPatientDoctors(patientId: string) {
  const { data, error } = await supabase
    .from('doctor_patient_access')
    .select(`
      id,
      doctor_id,
      access_granted_at,
      access_revoked_at,
      is_active,
      doctors:doctor_id (
        id,
        full_name,
        qualification,
        specialized_areas,
        phone_number,
        profile_photo_url
      )
    `)
    .eq('patient_id', patientId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}

// File storage
export async function uploadProfilePhoto(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `profiles/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('profile_photos')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('profile_photos')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}
