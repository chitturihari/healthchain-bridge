
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  supabase, 
  UserData, 
  getCurrentUser, 
  getPatientProfile, 
  getDoctorProfile,
  PatientData,
  DoctorData,
  updateUserEthAddress
} from '@/lib/supabase';
import { toast } from 'sonner';
import { getWalletAddress, connectToBlockchain } from '@/lib/blockchain';

type AuthContextType = {
  isLoading: boolean;
  user: UserData | null;
  patientProfile: PatientData | null;
  doctorProfile: DoctorData | null;
  ethAddress: string | null;
  isWeb3Connected: boolean;
  refreshUser: () => Promise<void>;
  connectWallet: () => Promise<string | null>;
  updateEthAddress: (address: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientData | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorData | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await refreshUser();
      } else {
        setUser(null);
        setPatientProfile(null);
        setDoctorProfile(null);
      }
      setIsLoading(false);
    });

    // Initial load
    refreshUser().then(() => setIsLoading(false));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for Web3 connection
  useEffect(() => {
    const checkWeb3 = async () => {
      try {
        const address = await getWalletAddress();
        if (address) {
          setEthAddress(address);
          setIsWeb3Connected(true);
          
          // If user is logged in, update their eth address in Supabase if it's not set
          if (user && !user.eth_address && address) {
            await updateEthAddress(address);
          }
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };

    checkWeb3();
  }, [user]);

  // Connect wallet function
  async function connectWallet() {
    try {
      const connected = await connectToBlockchain();
      if (connected) {
        const address = await getWalletAddress();
        setEthAddress(address);
        setIsWeb3Connected(true);
        
        // Update user record if logged in
        if (user && address) {
          await updateEthAddress(address);
        }
        
        toast.success('Wallet connected successfully');
        return address;
      } else {
        toast.error('Failed to connect wallet');
        return null;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Error connecting wallet');
      return null;
    }
  }
  
  // Update eth address in Supabase
  async function updateEthAddress(address: string) {
    try {
      if (user) {
        await updateUserEthAddress(user.id, address);
        setUser({
          ...user,
          eth_address: address
        });
      }
    } catch (error) {
      console.error('Error updating eth address:', error);
    }
  }

  // Refresh user data
  async function refreshUser() {
    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        setUser(null);
        setPatientProfile(null);
        setDoctorProfile(null);
        return;
      }

      const userData = {
        id: authUser.id,
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as 'doctor' | 'patient') || 'patient',
        eth_address: authUser.user_metadata?.eth_address,
        created_at: authUser.created_at
      };
      
      setUser(userData);

      // Fetch profile based on role
      if (userData.role === 'patient') {
        try {
          const patientData = await getPatientProfile(userData.id);
          setPatientProfile(patientData);
          setDoctorProfile(null);
        } catch (error) {
          console.error('Error fetching patient profile:', error);
        }
      } else if (userData.role === 'doctor') {
        try {
          const doctorData = await getDoctorProfile(userData.id);
          setDoctorProfile(doctorData);
          setPatientProfile(null);
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }

  return (
    <AuthContext.Provider value={{
      isLoading,
      user,
      patientProfile,
      doctorProfile,
      ethAddress,
      isWeb3Connected,
      refreshUser,
      connectWallet,
      updateEthAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
