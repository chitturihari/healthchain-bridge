
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  FileText, 
  Upload, 
  FilePlus2, 
  FileX, 
  FileSymlink, 
  AlertCircle 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile, getFiles } from '@/lib/blockchain';
import { uploadToPinata, getIpfsUrl } from '@/lib/pinata';
import { MedicalDocument, UploadDocumentFormData } from '@/interfaces/documents';

const fileCategories = [
  'Lab Report',
  'Prescription',
  'Radiology',
  'Discharge Summary',
  'Vaccination Record',
  'Insurance',
  'Other'
];

const documentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  category: z.string().min(2, { message: 'Please select a category' }),
  notes: z.string().optional(),
  file: z.instanceof(File, { message: 'Please select a file to upload' }),
});

const PatientDocuments = () => {
  const navigate = useNavigate();
  const { user, patientProfile, ethAddress, isWeb3Connected, connectWallet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [activeTab, setActiveTab] = useState('files');
  const [previewDocument, setPreviewDocument] = useState<MedicalDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const form = useForm<UploadDocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      category: '',
      notes: '',
      file: null,
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
      loadDocuments();
    }
  }, [user, ethAddress]);

  const loadDocuments = async () => {
    if (!ethAddress) return;
    
    setLoadingDocuments(true);
    try {
      const data = await getFiles(ethAddress);
      if (data && Array.isArray(data)) {
        // Sort by date, newest first
        const sortedData = [...data].sort((a, b) => 
          new Date(b.dou).getTime() - new Date(a.dou).getTime()
        );
        setDocuments(sortedData);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load your medical documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!isWeb3Connected) {
      await connectWallet();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('file', file);
    }
  };

  const previewFile = (document: MedicalDocument) => {
    setPreviewDocument(document);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewDocument(null);
  };

  const onSubmit = async (data: UploadDocumentFormData) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    if (!ethAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!data.file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload file to IPFS via Pinata
      toast.info('Uploading file to IPFS...');
      const cid = await uploadToPinata(data.file, data.title, data.category);
      
      if (!cid) {
        throw new Error('Failed to upload to IPFS');
      }
      
      // Store document record on blockchain
      toast.info('Recording document on blockchain...');
      const timestamp = new Date().toISOString();
      await uploadFile(
        cid,
        data.title,
        data.category,
        timestamp,
        data.notes || ''
      );
      
      form.reset();
      loadDocuments();
      setActiveTab('files');
      
    } catch (error) {
      console.error('Error uploading document:', error);
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
        <h1 className="text-3xl font-bold mb-6">Medical Documents</h1>
        
        {!ethAddress && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="mb-4">Connect your wallet to access your medical documents</p>
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
              <TabsTrigger value="files">My Documents</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Your Medical Documents</CardTitle>
                  <CardDescription>
                    Securely stored on IPFS with blockchain verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingDocuments ? (
                    <div className="text-center py-8">Loading your documents...</div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>No documents found</p>
                      <Button 
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => setActiveTab('upload')}
                      >
                        Upload Your First Document
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc, index) => (
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
                            
                            <div className="mt-3 flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => previewFile(doc)}
                              >
                                <FileSymlink className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => window.open(getIpfsUrl(doc.cid), '_blank')}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Open
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => setActiveTab('upload')} 
                    className="ml-auto"
                  >
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    Upload New Document
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Medical Document</CardTitle>
                  <CardDescription>
                    Your file will be stored on IPFS and indexed on the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter document title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fileCategories.map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add any notes about this document"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="file"
                        render={() => (
                          <FormItem>
                            <FormLabel>File</FormLabel>
                            <FormControl>
                              <Input 
                                type="file" 
                                onChange={handleFileChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Supported formats: PDF, JPG, PNG, DOC, DOCX
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center p-4 border rounded bg-muted/50">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        <p className="text-sm">
                          Files are stored on IPFS and cannot be deleted. Make sure the document does not contain sensitive information you don't want to share.
                        </p>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Document Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={closePreview}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{previewDocument?.name}</DialogTitle>
              <DialogDescription>
                {previewDocument?.category} - Uploaded on {previewDocument ? format(new Date(previewDocument.dou), 'MMM dd, yyyy') : ''}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {previewDocument?.description && (
                <div>
                  <h4 className="text-sm font-medium">Notes:</h4>
                  <p className="text-sm">{previewDocument.description}</p>
                </div>
              )}
              
              <div className="aspect-video bg-muted rounded flex items-center justify-center">
                <iframe 
                  src={previewDocument ? getIpfsUrl(previewDocument.cid) : ''} 
                  className="w-full h-full" 
                  title={previewDocument?.name}
                />
              </div>
              
              <p className="text-xs text-muted-foreground break-all">
                IPFS CID: {previewDocument?.cid}
              </p>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={closePreview}
              >
                Close
              </Button>
              <Button 
                type="button"
                onClick={() => previewDocument && window.open(getIpfsUrl(previewDocument.cid), '_blank')}
              >
                Open in New Tab
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PatientDocuments;
