
export interface MedicalDocument {
  cid: string;
  name: string;
  category: string;
  dou: string; // date of upload
  description: string;
}

export interface UploadDocumentFormData {
  title: string;
  category: string;
  notes: string;
  file: File | null;
}
