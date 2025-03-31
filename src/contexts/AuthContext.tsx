
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  supabase, 
  UserData, 
  getCurrentUser, 
  getPatientProfile, 
  getDoctorProfile,
  PatientData,
  DoctorData,
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
  setPatientProfile: (profile: PatientData | null) => void;
  setDoctorProfile: (profile: DoctorData | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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
      console.log("Auth state changed, event:", event);
      
      if (session?.user) {
        console.log("Session user found, refreshing user data");
        await refreshUser();
      } else {
        console.log("No session user, clearing user data");
        setUser(null);
        setPatientProfile(null);
        setDoctorProfile(null);
      }
      setIsLoading(false);
    });

    // Initial load
    refreshUser().then(() => {
      console.log("Initial user data loaded");
      setIsLoading(false);
    });

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
          console.log("Web3 wallet connected:", address);
          setEthAddress(address);
          setIsWeb3Connected(true);
        } else {
          console.log("No Web3 wallet connected");
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
      console.log("Attempting to connect wallet");
      const connected = await connectToBlockchain();
      if (connected) {
        const address = await getWalletAddress();
        console.log("Wallet connected:", address);
        setEthAddress(address);
        setIsWeb3Connected(true);
        
        toast.success('Wallet connected successfully');
        return address;
      } else {
        console.log("Failed to connect wallet");
        toast.error('Failed to connect wallet');
        return null;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Error connecting wallet');
      return null;
    }
  }

  // Refresh user data
  async function refreshUser() {
    try {
      console.log("Refreshing user data");
      const authUser = await getCurrentUser();
      if (!authUser) {
        console.log("No authenticated user found");
        setUser(null);
        setPatientProfile(null);
        setDoctorProfile(null);
        return;
      }

      console.log("User authenticated:", authUser);
      console.log("User metadata:", authUser.user_metadata);

      const userData = {
        id: authUser.id,
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as 'doctor' | 'patient') || 'patient',
        eth_address: authUser.user_metadata?.eth_address,
        created_at: authUser.created_at
      };
      
      console.log("Setting user data:", userData);
      setUser(userData);

      // Fetch profile based on role
      if (userData.role === 'patient') {
        try {
          console.log("Fetching patient profile for user:", userData.id);
          const patientData = await getPatientProfile(userData.id);
          console.log("Patient profile fetched:", patientData);
          setPatientProfile(patientData);
          setDoctorProfile(null);
          
          // Update ethAddress if available in profile
          if (patientData?.eth_address) {
            setEthAddress(patientData.eth_address);
          }
        } catch (error) {
          console.error('Error fetching patient profile:', error);
          // Allow continuing even if profile fetch fails
        }
      } else if (userData.role === 'doctor') {
        try {
          console.log("Fetching doctor profile for user:", userData.id);
          const doctorData = await getDoctorProfile(userData.id);
          console.log("Doctor profile fetched:", doctorData);
          setDoctorProfile(doctorData);
          setPatientProfile(null);
          
          // Update ethAddress if available in profile
          if (doctorData?.eth_address) {
            setEthAddress(doctorData.eth_address);
          }
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
          // Allow continuing even if profile fetch fails
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
      setPatientProfile,
      setDoctorProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
