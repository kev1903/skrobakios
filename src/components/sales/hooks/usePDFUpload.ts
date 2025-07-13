import { useState, useRef } from 'react';
import { toast } from 'sonner';

export const usePDFUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      toast.success('PDF drawing uploaded successfully');
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  return {
    fileInputRef,
    uploadedFile,
    pdfUrl,
    handleFileUpload
  };
};