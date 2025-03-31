import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { createPatientProfile, updatePatientProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';

// Form schema
const formSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  date_of_birth: z.string().min(10, 'Please enter a valid date'),
  blood_group: z.string().min(1, 'Please select a blood group'),
  weight: z.coerce.number().min(1, 'Weight must be at least 1 kg'),
  aadhar_number: z.string().min(12, 'Aadhar number must be 12 digits'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters'),
  is_married: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user, patientProfile, setPatientProfile, isLoading, isWeb3Connected, connectWallet } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      date_of_birth: '',
      blood_group: '',
      weight: 0,
      aadhar_number: '',
      phone_number: '',
      is_married: false,
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (patientProfile) {
      form.reset({
        full_name: patientProfile.full_name,
        date_of_birth: new Date(patientProfile.date_of_birth).toISOString().split('T')[0],
        blood_group: patientProfile.blood_group,
        weight: patientProfile.weight,
        aadhar_number: patientProfile.aadhar_number,
        phone_number: patientProfile.phone_number,
        is_married: patientProfile.is_married,
      });
      
      if (patientProfile.profile_photo_url) {
        setPreviewImage(patientProfile.profile_photo_url);
      }
    }
  }, [patientProfile, form]);

  // If user is not a patient, redirect
  useEffect(() => {
    if (!isLoading && user && user.role !== 'patient') {
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
      
      // Upload profile photo if selected
      let profilePhotoUrl = patientProfile?.profile_photo_url || '';
      
      if (selectedFile) {
        // Use the file upload function from the supabase library
        // For simplicity, we're just setting the URL directly here
        profilePhotoUrl = URL.createObjectURL(selectedFile);
        // In a real app, you would upload this to Supabase storage or another service
      }
      
      if (patientProfile) {
        // Update existing profile
        const updatedPatient = await updatePatientProfile(user.id, {
          full_name: values.full_name,
          date_of_birth: values.date_of_birth,
          blood_group: values.blood_group,
          weight: values.weight,
          aadhar_number: values.aadhar_number,
          phone_number: values.phone_number,
          is_married: values.is_married,
          eth_address: user.eth_address || '', // Make sure to include eth_address
          profile_photo_url: profilePhotoUrl,
        });
        
        setPatientProfile(updatedPatient);
        toast({
          title: "Profile updated",
          description: "Your patient profile has been updated successfully.",
        });
      } else {
        // Create new profile
        const newPatient = await createPatientProfile({
          full_name: values.full_name,
          date_of_birth: values.date_of_birth,
          blood_group: values.blood_group,
          weight: values.weight,
          aadhar_number: values.aadhar_number,
          phone_number: values.phone_number,
          is_married: values.is_married,
          user_id: user.id,
          eth_address: user.eth_address || '', // Make sure to include eth_address
          profile_photo_url: profilePhotoUrl,
        });
        
        setPatientProfile(newPatient);
        toast({
          title: "Profile created",
          description: "Your patient profile has been created successfully.",
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
            <CardTitle>Patient Profile</CardTitle>
            <CardDescription>
              {patientProfile ? "Update your patient details" : "Complete your patient profile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={previewImage || ''} />
                <AvatarFallback className="text-lg">
                  {form.watch('full_name')?.charAt(0) || 'P'}
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
                        <Input placeholder="John Doe" {...field} />
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
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="blood_group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select blood group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </FormControl>
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
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="aadhar_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhar Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789012" {...field} />
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
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_married"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Marital Status</FormLabel>
                        <FormDescription>
                          Are you married?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                  {patientProfile ? "Update Profile" : "Create Profile"}
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

export default PatientProfile;
