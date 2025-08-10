import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, MapPin, User, Building, Calculator, Calendar, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectAttributesTabProps {
  onDataChange?: (data: any) => void;
  uploadedPDFs?: any[];
}

export const ProjectAttributesTab = ({ onDataChange, uploadedPDFs }: ProjectAttributesTabProps) => {
  const [extracting, setExtracting] = useState(false);
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState({
    autoExtract: true,
    projectInfo: true,
    clientTeam: true,
    areaCalc: true,
    drawingInfo: true
  });
  
  // AI Extraction Progress State
  const [aiProgress, setAiProgress] = useState({
    currentFile: '',
    currentActivity: '',
    overallProgress: 0,
    fileProgress: 0,
    totalFiles: 0,
    processedFiles: 0,
    extractedCount: 0,
    status: 'idle', // idle, processing, complete, error
    logs: [] as Array<{ timestamp: string, message: string, type: 'info' | 'success' | 'error' | 'warning' }>,
    extractionReport: null as null | {
      totalFiles: number,
      successfulExtractions: number,
      failedExtractions: number,
      filesProcessed: Array<{
        name: string,
        size: string,
        status: 'success' | 'failed' | 'warning',
        extractedLength: number,
        method: string,
        error?: string
      }>,
      extractionTime: number,
      totalTextExtracted: number,
      averagePrecision: number
    }
  });
  
  const [projectData, setProjectData] = useState({
    projectName: '',
    projectCode: '',
    address: '',
    clientName: '',
    clientContact: '',
    designer: '',
    architect: '',
    siteArea: '',
    gifa: '',
    gefa: '',
    numberOfLevels: '',
    garageArea: '',
    landscapeArea: '',
    poolArea: '',
    ancillaryArea: '',
    drawingIssueDate: '',
    revision: '',
    qualityLevel: '',
    specReference: ''
  });

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...projectData, [field]: value };
    setProjectData(updatedData);
    onDataChange?.(updatedData);
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setAiProgress(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-4), { timestamp, message, type }] // Keep last 5 logs
    }));
  };

  const updateProgress = (updates: Partial<typeof aiProgress>) => {
    setAiProgress(prev => ({ ...prev, ...updates }));
  };

  const handleExtractFromPDF = async () => {
    if (!uploadedPDFs || uploadedPDFs.length === 0) {
      toast({
        title: "No PDFs found",
        description: "Please upload PDFs in Step 1 first.",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting PDF extraction with uploaded PDFs:', uploadedPDFs);
    setExtracting(true);
    
    const startTime = Date.now();
    const filesProcessed: any[] = [];
    
    // Initialize AI progress
    updateProgress({
      status: 'processing',
      totalFiles: uploadedPDFs.length,
      processedFiles: 0,
      extractedCount: 0,
      overallProgress: 0,
      logs: [],
      extractionReport: null
    });
    
    addLog(`🚀 SkAi Initializing - Found ${uploadedPDFs.length} documents to analyze`, 'info');
    
    try {
      // Extract text from all PDFs
      const extractedTexts = [];
      
      for (let i = 0; i < uploadedPDFs.length; i++) {
        const pdf = uploadedPDFs[i];
        
        updateProgress({
          currentFile: pdf.name || `Document ${i + 1}`,
          currentActivity: 'Preparing document for analysis...',
          fileProgress: 0
        });
        
        addLog(`📄 Processing: ${pdf.name}`, 'info');
        
        try {
          console.log('Processing PDF:', pdf);
          
          let file: File;
          
          updateProgress({
            currentActivity: 'Downloading from secure storage...',
            fileProgress: 20
          });
          
          // Handle different PDF structures - check if it's a File object or has URL
          if (pdf instanceof File) {
            file = pdf;
            addLog(`✓ Document ready for analysis`, 'success');
          } else if (pdf.file && pdf.file instanceof File) {
            file = pdf.file;
            addLog(`✓ Document ready for analysis`, 'success');
          } else if (pdf.url) {
            // Download the PDF from Supabase Storage
            console.log(`Downloading PDF from URL: ${pdf.url}`);
            addLog(`📡 Downloading from cloud storage...`, 'info');
            
            updateProgress({
              currentActivity: 'Downloading document from storage...',
              fileProgress: 40
            });
            
            const response = await fetch(pdf.url);
            if (!response.ok) {
              throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            file = new File([blob], pdf.name || 'document.pdf', { type: 'application/pdf' });
            
            console.log(`Downloaded PDF: ${file.name}, size: ${file.size} bytes`);
            addLog(`✓ Downloaded: ${(file.size / 1024 / 1024).toFixed(1)}MB`, 'success');
          } else {
            console.warn('PDF object does not contain file or URL:', pdf);
            addLog(`⚠️ Skipping invalid document`, 'warning');
            continue;
          }
          
          updateProgress({
            currentActivity: 'Sending to SkAi Vision Engine...',
            fileProgress: 60
          });
          
          const formData = new FormData();
          formData.append('file', file);
          
          console.log(`Calling extract-pdf-text function for file: ${file.name}`);
          addLog(`🤖 SkAi analyzing document structure...`, 'info');
          
          updateProgress({
            currentActivity: 'SkAi processing with Vision AI...',
            fileProgress: 80
          });
          
          const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
            body: formData
          });
          
          // Track file processing results
          const fileResult = {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(1) + 'MB',
            status: 'failed' as 'success' | 'failed' | 'warning',
            extractedLength: 0,
            method: 'openai-vision-pdf',
            error: undefined as string | undefined
          };
          
          if (error) {
            console.error(`Supabase function error for ${file.name}:`, error);
            fileResult.error = error.message || 'Unknown error';
            
            // Handle specific error codes for better UX
            if (error.message?.includes('AUTH_FAILED')) {
              addLog(`❌ API Authentication failed - please contact support`, 'error');
              updateProgress({
                currentActivity: 'Authentication error - skipping file',
                fileProgress: 100
              });
            } else if (error.message?.includes('FILE_TOO_LARGE')) {
              addLog(`❌ File too large (${(file.size / 1024 / 1024).toFixed(1)}MB) - max 20MB`, 'error');
              updateProgress({
                currentActivity: 'File size exceeded - skipping file',
                fileProgress: 100
              });
            } else if (error.message?.includes('FORMAT_ERROR')) {
              addLog(`❌ PDF format issue - try different PDF version`, 'error');
              updateProgress({
                currentActivity: 'Format compatibility issue - skipping file',
                fileProgress: 100
              });
            } else {
              addLog(`❌ Processing failed: ${error.message || 'Unknown error'}`, 'error');
              updateProgress({
                currentActivity: 'Error in processing, continuing...',
                fileProgress: 100
              });
            }
            filesProcessed.push(fileResult);
            continue;
          }
          
          if (data?.success && data?.text) {
            extractedTexts.push(data.text);
            console.log(`Successfully extracted ${data.text.length} characters from ${file.name}`);
            addLog(`✅ Extracted ${data.text.length} characters`, 'success');
            
            fileResult.status = 'success';
            fileResult.extractedLength = data.text.length;
            fileResult.method = data.method || 'openai-vision-pdf';
            
            updateProgress({
              extractedCount: aiProgress.extractedCount + 1,
              currentActivity: 'Text extraction complete!',
              fileProgress: 100
            });
          } else if (data?.warning) {
            console.warn(`Limited text extracted from ${file.name}:`, data);
            addLog(`⚠️ Limited text found - may be image-based PDF`, 'warning');
            
            fileResult.status = 'warning';
            fileResult.extractedLength = data?.extractedLength || 0;
            fileResult.method = data?.method || 'openai-vision-pdf';
            
            // Still add the limited text if any
            if (data.text && data.text.length > 0) {
              extractedTexts.push(data.text);
              updateProgress({
                extractedCount: aiProgress.extractedCount + 1
              });
            }
          } else {
            console.warn(`No usable text extracted from ${file.name}`, data);
            addLog(`⚠️ No readable text found in document`, 'warning');
            fileResult.status = 'warning';
            fileResult.error = 'No readable text found';
          }
          
          filesProcessed.push(fileResult);
        } catch (error) {
          console.error(`Error extracting text from PDF:`, error);
          addLog(`❌ Processing error: ${error.message}`, 'error');
          
          filesProcessed.push({
            name: pdf.name || 'Unknown',
            size: 'Unknown',
            status: 'failed',
            extractedLength: 0,
            method: 'failed',
            error: error.message
          });
        }
        
        // Update overall progress
        const processed = i + 1;
        updateProgress({
          processedFiles: processed,
          overallProgress: Math.round((processed / uploadedPDFs.length) * 70) // 70% for extraction
        });
        
        // Small delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (extractedTexts.length === 0) {
        updateProgress({
          status: 'error',
          currentActivity: 'No text could be extracted from any documents',
          overallProgress: 100
        });
        addLog(`❌ No readable content found in any documents`, 'error');
        addLog(`💡 Try uploading text-based PDFs or contact support for assistance`, 'info');
        
        // Show helpful error with recovery suggestions
        toast({
          title: "Extraction unsuccessful",
          description: "No readable text found. Try uploading text-based PDFs or reducing file sizes.",
          variant: "destructive"
        });
        
        throw new Error('No text could be extracted from the PDFs. Please ensure you are uploading text-based PDFs (not scanned images) or contact support for assistance.');
      }
      
      // AI Processing Phase
      updateProgress({
        currentActivity: 'SkAi analyzing extracted content...',
        overallProgress: 75
      });
      addLog(`🧠 SkAi processing ${extractedTexts.length} document(s)...`, 'info');
      
      // Combine all extracted text
      const combinedText = extractedTexts.join('\n\n');
      
      updateProgress({
        currentActivity: 'SkAi structuring project data...',
        overallProgress: 85
      });
      addLog(`🔍 Identifying project information patterns...`, 'info');
      
      // Use AI to parse the extracted text and extract project data
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: `Extract project information from the following architectural drawing text. Return only a JSON object with these exact fields (use empty string if not found): 
          {
            "projectName": "",
            "projectCode": "",
            "address": "",
            "clientName": "",
            "clientContact": "",
            "designer": "",
            "architect": "",
            "siteArea": "",
            "gifa": "",
            "gefa": "",
            "numberOfLevels": "",
            "garageArea": "",
            "landscapeArea": "",
            "poolArea": "",
            "ancillaryArea": "",
            "drawingIssueDate": "",
            "revision": "",
            "qualityLevel": "",
            "specReference": ""
          }
          
          Text to analyze:
          ${combinedText}`
        }
      });
      
      if (aiError) {
        updateProgress({
          status: 'error',
          currentActivity: 'AI processing failed',
          overallProgress: 100
        });
        addLog(`❌ SkAi analysis failed: ${aiError.message}`, 'error');
        throw aiError;
      }
      
      updateProgress({
        currentActivity: 'SkAi finalizing data structure...',
        overallProgress: 95
      });
      addLog(`📊 Structuring extracted information...`, 'info');
      
      // Parse the AI response
      let extractedData = {};
      try {
        const response = aiData?.response || aiData?.message || '';
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
          addLog(`✅ SkAi successfully identified project data`, 'success');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        addLog(`❌ Data parsing failed`, 'error');
        throw new Error('Could not parse extracted data');
      }
      
      // Update form with extracted data
      const updatedData = { ...projectData };
      let fieldsUpdated = 0;
      Object.keys(extractedData).forEach(key => {
        if (extractedData[key] && extractedData[key].trim() !== '') {
          updatedData[key] = extractedData[key];
          fieldsUpdated++;
        }
      });
      
      setProjectData(updatedData);
      onDataChange?.(updatedData);
      
      // Generate extraction report
      const endTime = Date.now();
      const extractionTime = Math.round((endTime - startTime) / 1000);
      const totalTextExtracted = extractedTexts.reduce((sum, text) => sum + text.length, 0);
      const successfulExtractions = filesProcessed.filter(f => f.status === 'success').length;
      const failedExtractions = filesProcessed.filter(f => f.status === 'failed').length;
      const averagePrecision = successfulExtractions > 0 ? 
        Math.round((successfulExtractions / uploadedPDFs.length) * 100) : 0;
      
      const extractionReport = {
        totalFiles: uploadedPDFs.length,
        successfulExtractions,
        failedExtractions,
        filesProcessed,
        extractionTime,
        totalTextExtracted,
        averagePrecision
      };
      
      // Complete
      updateProgress({
        status: 'complete',
        currentActivity: `Complete! Extracted ${fieldsUpdated} fields`,
        overallProgress: 100,
        extractionReport
      });
      addLog(`🎉 Extraction complete - ${fieldsUpdated} fields populated`, 'success');
      addLog(`📊 Report: ${successfulExtractions}/${uploadedPDFs.length} files processed successfully`, 'info');
      
      toast({
        title: "Extraction complete",
        description: `SkAi successfully extracted and populated ${fieldsUpdated} project fields from ${successfulExtractions} files.`
      });
      
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      
      // Generate error report
      const endTime = Date.now();
      const extractionTime = Math.round((endTime - startTime) / 1000);
      const successfulExtractions = filesProcessed.filter(f => f.status === 'success').length;
      const failedExtractions = filesProcessed.filter(f => f.status === 'failed').length;
      
      updateProgress({
        status: 'error',
        currentActivity: 'Extraction failed',
        overallProgress: 100,
        extractionReport: {
          totalFiles: uploadedPDFs.length,
          successfulExtractions,
          failedExtractions,
          filesProcessed,
          extractionTime,
          totalTextExtracted: 0,
          averagePrecision: 0
        }
      });
      addLog(`❌ Extraction failed: ${error.message}`, 'error');
      
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract data from PDFs.",
        variant: "destructive"
      });
    } finally {
      setExtracting(false);
      // Keep the progress interface open - don't auto-hide
      // Users can manually collapse the section if they want
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-3">
      {/* Auto-Extract Section */}
      <Collapsible 
        open={expandedSections.autoExtract} 
        onOpenChange={() => toggleSection('autoExtract')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-base text-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Search className="w-4 h-4" />
                  Auto-Extract from PDFs
                </div>
                {expandedSections.autoExtract ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Button 
                  onClick={handleExtractFromPDF}
                  disabled={extracting}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <FileText className="w-4 h-4" />
                  {extracting ? 'Extracting...' : 'Extract Project Data'}
                </Button>
                
                {/* Retry button for failed extractions */}
                {aiProgress.status === 'error' && (
                  <Button 
                    onClick={handleExtractFromPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                
                <div className="text-sm text-muted-foreground">
                  Automatically extract project information from uploaded drawings and cover sheets
                </div>
              </div>
              
              {/* Live AI Activity Monitor */}
              {(extracting || aiProgress.status !== 'idle') && (
                 <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Left Column - Status & Progress */}
                     <div className="space-y-4">
                       {/* Header */}
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${
                             aiProgress.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                             aiProgress.status === 'complete' ? 'bg-green-500' :
                             aiProgress.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                           }`} />
                           <span className="font-medium text-sm">SkAi Processing Engine</span>
                         </div>
                         <span className="text-xs text-muted-foreground">
                           {aiProgress.status === 'processing' ? 'ACTIVE' :
                            aiProgress.status === 'complete' ? 'COMPLETE' :
                            aiProgress.status === 'error' ? 'ERROR' : 'STANDBY'}
                         </span>
                       </div>
                       
                       {/* Overall Progress */}
                       <div className="space-y-2">
                         <div className="flex justify-between text-xs">
                           <span>Overall Progress</span>
                           <span>{aiProgress.overallProgress}%</span>
                         </div>
                         <div className="w-full bg-muted rounded-full h-2">
                           <div 
                             className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" 
                             style={{ width: `${aiProgress.overallProgress}%` }}
                           />
                         </div>
                       </div>
                       
                       {/* Current Activity */}
                       {aiProgress.currentActivity && (
                         <div className="space-y-1">
                           <div className="text-xs font-medium">Current Activity:</div>
                           <div className="text-xs text-muted-foreground flex items-center gap-2">
                             {aiProgress.status === 'processing' && (
                               <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                             )}
                             {aiProgress.currentActivity}
                           </div>
                         </div>
                       )}
                       
                       {/* File Progress */}
                       {aiProgress.currentFile && (
                         <div className="space-y-1">
                           <div className="text-xs font-medium">Processing: {aiProgress.currentFile}</div>
                           <div className="flex justify-between text-xs text-muted-foreground">
                             <span>Files: {aiProgress.processedFiles}/{aiProgress.totalFiles}</span>
                             <span>Extracted: {aiProgress.extractedCount}</span>
                           </div>
                         </div>
                       )}
                     </div>
                      
                      {/* Right Column - Activity Log */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium">Activity Log:</div>
                        <div className="h-32 bg-black/90 rounded p-3 font-mono text-xs overflow-y-auto">
                          {aiProgress.logs.length > 0 ? (
                            aiProgress.logs.map((log, index) => (
                              <div key={index} className="flex gap-2 mb-1 leading-tight">
                                <span className="text-green-400 opacity-60 shrink-0 text-[10px]">{log.timestamp}</span>
                                <span className={`${
                                  log.type === 'error' ? 'text-red-400' :
                                  log.type === 'success' ? 'text-green-400' :
                                  log.type === 'warning' ? 'text-yellow-400' :
                                  'text-blue-300'
                                } text-[11px] break-words`}>
                                  {log.message}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 italic text-[11px]">Waiting for activity...</div>
                          )}
                          
                          {/* Status footer */}
                          {aiProgress.status === 'complete' && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <div className="text-green-400 text-[10px] font-bold">✓ EXTRACTION COMPLETE</div>
                            </div>
                          )}
                          
                          {aiProgress.status === 'error' && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <div className="text-red-400 text-[10px] font-bold">✗ EXTRACTION FAILED</div>
                              <div className="text-yellow-400 text-[10px] mt-1">→ Click "Try Again" to retry</div>
                            </div>
                          )}
                        </div>
                       </div>
                    </div>
                    
                    {/* Extraction Report */}
                    {aiProgress.extractionReport && (
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">📊 Extraction Report</h3>
                            <div className="text-xs text-muted-foreground">
                              Completed in {aiProgress.extractionReport.extractionTime}s
                            </div>
                          </div>
                          
                          {/* Summary Stats */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="text-center p-2 bg-background rounded">
                              <div className="text-lg font-bold">{aiProgress.extractionReport.totalFiles}</div>
                              <div className="text-xs text-muted-foreground">Total Files</div>
                            </div>
                            <div className="text-center p-2 bg-background rounded">
                              <div className="text-lg font-bold text-green-600">{aiProgress.extractionReport.successfulExtractions}</div>
                              <div className="text-xs text-muted-foreground">Successful</div>
                            </div>
                            <div className="text-center p-2 bg-background rounded">
                              <div className="text-lg font-bold">{aiProgress.extractionReport.averagePrecision}%</div>
                              <div className="text-xs text-muted-foreground">Success Rate</div>
                            </div>
                            <div className="text-center p-2 bg-background rounded">
                              <div className="text-lg font-bold">{Math.round(aiProgress.extractionReport.totalTextExtracted / 1000)}K</div>
                              <div className="text-xs text-muted-foreground">Chars Extracted</div>
                            </div>
                          </div>
                          
                          {/* File Details */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium">File Processing Details:</div>
                            <div className="max-h-24 overflow-y-auto space-y-1">
                              {aiProgress.extractionReport.filesProcessed.map((file, index) => (
                                <div key={index} className="flex items-center justify-between text-xs p-2 bg-background rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      file.status === 'success' ? 'bg-green-500' :
                                      file.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                                    <span className="truncate max-w-32">{file.name}</span>
                                    <Badge variant="outline" className="h-4 text-[10px]">{file.size}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {file.extractedLength > 0 && (
                                      <span className="text-green-600">{file.extractedLength} chars</span>
                                    )}
                                    {file.error && (
                                      <span className="text-red-500 truncate max-w-20" title={file.error}>
                                        {file.error.length > 15 ? file.error.substring(0, 15) + '...' : file.error}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Precision Info */}
                          <div className="text-xs text-muted-foreground">
                            <strong>Extraction Method:</strong> OpenAI GPT-4o Vision • 
                            <strong> Model:</strong> {aiProgress.extractionReport.filesProcessed[0]?.method || 'openai-vision-pdf'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
               )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Project Information */}
      <Collapsible 
        open={expandedSections.projectInfo} 
        onOpenChange={() => toggleSection('projectInfo')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-base text-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Building className="w-4 h-4" />
                  Project Information
                </div>
                {expandedSections.projectInfo ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="Enter project name"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectCode" className="text-sm">Project Code</Label>
                  <Input
                    id="projectCode"
                    value={projectData.projectCode}
                    onChange={(e) => handleInputChange('projectCode', e.target.value)}
                    placeholder="Enter project code"
                    className="h-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2 text-sm">
                  <MapPin className="w-3 h-3" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={projectData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter project address"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Client & Design Team */}
      <Collapsible 
        open={expandedSections.clientTeam} 
        onOpenChange={() => toggleSection('clientTeam')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-base text-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4" />
                  Client & Design Team
                </div>
                {expandedSections.clientTeam ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm">Client Name</Label>
                <Input
                  id="clientName"
                  value={projectData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                  className="h-8"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientContact" className="text-sm">Client Contact</Label>
                <Input
                  id="clientContact"
                  value={projectData.clientContact}
                  onChange={(e) => handleInputChange('clientContact', e.target.value)}
                  placeholder="Email or phone"
                  className="h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designer" className="text-sm">Designer</Label>
                  <Input
                    id="designer"
                    value={projectData.designer}
                    onChange={(e) => handleInputChange('designer', e.target.value)}
                    placeholder="Design firm"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="architect" className="text-sm">Architect</Label>
                  <Input
                    id="architect"
                    value={projectData.architect}
                    onChange={(e) => handleInputChange('architect', e.target.value)}
                    placeholder="Architecture firm"
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Area Calculations */}
      <Collapsible 
        open={expandedSections.areaCalc} 
        onOpenChange={() => toggleSection('areaCalc')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-base text-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Calculator className="w-4 h-4" />
                  Area Calculations
                </div>
                {expandedSections.areaCalc ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteArea" className="text-sm">Site Area (m²)</Label>
                  <Input
                    id="siteArea"
                    type="number"
                    value={projectData.siteArea}
                    onChange={(e) => handleInputChange('siteArea', e.target.value)}
                    placeholder="0"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfLevels" className="text-sm">Number of Levels</Label>
                  <Input
                    id="numberOfLevels"
                    type="number"
                    value={projectData.numberOfLevels}
                    onChange={(e) => handleInputChange('numberOfLevels', e.target.value)}
                    placeholder="0"
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gifa" className="text-sm">GIFA (m²)</Label>
                  <Input
                    id="gifa"
                    type="number"
                    value={projectData.gifa}
                    onChange={(e) => handleInputChange('gifa', e.target.value)}
                    placeholder="Gross Internal Floor Area"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gefa" className="text-sm">GEFA (m²)</Label>
                  <Input
                    id="gefa"
                    type="number"
                    value={projectData.gefa}
                    onChange={(e) => handleInputChange('gefa', e.target.value)}
                    placeholder="Gross External Floor Area"
                    className="h-8"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Key Area Breakdown</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="garageArea" className="text-xs">Garage (m²)</Label>
                    <Input
                      id="garageArea"
                      type="number"
                      value={projectData.garageArea}
                      onChange={(e) => handleInputChange('garageArea', e.target.value)}
                      placeholder="0"
                      className="h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="landscapeArea" className="text-xs">Landscape (m²)</Label>
                    <Input
                      id="landscapeArea"
                      type="number"
                      value={projectData.landscapeArea}
                      onChange={(e) => handleInputChange('landscapeArea', e.target.value)}
                      placeholder="0"
                      className="h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="poolArea" className="text-xs">Pool (m²)</Label>
                    <Input
                      id="poolArea"
                      type="number"
                      value={projectData.poolArea}
                      onChange={(e) => handleInputChange('poolArea', e.target.value)}
                      placeholder="0"
                      className="h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ancillaryArea" className="text-xs">Ancillary (m²)</Label>
                    <Input
                      id="ancillaryArea"
                      type="number"
                      value={projectData.ancillaryArea}
                      onChange={(e) => handleInputChange('ancillaryArea', e.target.value)}
                      placeholder="0"
                      className="h-7"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Drawing Information */}
      <Collapsible 
        open={expandedSections.drawingInfo} 
        onOpenChange={() => toggleSection('drawingInfo')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-base text-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4" />
                  Drawing Information
                </div>
                {expandedSections.drawingInfo ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drawingIssueDate" className="text-sm">Issue Date</Label>
                  <Input
                    id="drawingIssueDate"
                    type="date"
                    value={projectData.drawingIssueDate}
                    onChange={(e) => handleInputChange('drawingIssueDate', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revision" className="text-sm">Revision</Label>
                  <Input
                    id="revision"
                    value={projectData.revision}
                    onChange={(e) => handleInputChange('revision', e.target.value)}
                    placeholder="Rev A, B, C..."
                    className="h-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityLevel" className="text-sm">Quality Level</Label>
                <Input
                  id="qualityLevel"
                  value={projectData.qualityLevel}
                  onChange={(e) => handleInputChange('qualityLevel', e.target.value)}
                  placeholder="Standard, Premium, Luxury"
                  className="h-8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specReference" className="text-sm">Spec Reference</Label>
                <Input
                  id="specReference"
                  value={projectData.specReference}
                  onChange={(e) => handleInputChange('specReference', e.target.value)}
                  placeholder="Specification document reference"
                  className="h-8"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Summary */}
      {(projectData.projectName || projectData.siteArea) && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Project Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {projectData.projectName && (
                <Badge variant="secondary">{projectData.projectName}</Badge>
              )}
              {projectData.siteArea && (
                <Badge variant="secondary">Site: {projectData.siteArea}m²</Badge>
              )}
              {projectData.numberOfLevels && (
                <Badge variant="secondary">{projectData.numberOfLevels} Levels</Badge>
              )}
              {projectData.gifa && (
                <Badge variant="secondary">GIFA: {projectData.gifa}m²</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};