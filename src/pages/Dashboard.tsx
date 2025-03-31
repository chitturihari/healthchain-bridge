
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ChevronRight, User, FileText, Calendar, CalendarClock, Stethoscope, Activity } from 'lucide-react';
import { getDoctorPatients, getPatientDoctors } from '@/lib/supabase';

interface PatientWithAccess {
  id: string;
  patient_id: string;
  access_granted_at: string;
  patients: {
    id: string;
    full_name: string;
    date_of_birth: string;
    blood_group: string;
    weight: number;
    phone_number: string;
    profile_photo_url?: string;
  }
}

interface DoctorWithAccess {
  id: string;
  doctor_id: string;
  access_granted_at: string;
  doctors: {
    id: string;
    full_name: string;
    qualification: string;
    specialized_areas: string[];
    phone_number: string;
    profile_photo_url?: string;
  }
}

const Dashboard = () => {
  const { user, patientProfile, doctorProfile, isLoading, isWeb3Connected, connectWallet } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState<PatientWithAccess[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithAccess[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  useEffect(() => {
    // Fetch patients if user is a doctor
    if (user?.role === 'doctor' && doctorProfile && activeTab === 'patients') {
      const fetchPatients = async () => {
        setIsLoadingPatients(true);
        try {
          const patientData = await getDoctorPatients(doctorProfile.id);
          setPatients(patientData);
        } catch (error) {
          console.error('Error fetching patients:', error);
        } finally {
          setIsLoadingPatients(false);
        }
      };
      
      fetchPatients();
    }
    
    // Fetch doctors if user is a patient
    if (user?.role === 'patient' && patientProfile && activeTab === 'doctors') {
      const fetchDoctors = async () => {
        setIsLoadingDoctors(true);
        try {
          const doctorData = await getPatientDoctors(patientProfile.id);
          setDoctors(doctorData);
        } catch (error) {
          console.error('Error fetching doctors:', error);
        } finally {
          setIsLoadingDoctors(false);
        }
      };
      
      fetchDoctors();
    }
  }, [user, doctorProfile, patientProfile, activeTab]);

  if (!isLoading && user) {
    if (user.role === 'patient' && !patientProfile) {
      return <Navigate to="/patient-profile" />;
    }
    if (user.role === 'doctor' && !doctorProfile) {
      return <Navigate to="/doctor-profile" />;
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {user.role === 'patient' ? 'Patient Dashboard' : 'Doctor Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {patientProfile?.full_name || doctorProfile?.full_name || user.email}
            </p>
          </div>
          
          {!isWeb3Connected && (
            <Button onClick={connectWallet} className="mt-4 md:mt-0">
              Connect Wallet
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage 
                    src={patientProfile?.profile_photo_url || doctorProfile?.profile_photo_url} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-xl">
                    {patientProfile?.full_name?.charAt(0) || 
                     doctorProfile?.full_name?.charAt(0) || 
                     user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">
                  {patientProfile?.full_name || doctorProfile?.full_name}
                </h3>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {user.role === 'patient' && patientProfile && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <span>{new Date(patientProfile.date_of_birth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Group:</span>
                      <span>{patientProfile.blood_group}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{patientProfile.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{patientProfile.phone_number}</span>
                    </div>
                  </>
                )}
                
                {user.role === 'doctor' && doctorProfile && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Qualification:</span>
                      <span>{doctorProfile.qualification}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground mb-1">Specialized Areas:</span>
                      <div className="flex flex-wrap gap-2">
                        {doctorProfile.specialized_areas.map((area, index) => (
                          <Badge key={index} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{doctorProfile.phone_number}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet Status:</span>
                  <span>
                    {isWeb3Connected ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Connected</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">Not Connected</Badge>
                    )}
                  </span>
                </div>
                
                {user.eth_address && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">ETH Address:</span>
                    <span className="text-xs font-mono break-all">
                      {user.eth_address}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full" asChild>
                  <a href={user.role === 'patient' ? '/patient-profile' : '/doctor-profile'}>
                    Edit Profile
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <Tabs
                defaultValue="overview"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  {user.role === 'patient' && (
                    <>
                      <TabsTrigger value="vitals">Vitals</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="doctors">My Doctors</TabsTrigger>
                    </>
                  )}
                  {user.role === 'doctor' && (
                    <>
                      <TabsTrigger value="patients">My Patients</TabsTrigger>
                      <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    </>
                  )}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="overview" className="mt-0">
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Welcome to HealthDecentro</h3>
                  <p className="text-muted-foreground mb-6">
                    Your secure, decentralized platform for medical records management
                  </p>
                  {user.role === 'patient' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">Monitor Vitals</CardTitle>
                          <CardDescription>Record your daily health metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4 px-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('vitals')}
                          >
                            Record Vitals
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">Upload Documents</CardTitle>
                          <CardDescription>Store your medical records securely</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4 px-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('documents')}
                          >
                            Upload Document
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">View Patients</CardTitle>
                          <CardDescription>Access your patients' medical records</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4 px-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('patients')}
                          >
                            View Patients
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">Manage Appointments</CardTitle>
                          <CardDescription>View and manage your schedule</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4 px-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('appointments')}
                          >
                            Manage Appointments
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="vitals" className="mt-0">
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Vitals Tracking</h3>
                  <p className="text-muted-foreground mb-6">
                    This feature is coming soon. You'll be able to record and track your health metrics here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Medical Documents</h3>
                  <p className="text-muted-foreground mb-6">
                    This feature is coming soon. You'll be able to upload and manage your medical documents here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="doctors" className="mt-0">
                {isLoadingDoctors ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : doctors.length > 0 ? (
                  <div className="py-4">
                    <h3 className="text-xl font-medium mb-4">Healthcare Providers With Access</h3>
                    <div className="space-y-4">
                      {doctors.map((doctor) => (
                        <Card key={doctor.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage src={doctor.doctors.profile_photo_url} />
                                <AvatarFallback>
                                  {doctor.doctors.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{doctor.doctors.full_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {doctor.doctors.qualification}
                                </p>
                              </div>
                              <div className="ml-auto">
                                <Button variant="outline" size="sm">
                                  Revoke Access
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No Doctors</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't granted access to any healthcare providers yet.
                    </p>
                    <Button variant="outline">Find Doctors</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="patients" className="mt-0">
                {isLoadingPatients ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : patients.length > 0 ? (
                  <div className="py-4">
                    <h3 className="text-xl font-medium mb-4">Your Patients</h3>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                      {patients.map((patient) => (
                        <AccordionItem key={patient.id} value={patient.id} className="border rounded-lg p-0 overflow-hidden">
                          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-all">
                            <div className="flex items-center gap-3 w-full">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={patient.patients.profile_photo_url} />
                                <AvatarFallback>
                                  {patient.patients.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <h4 className="font-semibold">{patient.patients.full_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Blood Group: {patient.patients.blood_group}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-auto mr-4">
                                Active
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <Card>
                                <CardHeader className="p-4">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" /> Patient Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 py-2 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Date of Birth</span>
                                    <span className="text-sm">{new Date(patient.patients.date_of_birth).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Blood Group</span>
                                    <span className="text-sm">{patient.patients.blood_group}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Weight</span>
                                    <span className="text-sm">{patient.patients.weight} kg</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Phone</span>
                                    <span className="text-sm">{patient.patients.phone_number}</span>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="p-4">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Recent Vitals
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 py-2">
                                  <div className="text-center py-6 text-muted-foreground text-sm">
                                    No recent vital records available
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <div className="mt-4">
                              <Card>
                                <CardHeader className="p-4">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Medical Records
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 py-2">
                                  <div className="text-center py-6 text-muted-foreground text-sm">
                                    No medical records available
                                  </div>
                                </CardContent>
                                <CardFooter className="px-4 py-3 border-t">
                                  <Button variant="outline" size="sm" className="gap-1">
                                    <FileText className="h-4 w-4" /> View All Records
                                  </Button>
                                </CardFooter>
                              </Card>
                            </div>
                            
                            <div className="mt-4 flex gap-2 justify-end">
                              <Button variant="outline" size="sm" className="gap-1">
                                <CalendarClock className="h-4 w-4" /> Schedule Appointment
                              </Button>
                              <Button variant="default" size="sm" className="gap-1">
                                <Stethoscope className="h-4 w-4" /> Add Medical Record
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No Patients</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any patients yet.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="appointments" className="mt-0">
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Appointments</h3>
                  <p className="text-muted-foreground mb-6">
                    This feature is coming soon. You'll be able to manage your appointments here.
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
