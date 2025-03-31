
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Activity, 
  ClipboardList,
  User,
  Calendar,
  Heart,
  Weight,
  Phone,
  BadgeInfo
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorDetails, getPatientDetails, getFiles, getDailyReports } from '@/lib/blockchain';
import { getIpfsUrl } from '@/lib/pinata';
import { MedicalDocument } from '@/interfaces/documents';
import { VitalSign, ChartData } from '@/interfaces/vitals';

interface PatientWithBlockchainData {
  address: string;
  details?: {
    full_name: string;
    date_of_birth: string;
    weight: string;
    height: string;
    aadhar_number: string;
    blood_type: string;
    phone_number: string;
    isMarried: boolean;
  };
  vitals: VitalSign[];
  documents: MedicalDocument[];
}

const DoctorPatients = () => {
  const navigate = useNavigate();
  const { user, doctorProfile, ethAddress, isWeb3Connected, connectWallet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<PatientWithBlockchainData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientChartData, setPatientChartData] = useState<ChartData[]>([]);
  
  useEffect(() => {
    // Redirect if not logged in or not a doctor
    if (user && user.role !== 'doctor') {
      toast.error("Only doctors can access this page");
      navigate('/dashboard');
    } else if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && ethAddress) {
      loadPatients();
    }
  }, [user, ethAddress]);

  useEffect(() => {
    if (selectedPatient) {
      const patient = patients.find(p => p.address === selectedPatient);
      if (patient && patient.vitals && patient.vitals.length > 0) {
        // Format data for charts (take latest 10 entries and reverse for chronological display)
        const chartData = patient.vitals
          .slice(0, 10)
          .reverse()
          .map(item => ({
            date: format(new Date(item.recorded_at), 'MMM dd'),
            systolic: Number(item.blood_pressure_systolic),
            diastolic: Number(item.blood_pressure_diastolic),
            bloodSugar: Number(item.blood_sugar),
            heartRate: Number(item.heart_rate),
          }));
        setPatientChartData(chartData);
      }
    }
  }, [selectedPatient, patients]);

  const loadPatients = async () => {
    if (!ethAddress) return;
    
    setIsLoading(true);
    try {
      // Get the doctor's details including shared patients
      const doctorData = await getDoctorDetails(ethAddress);
      
      if (doctorData && doctorData.sharedPatients) {
        const patientAddresses = doctorData.sharedPatients;
        const patientDataPromises = patientAddresses.map(async (address: string) => {
          try {
            // Get patient details
            const details = await getPatientDetails(address);
            // Get patient vitals
            const vitals = await getDailyReports(address);
            // Get patient documents
            const documents = await getFiles(address);
            
            return {
              address,
              details,
              vitals: vitals || [],
              documents: documents || []
            };
          } catch (error) {
            console.error(`Error fetching data for patient ${address}:`, error);
            return {
              address,
              vitals: [],
              documents: []
            };
          }
        });
        
        const patientData = await Promise.all(patientDataPromises);
        setPatients(patientData.filter(p => p.details)); // Filter out any patients where we couldn't fetch details
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!isWeb3Connected) {
      await connectWallet();
    }
  };

  const selectPatient = (address: string) => {
    setSelectedPatient(selectedPatient === address ? null : address);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center">
            <p>Please sign in to access this page</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Your Patients</h1>
        
        {!ethAddress && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="mb-4">Connect your wallet to access patient records</p>
                <Button onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {ethAddress && (
          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">Loading patient data...</div>
                </CardContent>
              </Card>
            ) : patients.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p>No patients have shared access with you yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Patient List</CardTitle>
                    <CardDescription>
                      Patients who have granted you access to their medical records
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-4">
                      {patients.map((patient) => (
                        <AccordionItem 
                          key={patient.address} 
                          value={patient.address}
                          className="border rounded-lg overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-4 w-full">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {patient.details?.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-left">
                                <h3 className="font-medium">{patient.details?.full_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {`${patient.details?.blood_type}, ${new Date().getFullYear() - new Date(patient.details?.date_of_birth || '').getFullYear()} years`}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-auto mr-4">
                                {patient.vitals.length} vitals, {patient.documents.length} docs
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="bg-muted/20 px-4">
                            <Tabs defaultValue="overview">
                              <TabsList className="mb-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-4">
                                    <h3 className="font-medium text-lg">Patient Information</h3>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Name:</span>
                                        <span className="text-sm font-medium">{patient.details?.full_name}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">DOB:</span>
                                        <span className="text-sm font-medium">
                                          {patient.details?.date_of_birth}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Blood Type:</span>
                                        <span className="text-sm font-medium">{patient.details?.blood_type}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <Weight className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Weight:</span>
                                        <span className="text-sm font-medium">{patient.details?.weight} kg</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <BadgeInfo className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Marital Status:</span>
                                        <span className="text-sm font-medium">
                                          {patient.details?.isMarried ? 'Married' : 'Single'}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Phone:</span>
                                        <span className="text-sm font-medium">{patient.details?.phone_number}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <h3 className="font-medium text-lg">Recent Activity</h3>
                                    
                                    <div className="space-y-3">
                                      {patient.vitals.length > 0 ? (
                                        <div className="border rounded p-3">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Activity className="h-4 w-4 text-green-500" />
                                            <h4 className="text-sm font-medium">Latest Vitals</h4>
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            Recorded on {format(new Date(patient.vitals[0].recorded_at), 'MMM dd, yyyy')}
                                          </p>
                                          <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="text-xs">
                                              <span className="text-muted-foreground">BP: </span>
                                              <span className="font-medium">{patient.vitals[0].blood_pressure_systolic}/{patient.vitals[0].blood_pressure_diastolic}</span>
                                            </div>
                                            <div className="text-xs">
                                              <span className="text-muted-foreground">Sugar: </span>
                                              <span className="font-medium">{patient.vitals[0].blood_sugar} mg/dL</span>
                                            </div>
                                            <div className="text-xs">
                                              <span className="text-muted-foreground">Heart Rate: </span>
                                              <span className="font-medium">{patient.vitals[0].heart_rate} bpm</span>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="border rounded p-3 text-center text-sm text-muted-foreground">
                                          No vitals recorded yet
                                        </div>
                                      )}
                                      
                                      {patient.documents.length > 0 ? (
                                        <div className="border rounded p-3">
                                          <div className="flex items-center gap-2 mb-1">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <h4 className="text-sm font-medium">Latest Document</h4>
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            Added on {format(new Date(patient.documents[0].dou), 'MMM dd, yyyy')}
                                          </p>
                                          <div className="mt-2">
                                            <h5 className="text-xs font-medium">{patient.documents[0].name}</h5>
                                            <p className="text-xs text-muted-foreground">{patient.documents[0].category}</p>
                                          </div>
                                          <div className="mt-2">
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="w-full text-xs h-7"
                                              onClick={() => window.open(getIpfsUrl(patient.documents[0].cid), '_blank')}
                                            >
                                              View Document
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="border rounded p-3 text-center text-sm text-muted-foreground">
                                          No documents uploaded yet
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="vitals">
                                {patient.vitals.length === 0 ? (
                                  <div className="text-center py-8">
                                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p>No vitals records found for this patient</p>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    <div className="h-[300px]">
                                      <h3 className="text-lg font-medium mb-4">Blood Pressure Trends</h3>
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={patientChartData}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="date" />
                                          <YAxis />
                                          <Tooltip />
                                          <Legend />
                                          <Line 
                                            type="monotone" 
                                            dataKey="systolic" 
                                            stroke="#ef4444" 
                                            activeDot={{ r: 8 }} 
                                            name="Systolic" 
                                          />
                                          <Line 
                                            type="monotone" 
                                            dataKey="diastolic" 
                                            stroke="#f97316" 
                                            name="Diastolic" 
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                    
                                    <div className="h-[300px]">
                                      <h3 className="text-lg font-medium mb-4">Other Vitals</h3>
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={patientChartData}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="date" />
                                          <YAxis />
                                          <Tooltip />
                                          <Legend />
                                          <Line 
                                            type="monotone" 
                                            dataKey="bloodSugar" 
                                            stroke="#6366f1" 
                                            name="Blood Sugar" 
                                          />
                                          <Line 
                                            type="monotone" 
                                            dataKey="heartRate" 
                                            stroke="#0ea5e9" 
                                            name="Heart Rate" 
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                    
                                    <div className="mt-8">
                                      <h3 className="text-lg font-medium mb-4">Vitals History</h3>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="border-b">
                                              <th className="px-4 py-2 text-left">Date</th>
                                              <th className="px-4 py-2 text-left">Blood Pressure</th>
                                              <th className="px-4 py-2 text-left">Blood Sugar</th>
                                              <th className="px-4 py-2 text-left">Heart Rate</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {patient.vitals.slice(0, 10).map((vital, index) => (
                                              <tr key={index} className="border-b">
                                                <td className="px-4 py-2">
                                                  {format(new Date(vital.recorded_at), 'MMM dd, yyyy HH:mm')}
                                                </td>
                                                <td className="px-4 py-2">
                                                  {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic} mmHg
                                                </td>
                                                <td className="px-4 py-2">{vital.blood_sugar} mg/dL</td>
                                                <td className="px-4 py-2">{vital.heart_rate} bpm</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="documents">
                                {patient.documents.length === 0 ? (
                                  <div className="text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p>No documents found for this patient</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {patient.documents.map((doc, index) => (
                                      <Card key={index} className="overflow-hidden">
                                        <div className="p-4 flex flex-col h-full">
                                          <div className="flex items-start justify-between mb-3">
                                            <div>
                                              <Badge variant="outline" className="mb-2">
                                                {doc.category}
                                              </Badge>
                                              <h3 className="font-medium line-clamp-2">{doc.name}</h3>
                                            </div>
                                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                          </div>
                                          
                                          {doc.description && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                              {doc.description}
                                            </p>
                                          )}
                                          
                                          <div className="text-xs text-muted-foreground mt-auto">
                                            Uploaded on {format(new Date(doc.dou), 'MMM dd, yyyy')}
                                          </div>
                                          
                                          <div className="mt-3">
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="w-full"
                                              onClick={() => window.open(getIpfsUrl(doc.cid), '_blank')}
                                            >
                                              <FileText className="h-4 w-4 mr-1" />
                                              Open Document
                                            </Button>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorPatients;
