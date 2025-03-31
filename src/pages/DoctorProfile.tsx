
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { createDoctorProfile, updateDoctorProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';

// Form schema
const formSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  qualification: z.string().min(2, 'Qualification must be at least 2 characters'),
  specialized_areas: z.string().min(2, 'Specialized areas must be at least 2 characters'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user, doctorProfile, setDoctorProfile, isLoading, isWeb3Connected, connectWallet } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      qualification: '',
      specialized_areas: '',
      phone_number: '',
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (doctorProfile) {
      form.reset({
        full_name: doctorProfile.full_name,
        qualification: doctorProfile.qualification,
        specialized_areas: doctorProfile.specialized_areas.join(', '),
        phone_number: doctorProfile.phone_number,
      });
      
      if (doctorProfile.profile_photo_url) {
        setPreviewImage(doctorProfile.profile_photo_url);
      }
    }
  }, [doctorProfile, form]);

  // If user is not a doctor, redirect
  useEffect(() => {
    if (!isLoading && user && user.role !== 'doctor') {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Check if Web3 is connected
      if (!isWeb3Connected) {
        await connectWallet();
      }
      
      // Process specialized areas
      const specializedAreasArray = values.specialized_areas
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);
      
      // Upload profile photo if selected
      let profilePhotoUrl = doctorProfile?.profile_photo_url || '';
      
      if (selectedFile) {
        // Use the file upload function from the supabase library
        // For simplicity, we're just setting the URL directly here
        profilePhotoUrl = URL.createObjectURL(selectedFile);
        // In a real app, you would upload this to Supabase storage or another service
      }
      
      if (doctorProfile) {
        // Update existing profile
        const updatedDoctor = await updateDoctorProfile(user.id, {
          full_name: values.full_name,
          qualification: values.qualification,
          specialized_areas: specializedAreasArray,
          phone_number: values.phone_number,
          eth_address: user.eth_address || '', // Make sure to include eth_address
          profile_photo_url: profilePhotoUrl,
        });
        
        setDoctorProfile(updatedDoctor);
        toast({
          title: "Profile updated",
          description: "Your doctor profile has been updated successfully.",
        });
      } else {
        // Create new profile
        const newDoctor = await createDoctorProfile({
          full_name: values.full_name,
          qualification: values.qualification,
          specialized_areas: specializedAreasArray,
          phone_number: values.phone_number,
          user_id: user.id,
          eth_address: user.eth_address || '', // Make sure to include eth_address
          profile_photo_url: profilePhotoUrl,
        });
        
        setDoctorProfile(newDoctor);
        toast({
          title: "Profile created",
          description: "Your doctor profile has been created successfully.",
        });
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Doctor Profile</CardTitle>
            <CardDescription>
              {doctorProfile ? "Update your doctor details" : "Complete your doctor profile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={previewImage || ''} />
                <AvatarFallback className="text-lg">
                  {form.watch('full_name')?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="relative">
                <Input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <label
                  htmlFor="profilePhoto"
                  className="cursor-pointer flex items-center space-x-2 text-sm"
                >
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    {previewImage ? 'Change Image' : 'Upload Image'}
                  </Button>
                </label>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Doe" {...field} />
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
                        <Input placeholder="MBBS, MD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialized_areas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialized Areas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Cardiology, Neurology, etc. (comma separated)" 
                          {...field} 
                        />
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
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!isWeb3Connected && (
                  <div className="rounded-md border p-4 bg-muted/50 my-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Connect your wallet to save your profile.
                    </p>
                    <Button 
                      type="button" 
                      onClick={connectWallet} 
                      variant="outline"
                      size="sm"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !isWeb3Connected}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {doctorProfile ? "Update Profile" : "Create Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
