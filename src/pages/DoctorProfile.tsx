
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createDoctorProfile, updateDoctorProfile, uploadProfilePhoto } from '@/lib/supabase';
import { registerDoctor } from '@/lib/blockchain';

const doctorProfileSchema = z.object({
  full_name: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  qualification: z.string().min(2, { message: 'Qualification is required' }),
  specialized_areas: z.string().min(2, { message: 'Specialized areas are required' }),
  phone_number: z.string().length(10, { message: 'Phone number must be 10 digits' }),
});

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>;

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user, doctorProfile, refreshUser, ethAddress, isWeb3Connected, connectWallet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  
  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      full_name: doctorProfile?.full_name || '',
      qualification: doctorProfile?.qualification || '',
      specialized_areas: doctorProfile?.specialized_areas?.join(', ') || '',
      phone_number: doctorProfile?.phone_number || '',
    },
  });

  // Update form when doctorProfile changes
  useEffect(() => {
    if (doctorProfile) {
      form.reset({
        full_name: doctorProfile.full_name,
        qualification: doctorProfile.qualification,
        specialized_areas: doctorProfile.specialized_areas.join(', '),
        phone_number: doctorProfile.phone_number,
      });
    }
  }, [doctorProfile, form]);

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

  const onSubmit = async (data: DoctorProfileFormValues) => {
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
      
      let photoUrl = doctorProfile?.profile_photo_url;
      
      // Upload profile photo if provided
      if (profilePhoto) {
        photoUrl = await uploadProfilePhoto(user.id, profilePhoto);
      }
      
      // Parse specialized areas from comma-separated string to array
      const specializedAreas = data.specialized_areas
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);
      
      const profileData = {
        full_name: data.full_name,
        qualification: data.qualification,
        specialized_areas: specializedAreas,
        phone_number: data.phone_number,
        user_id: user.id,
        profile_photo_url: photoUrl || '',
      };
      
      // Create or update profile in Supabase
      if (doctorProfile) {
        await updateDoctorProfile(user.id, profileData);
      } else {
        await createDoctorProfile(profileData);
      }
      
      // Register doctor on blockchain
      await registerDoctor(
        data.full_name,
        data.qualification,
        user.email,
        data.phone_number
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
              <CardTitle className="text-2xl">Complete Your Doctor Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={profilePhotoPreview || doctorProfile?.profile_photo_url} 
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
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualification</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="E.g., MBBS, MD, MS" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialized_areas"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Specialized Areas</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="E.g., Cardiology, Neurology, Pediatrics" />
                          </FormControl>
                          <FormDescription>
                            Enter specializations separated by commas
                          </FormDescription>
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
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !ethAddress}
                  >
                    {isLoading ? 'Saving...' : doctorProfile ? 'Update Profile' : 'Create Profile'}
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

export default DoctorProfile;
