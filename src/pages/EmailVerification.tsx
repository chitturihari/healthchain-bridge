
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Get email from location state
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location]);
  
  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Signing in with:", email);
      const signInResult = await signIn(email, password);
      
      if (!signInResult?.user) {
        throw new Error('Failed to sign in. Please check your credentials.');
      }
      
      console.log("Sign in successful, refreshing user data");
      await refreshUser();
      toast.success('Signed in successfully');
      
      // Direct navigation
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // More specific error message based on the error type
      let errorMessage = 'Failed to sign in';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before signing in.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-md py-12 md:py-24">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                Once verified, you can sign in to your account below:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!location.state?.email}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
            
            <div className="text-center">
              <Button 
                variant="link" 
                className="text-sm text-muted-foreground"
                onClick={() => navigate('/signin')}
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmailVerification;
