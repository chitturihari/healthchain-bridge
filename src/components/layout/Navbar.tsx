
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, LogOut, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';

const Navbar: React.FC = () => {
  const { user, patientProfile, doctorProfile } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <div className="relative size-8 rounded-full bg-gradient-to-br from-health-500 to-medical-600 flex items-center justify-center">
            <div className="absolute animate-pulse-ring size-8 rounded-full bg-health-500/50" />
            <span className="font-bold text-white text-xl">H</span>
          </div>
          <span className="hidden md:block font-bold text-xl">HealthDecentro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 flex-1">
          {user ? (
            user.role === 'patient' ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/dashboard') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/vitals" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/vitals') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  Vitals
                </Link>
                <Link 
                  to="/documents" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/documents') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  Documents
                </Link>
                <Link 
                  to="/doctors" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/doctors') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  Doctors
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/dashboard') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/patients" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/patients') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  Patients
                </Link>
              </>
            )
          ) : (
            <>
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-foreground/60'}`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/about') ? 'text-primary' : 'text-foreground/60'}`}
              >
                About
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={patientProfile?.profile_photo_url || doctorProfile?.profile_photo_url} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {(patientProfile?.full_name || doctorProfile?.full_name || user.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="relative size-8 rounded-full bg-gradient-to-br from-health-500 to-medical-600 flex items-center justify-center">
                      <span className="font-bold text-white text-xl">H</span>
                    </div>
                    <span className="font-bold text-xl">HealthDecentro</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                <nav className="flex flex-col gap-4">
                  {user ? (
                    user.role === 'patient' ? (
                      <>
                        <Link 
                          to="/dashboard" 
                          className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/dashboard') ? 'bg-accent font-medium' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/vitals" 
                          className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/vitals') ? 'bg-accent font-medium' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Vitals
                        </Link>
                        <Link 
                          to="/documents" 
                          className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/documents') ? 'bg-accent font-medium' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Documents
                        </Link>
                        <Link 
                          to="/doctors" 
                          className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/doctors') ? 'bg-accent font-medium' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Doctors
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link 
                          to="/dashboard" 
                          className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/dashboard') ? 'bg-accent font-medium' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/patients" 
                          className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/patients') ? 'bg-accent font-medium' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Patients
                        </Link>
                      </>
                    )
                  ) : (
                    <>
                      <Link 
                        to="/" 
                        className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/') ? 'bg-accent font-medium' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Home
                      </Link>
                      <Link 
                        to="/about" 
                        className={`px-2 py-1 text-lg rounded-md hover:bg-accent ${isActive('/about') ? 'bg-accent font-medium' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        About
                      </Link>
                    </>
                  )}
                </nav>
                
                <div className="mt-auto">
                  {user ? (
                    <div className="space-y-4">
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
