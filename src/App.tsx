
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import EmailVerification from "./pages/EmailVerification";
import PatientProfile from "./pages/PatientProfile";
import DoctorProfile from "./pages/DoctorProfile";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PatientVitals from "./pages/PatientVitals";
import PatientDocuments from "./pages/PatientDocuments";
import DoctorPatients from "./pages/DoctorPatients";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient-profile" element={<PatientProfile />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/vitals" element={<PatientVitals />} />
            <Route path="/documents" element={<PatientDocuments />} />
            <Route path="/patients" element={<DoctorPatients />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
