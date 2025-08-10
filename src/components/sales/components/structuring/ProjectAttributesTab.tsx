import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, User, Building, Calculator, Calendar, Search } from 'lucide-react';

interface ProjectAttributesTabProps {
  onDataChange?: (data: any) => void;
}

export const ProjectAttributesTab = ({ onDataChange }: ProjectAttributesTabProps) => {
  const [extracting, setExtracting] = useState(false);
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
    setExtracting(true);
    // Simulate PDF extraction
    setTimeout(() => {
      setProjectData(prev => ({
        ...prev,
        projectName: 'Residential Development',
        projectCode: 'SK_QU25021',
        address: '64 Armadale St, Armadale VIC 3143',
        clientName: 'Property Development Group',
        designer: 'Architecture Studio',
        siteArea: '650',
        numberOfLevels: '2'
      }));
      setExtracting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Auto-Extract Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Auto-Extract from PDFs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleExtractFromPDF}
              disabled={extracting}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {extracting ? 'Extracting...' : 'Extract Project Data'}
            </Button>
            <div className="text-sm text-muted-foreground">
              Automatically extract project information from uploaded drawings and cover sheets
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectCode">Project Code</Label>
                <Input
                  id="projectCode"
                  value={projectData.projectCode}
                  onChange={(e) => handleInputChange('projectCode', e.target.value)}
                  placeholder="Enter project code"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </Label>
              <Textarea
                id="address"
                value={projectData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter project address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client & Design Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Client & Design Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={projectData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientContact">Client Contact</Label>
              <Input
                id="clientContact"
                value={projectData.clientContact}
                onChange={(e) => handleInputChange('clientContact', e.target.value)}
                placeholder="Email or phone"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designer">Designer</Label>
                <Input
                  id="designer"
                  value={projectData.designer}
                  onChange={(e) => handleInputChange('designer', e.target.value)}
                  placeholder="Design firm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="architect">Architect</Label>
                <Input
                  id="architect"
                  value={projectData.architect}
                  onChange={(e) => handleInputChange('architect', e.target.value)}
                  placeholder="Architecture firm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Area Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Area Calculations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteArea">Site Area (m²)</Label>
                <Input
                  id="siteArea"
                  type="number"
                  value={projectData.siteArea}
                  onChange={(e) => handleInputChange('siteArea', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfLevels">Number of Levels</Label>
                <Input
                  id="numberOfLevels"
                  type="number"
                  value={projectData.numberOfLevels}
                  onChange={(e) => handleInputChange('numberOfLevels', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gifa">GIFA (m²)</Label>
                <Input
                  id="gifa"
                  type="number"
                  value={projectData.gifa}
                  onChange={(e) => handleInputChange('gifa', e.target.value)}
                  placeholder="Gross Internal Floor Area"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gefa">GEFA (m²)</Label>
                <Input
                  id="gefa"
                  type="number"
                  value={projectData.gefa}
                  onChange={(e) => handleInputChange('gefa', e.target.value)}
                  placeholder="Gross External Floor Area"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Key Area Breakdown</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="garageArea" className="text-sm">Garage (m²)</Label>
                  <Input
                    id="garageArea"
                    type="number"
                    value={projectData.garageArea}
                    onChange={(e) => handleInputChange('garageArea', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="landscapeArea" className="text-sm">Landscape (m²)</Label>
                  <Input
                    id="landscapeArea"
                    type="number"
                    value={projectData.landscapeArea}
                    onChange={(e) => handleInputChange('landscapeArea', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="poolArea" className="text-sm">Pool (m²)</Label>
                  <Input
                    id="poolArea"
                    type="number"
                    value={projectData.poolArea}
                    onChange={(e) => handleInputChange('poolArea', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ancillaryArea" className="text-sm">Ancillary (m²)</Label>
                  <Input
                    id="ancillaryArea"
                    type="number"
                    value={projectData.ancillaryArea}
                    onChange={(e) => handleInputChange('ancillaryArea', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drawing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Drawing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drawingIssueDate">Issue Date</Label>
                <Input
                  id="drawingIssueDate"
                  type="date"
                  value={projectData.drawingIssueDate}
                  onChange={(e) => handleInputChange('drawingIssueDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revision">Revision</Label>
                <Input
                  id="revision"
                  value={projectData.revision}
                  onChange={(e) => handleInputChange('revision', e.target.value)}
                  placeholder="Rev A, B, C..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityLevel">Quality Level</Label>
              <Input
                id="qualityLevel"
                value={projectData.qualityLevel}
                onChange={(e) => handleInputChange('qualityLevel', e.target.value)}
                placeholder="Standard, Premium, Luxury"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specReference">Spec Reference</Label>
              <Input
                id="specReference"
                value={projectData.specReference}
                onChange={(e) => handleInputChange('specReference', e.target.value)}
                placeholder="Specification document reference"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {(projectData.projectName || projectData.siteArea) && (
        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
          </CardHeader>
          <CardContent>
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