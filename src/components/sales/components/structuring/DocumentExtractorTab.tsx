import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Search, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentExtractorTabProps {
  estimateId?: string;
  projectId?: string;
  uploadedPDFs?: any[];
  onDataExtracted?: (data: any) => void;
}

interface ProcessingDocument {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  extractedText?: string;
  aiSummary?: string;
  aiConfidence?: number;
  error?: string;
}

export const DocumentExtractorTab = ({ 
  estimateId, 
  projectId, 
  uploadedPDFs = [], 
  onDataExtracted 
}: DocumentExtractorTabProps) => {
  const [documents, setDocuments] = useState<ProcessingDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  // Initialize documents from uploaded PDFs
  useEffect(() => {
    if (uploadedPDFs.length > 0) {
      const initialDocs = uploadedPDFs.map((pdf, index) => ({
        id: `temp-${index}`,
        name: pdf.name || `Document ${index + 1}`,
        status: 'pending' as const,
        progress: 0
      }));
      setDocuments(initialDocs);
    }
  }, [uploadedPDFs]);

  const processDocuments = async () => {
    if (!uploadedPDFs || uploadedPDFs.length === 0) {
      toast({
        title: "No documents found",
        description: "Please upload PDFs first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setOverallProgress(0);

    try {
      const processedDocs: ProcessingDocument[] = [];

      for (let i = 0; i < uploadedPDFs.length; i++) {
        const pdf = uploadedPDFs[i];
        
        // Update document status
        setDocuments(prev => prev.map(doc => 
          doc.id === `temp-${i}` 
            ? { ...doc, status: 'processing', progress: 10 }
            : doc
        ));

        try {
          // First, create a document record in the database
          let fileUrl = '';
          let file: File;

          // Handle different PDF structures
          if (pdf instanceof File) {
            file = pdf;
          } else if (pdf.file && pdf.file instanceof File) {
            file = pdf.file;
          } else if (pdf.url) {
            fileUrl = pdf.url;
            // Download the PDF to get file details
            const response = await fetch(pdf.url);
            const blob = await response.blob();
            file = new File([blob], pdf.name || 'document.pdf', { type: 'application/pdf' });
          } else {
            throw new Error('Invalid PDF format');
          }

          // If we don't have a URL, we need to upload the file first
          if (!fileUrl && file) {
            const fileName = `${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('estimate-drawings')
              .upload(`temp/${fileName}`, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('estimate-drawings')
              .getPublicUrl(uploadData.path);
            
            fileUrl = urlData.publicUrl;
          }

          // Create document record
          const { data: docRecord, error: docError } = await supabase
            .from('project_documents')
            .insert({
              name: file.name,
              file_url: fileUrl,
              file_size: file.size,
              content_type: 'application/pdf',
              document_type: 'drawing',
              estimate_id: estimateId,
              project_id: projectId,
              created_by: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

          if (docError) throw docError;

          // Update progress
          setDocuments(prev => prev.map(doc => 
            doc.id === `temp-${i}` 
              ? { ...doc, progress: 30 }
              : doc
          ));

          // Call the extract-document function
          const { data: extractData, error: extractError } = await supabase.functions
            .invoke('extract-document', {
              body: { document_id: docRecord.id }
            });

          if (extractError) throw extractError;

          // Update with success
          const processedDoc: ProcessingDocument = {
            id: docRecord.id,
            name: file.name,
            status: 'completed',
            progress: 100,
            extractedText: extractData.full_text,
            aiSummary: extractData.ai_summary,
            aiConfidence: extractData.ai_confidence
          };

          processedDocs.push(processedDoc);
          
          setDocuments(prev => prev.map(doc => 
            doc.id === `temp-${i}` 
              ? processedDoc
              : doc
          ));

        } catch (error) {
          console.error(`Error processing ${pdf.name}:`, error);
          
          setDocuments(prev => prev.map(doc => 
            doc.id === `temp-${i}` 
              ? { 
                  ...doc, 
                  status: 'failed', 
                  progress: 100,
                  error: error.message 
                }
              : doc
          ));
        }

        // Update overall progress
        setOverallProgress(Math.round(((i + 1) / uploadedPDFs.length) * 100));
      }

      // Callback with extracted data
      if (onDataExtracted && processedDocs.length > 0) {
        const combinedText = processedDocs
          .filter(doc => doc.extractedText)
          .map(doc => doc.extractedText)
          .join('\n\n');
        
        onDataExtracted({
          extractedText: combinedText,
          documents: processedDocs,
          totalDocuments: uploadedPDFs.length,
          successfulExtractions: processedDocs.filter(doc => doc.status === 'completed').length
        });
      }

      toast({
        title: "Processing complete",
        description: `Successfully processed ${processedDocs.filter(doc => doc.status === 'completed').length} of ${uploadedPDFs.length} documents.`
      });

    } catch (error) {
      console.error('Error in document processing:', error);
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Document Extractor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Intelligent PDF processing with text-layer detection, OCR fallback, and AI analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={processDocuments}
              disabled={isProcessing || documents.length === 0}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isProcessing ? 'Processing...' : 'Extract All Documents'}
            </Button>
            
            {documents.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? 's' : ''} ready for processing
              </div>
            )}
          </div>

          {/* Overall Progress */}
          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <div className="font-medium text-sm">{doc.name}</div>
                      {doc.status === 'processing' && (
                        <Progress value={doc.progress} className="w-32 h-2 mt-1" />
                      )}
                      {doc.error && (
                        <div className="text-xs text-red-600 mt-1">{doc.error}</div>
                      )}
                      {doc.aiSummary && (
                        <div className="text-xs text-muted-foreground mt-1 max-w-md">
                          {doc.aiSummary}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doc.aiConfidence && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(doc.aiConfidence * 100)}% confidence
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </Badge>
                    {doc.extractedText && (
                      <Badge variant="outline" className="text-xs">
                        {doc.extractedText.length} chars
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {documents.some(doc => doc.status === 'completed') && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    Extraction Summary
                  </span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Successfully extracted text from {documents.filter(doc => doc.status === 'completed').length} 
                  {' '}of {documents.length} documents. 
                  Total: {documents.reduce((sum, doc) => sum + (doc.extractedText?.length || 0), 0)} characters extracted.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};