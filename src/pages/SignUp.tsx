
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { signUp, signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getWalletAddress, connectToBlockchain } from '@/lib/blockchain';

const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
    },
  });

  useEffect(() => {
    // Check if wallet is already connected
    const checkWallet = async () => {
      try {
        const address = await getWalletAddress();
        if (address) {
          setWalletAddress(address);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };

    checkWallet();
  }, []);

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      const connected = await connectToBlockchain();
      if (connected) {
        const address = await getWalletAddress();
        setWalletAddress(address);
        toast.success('Wallet connected successfully');
      } else {
        toast.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Error connecting wallet');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      // Register the user with wallet address if available
      await signUp(data.email, data.password, data.role, walletAddress || undefined);
      
      // Auto sign in after registration
      const signInResult = await signIn(data.email, data.password);
      
      if (!signInResult?.user) {
        throw new Error('Failed to sign in after registration.');
      }
      
      console.log("Sign in successful, refreshing user data");
      await refreshUser();
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12 md:py-24">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Join HealthDecentro to securely manage your medical records</p>
        </div>
        
        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        type="email" 
                        {...field} 
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Create a password" 
                        type="password" 
                        {...field} 
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters with uppercase, lowercase and numbers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Confirm your password" 
                        type="password" 
                        {...field} 
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="patient" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Patient
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="doctor" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Healthcare Provider
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ethereum Wallet</span>
                  {walletAddress ? (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Connected:</span>
                      <span className="text-xs font-mono text-green-600">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
                    </div>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={connectWallet}
                      disabled={isConnectingWallet}
                    >
                      {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
