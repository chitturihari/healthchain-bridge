import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, patientProfile, doctorProfile, isLoading, isWeb3Connected, connectWallet } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800">Not Connected</Badge>
                    )}
                  </span>
                </div>
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
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">My Doctors</h3>
                  <p className="text-muted-foreground mb-6">
                    This feature is coming soon. You'll be able to manage doctor access to your records here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="patients" className="mt-0">
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">My Patients</h3>
                  <p className="text-muted-foreground mb-6">
                    This feature is coming soon. You'll be able to view your patients' records here.
                  </p>
                </div>
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
