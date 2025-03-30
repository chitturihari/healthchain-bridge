
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '@/components/layout/Layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createPatientProfile, updatePatientProfile, uploadProfilePhoto } from '@/lib/supabase';
import { registerPatient } from '@/lib/blockchain';

const patientProfileSchema = z.object({
  full_name: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  date_of_birth: z.string().min(1, { message: 'Date of birth is required' }),
  blood_group: z.string().min(1, { message: 'Blood group is required' }),
  weight: z.coerce.number().min(1, { message: 'Weight must be greater than 0' }),
  aadhar_number: z.string().length(12, { message: 'Aadhar number must be 12 digits' }),
  phone_number: z.string().length(10, { message: 'Phone number must be 10 digits' }),
  is_married: z.boolean().default(false),
});

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user, patientProfile, refreshUser, ethAddress, isWeb3Connected, connectWallet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  
  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      full_name: patientProfile?.full_name || '',
      date_of_birth: patientProfile?.date_of_birth || '',
      blood_group: patientProfile?.blood_group || '',
      weight: patientProfile?.weight || 0,
      aadhar_number: patientProfile?.aadhar_number || '',
      phone_number: patientProfile?.phone_number || '',
      is_married: patientProfile?.is_married || false,
    },
  });

  // Update form when patientProfile changes
  useEffect(() => {
    if (patientProfile) {
      form.reset({
        full_name: patientProfile.full_name,
        date_of_birth: patientProfile.date_of_birth,
        blood_group: patientProfile.blood_group,
        weight: patientProfile.weight,
        aadhar_number: patientProfile.aadhar_number,
        phone_number: patientProfile.phone_number,
        is_married: patientProfile.is_married,
      });
    }
  }, [patientProfile, form]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      
      // Create URL preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConnectWallet = async () => {
    if (!isWeb3Connected) {
      await connectWallet();
    }
  };

  const onSubmit = async (data: PatientProfileFormValues) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Connect to blockchain if not connected
      if (!isWeb3Connected) {
        const connected = await connectWallet();
        if (!connected) {
          toast.error('Please connect your Ethereum wallet to continue');
          setIsLoading(false);
          return;
        }
      }
      
      let photoUrl = patientProfile?.profile_photo_url;
      
      // Upload profile photo if provided
      if (profilePhoto) {
        photoUrl = await uploadProfilePhoto(user.id, profilePhoto);
      }
      
      const profileData = {
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        blood_group: data.blood_group,
        weight: data.weight,
        aadhar_number: data.aadhar_number,
        phone_number: data.phone_number,
        is_married: data.is_married,
        user_id: user.id,
        profile_photo_url: photoUrl || '',
      };
      
      // Create or update profile in Supabase
      if (patientProfile) {
        await updatePatientProfile(user.id, profileData);
      } else {
        await createPatientProfile(profileData);
      }
      
      // Register patient on blockchain
      await registerPatient(
        data.full_name,
        data.date_of_birth,
        data.weight,
        170, // Default height (can be updated later)
        data.aadhar_number,
        data.blood_group,
        data.phone_number,
        data.is_married
      );
      
      await refreshUser();
      toast.success('Profile updated successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center">
            <p>Please sign in to access this page</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Complete Your Patient Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={profilePhotoPreview || patientProfile?.profile_photo_url} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-lg">
                    {form.getValues().full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Upload a profile photo</p>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePhotoChange} 
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Wallet Connection</h3>
                  <Button 
                    type="button" 
                    variant={ethAddress ? 'outline' : 'default'} 
                    onClick={handleConnectWallet} 
                    disabled={!!ethAddress}
                  >
                    {ethAddress ? 'Wallet Connected' : 'Connect Wallet'}
                  </Button>
                </div>
                {ethAddress && (
                  <p className="text-sm text-muted-foreground">
                    Connected address: {ethAddress.substring(0, 6)}...{ethAddress.substring(ethAddress.length - 4)}
                  </p>
                )}
                {!ethAddress && (
                  <p className="text-sm text-muted-foreground">
                    You need to connect your Ethereum wallet to use this application
                  </p>
                )}
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your full name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="blood_group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bloodGroups.map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" placeholder="Enter your weight" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="aadhar_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhar Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="12-digit Aadhar number" maxLength={12} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10-digit phone number" maxLength={10} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="is_married"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Marital Status</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Check this box if you are married
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !ethAddress}
                  >
                    {isLoading ? 'Saving...' : patientProfile ? 'Update Profile' : 'Create Profile'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile;
