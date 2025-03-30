
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { ArrowRight, Lock, ShieldCheck, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background to-accent/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-balance">
                  Secure Medical Records on the Blockchain
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  HealthDecentro empowers patients to own and control their medical data while securely sharing it with authorized healthcare providers.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="gap-1.5">
                      Go to Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button size="lg" className="gap-1.5">
                        Get Started <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/signin">
                      <Button size="lg" variant="outline">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-lg bg-gradient-to-br from-health-500 to-medical-600 p-8 shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                <div className="relative flex flex-col items-center justify-center text-center text-white">
                  <div className="size-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <Lock className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Decentralized</h3>
                  <p className="text-white/80">Your medical data stored securely on the blockchain</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 size-24 rounded-lg bg-primary/20 backdrop-blur-md animate-float" />
              <div className="absolute -top-6 -left-6 size-20 rounded-lg bg-medical-500/20 backdrop-blur-md animate-float" style={{ animationDelay: "2s" }} />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose HealthDecentro
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform combines blockchain technology with user-friendly interfaces to revolutionize healthcare data management.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Secure Storage</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Medical files stored securely on IPFS via Pinata Cloud with blockchain verification.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Access Control</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Grant and revoke access to your medical records to specific healthcare providers.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Health Tracking</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Record and monitor vital health metrics with real-time visualization and trends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-accent/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
                Process
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A simple process to secure your medical data on the blockchain.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                1
              </div>
              <h3 className="text-xl font-bold">Register</h3>
              <p className="text-muted-foreground mt-2">
                Create an account as a patient or healthcare provider
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                2
              </div>
              <h3 className="text-xl font-bold">Connect Wallet</h3>
              <p className="text-muted-foreground mt-2">
                Link your Ethereum wallet for blockchain transactions
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                3
              </div>
              <h3 className="text-xl font-bold">Manage Records</h3>
              <p className="text-muted-foreground mt-2">
                Upload, track, and share your medical data securely
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="rounded-lg bg-gradient-to-r from-health-500 to-medical-600 p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]" />
            <div className="absolute inset-0 bg-gradient-to-r from-medical-600/60 to-health-500/60" />
            <div className="relative flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 text-white">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Take Control of Your Health Data Today
                </h2>
                <p className="mx-auto max-w-[700px] text-white/80 md:text-xl/relaxed">
                  Join thousands of patients and healthcare providers already using our platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" variant="secondary" className="gap-1.5">
                      Go to Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button size="lg" variant="secondary" className="gap-1.5">
                        Create Account <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/signin">
                      <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                        Learn More
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
