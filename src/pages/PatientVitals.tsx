
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import Layout from '@/components/layout/Layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { addDailyReport, getDailyReports, getPatientDetails } from '@/lib/blockchain';
import { VitalSign, ChartData } from '@/interfaces/vitals';

const vitalsSchema = z.object({
  blood_pressure_systolic: z.coerce
    .number()
    .min(70, { message: 'Systolic pressure must be at least 70 mmHg' })
    .max(220, { message: 'Systolic pressure must be at most 220 mmHg' }),
  blood_pressure_diastolic: z.coerce
    .number()
    .min(40, { message: 'Diastolic pressure must be at least 40 mmHg' })
    .max(120, { message: 'Diastolic pressure must be at most 120 mmHg' }),
  blood_sugar: z.coerce
    .number()
    .min(30, { message: 'Blood sugar must be at least 30 mg/dL' })
    .max(600, { message: 'Blood sugar must be at most 600 mg/dL' }),
  heart_rate: z.coerce
    .number()
    .min(40, { message: 'Heart rate must be at least 40 bpm' })
    .max(220, { message: 'Heart rate must be at most 220 bpm' }),
});

type VitalsFormValues = z.infer<typeof vitalsSchema>;

const PatientVitals = () => {
  const navigate = useNavigate();
  const { user, patientProfile, ethAddress, isWeb3Connected, connectWallet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [activeTab, setActiveTab] = useState('record');
  
  const form = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      blood_sugar: 100,
      heart_rate: 70,
    },
  });

  useEffect(() => {
    // Redirect if not logged in or not a patient
    if (user && user.role !== 'patient') {
      toast.error("Only patients can access this page");
      navigate('/dashboard');
    } else if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && ethAddress) {
      loadVitalsData();
    }
  }, [user, ethAddress]);

  const loadVitalsData = async () => {
    if (!ethAddress) return;
    
    setLoadingVitals(true);
    try {
      const data = await getDailyReports(ethAddress);
      if (data && Array.isArray(data)) {
        // Sort by date, newest first
        const sortedData = [...data].sort((a, b) => 
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        );
        setVitals(sortedData);
        
        // Format data for charts
        const chartData = sortedData.slice(0, 10).reverse().map(item => ({
          date: format(new Date(item.recorded_at), 'MMM dd'),
          systolic: Number(item.blood_pressure_systolic),
          diastolic: Number(item.blood_pressure_diastolic),
          bloodSugar: Number(item.blood_sugar),
          heartRate: Number(item.heart_rate),
        }));
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Error loading vitals data:', error);
      toast.error('Failed to load your health records');
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!isWeb3Connected) {
      await connectWallet();
    }
  };

  const onSubmit = async (data: VitalsFormValues) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    if (!ethAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const timestamp = new Date().toISOString();
      
      await addDailyReport(
        timestamp,
        data.blood_pressure_systolic,
        data.blood_pressure_diastolic,
        data.blood_sugar,
        data.heart_rate
      );
      
      form.reset();
      loadVitalsData();
      setActiveTab('history');
      
    } catch (error) {
      console.error('Error recording vitals:', error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold mb-6">Your Health Vitals</h1>
        
        {!ethAddress && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="mb-4">Connect your wallet to access your health records</p>
                <Button onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {ethAddress && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="record">Record Vitals</TabsTrigger>
              <TabsTrigger value="history">Vitals History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="record">
              <Card>
                <CardHeader>
                  <CardTitle>Record Today's Vitals</CardTitle>
                  <CardDescription>
                    Track your health metrics to monitor your wellness over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Blood Pressure (mmHg)</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="blood_pressure_systolic"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Systolic</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="blood_pressure_diastolic"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Diastolic</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="blood_sugar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Sugar (mg/dL)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="heart_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Heart Rate (bpm)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Vitals'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Your Vitals History</CardTitle>
                  <CardDescription>
                    View your health metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingVitals ? (
                    <div className="text-center py-8">Loading your health records...</div>
                  ) : vitals.length === 0 ? (
                    <div className="text-center py-8">
                      <p>No health records found</p>
                      <Button 
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => setActiveTab('record')}
                      >
                        Record Your First Vitals
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="h-[300px]">
                        <h3 className="text-lg font-medium mb-4">Blood Pressure Trends</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
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
                          <LineChart data={chartData}>
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
                        <h3 className="text-lg font-medium mb-4">Recent Records</h3>
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
                              {vitals.slice(0, 10).map((vital, index) => (
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
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('record')}
                    className="ml-auto"
                  >
                    Record New Vitals
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default PatientVitals;
