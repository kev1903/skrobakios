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
    
    try {
      // Extract text from all PDFs
      const extractedTexts = [];
      
      for (const pdf of uploadedPDFs) {
        try {
          console.log('Processing PDF:', pdf);
          
          // Handle different PDF structures - check if it's a File object or has file property
          let file = pdf;
          if (pdf.file && pdf.file instanceof File) {
            file = pdf.file;
          } else if (!(pdf instanceof File)) {
            console.warn('PDF is not a File object:', pdf);
            continue;
          }
          
          const formData = new FormData();
          formData.append('file', file);
          
          console.log(`Calling extract-pdf-text function for file: ${file.name}`);
          
          const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
            body: formData
          });
          
          if (error) {
            console.error(`Supabase function error for ${file.name}:`, error);
            // Continue with other PDFs even if one fails
            continue;
          }
          
          if (data?.text) {
            extractedTexts.push(data.text);
            console.log(`Successfully extracted ${data.text.length} characters from ${file.name}`);
          } else {
            console.warn(`No text extracted from ${file.name}`, data);
          }
        } catch (error) {
          console.error(`Error extracting text from PDF:`, error);
          // Continue with other PDFs even if one fails
        }
      }
      
      if (extractedTexts.length === 0) {
        throw new Error('No text could be extracted from the PDFs');
      }
      
      // Combine all extracted text
      const combinedText = extractedTexts.join('\n\n');
      
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
      
      if (aiError) throw aiError;
      
      // Parse the AI response
      let extractedData = {};
      try {
        const response = aiData?.response || aiData?.message || '';
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Could not parse extracted data');
      }
      
      // Update form with extracted data
      const updatedData = { ...projectData };
      Object.keys(extractedData).forEach(key => {
        if (extractedData[key] && extractedData[key].trim() !== '') {
          updatedData[key] = extractedData[key];
        }
      });
      
      setProjectData(updatedData);
      onDataChange?.(updatedData);
      
      toast({
        title: "Extraction complete",
        description: "Project data has been extracted from PDFs successfully."
      });
      
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract data from PDFs.",
        variant: "destructive"
      });
    } finally {
      setExtracting(false);
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
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleExtractFromPDF}
                  disabled={extracting}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <FileText className="w-4 h-4" />
                  {extracting ? 'Extracting...' : 'Extract Project Data'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Automatically extract project information from uploaded drawings and cover sheets
                </div>
              </div>
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