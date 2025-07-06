import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, FileText, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContractDetailsTabProps {
  onNavigate?: (page: string) => void;
}

export const ContractDetailsTab = ({ onNavigate }: ContractDetailsTabProps) => {
  const [formData, setFormData] = useState({
    project: '',
    contractType: '',
    contractValue: '',
    signedDate: null as Date | null,
    startDate: null as Date | null,
    completionDate: null as Date | null,
    retention: '',
    deposit: '',
    notes: ''
  });

  const [contractFile, setContractFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setContractFile(file);
    }
  };

  const handleSave = () => {
    console.log('Saving contract details:', formData);
    // TODO: Implement save functionality
  };

  const DatePicker = ({ value, onChange, placeholder }: { value: Date | null, onChange: (date: Date | null) => void, placeholder: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
            !value && "text-white/60"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white/90 backdrop-blur-xl border-white/30">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={onChange}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-playfair">Contract Details</h2>
          <p className="text-white/70 font-helvetica">Manage project contract information and documentation</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm">
          <Save className="w-4 h-4 mr-2" />
          Save Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Information */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white font-playfair">Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project" className="text-white/90 font-helvetica">Project</Label>
              <Select value={formData.project} onValueChange={(value) => handleInputChange('project', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
                  <SelectItem value="project-1">Residential Development - Phase 1</SelectItem>
                  <SelectItem value="project-2">Commercial Office Building</SelectItem>
                  <SelectItem value="project-3">Industrial Warehouse Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractType" className="text-white/90 font-helvetica">Contract Type</Label>
              <Select value={formData.contractType} onValueChange={(value) => handleInputChange('contractType', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
                  <SelectItem value="hia">HIA Contract</SelectItem>
                  <SelectItem value="as4000">AS4000 Contract</SelectItem>
                  <SelectItem value="lump-sum">Lump Sum Contract</SelectItem>
                  <SelectItem value="design-construct">Design & Construct</SelectItem>
                  <SelectItem value="cost-plus">Cost Plus Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractValue" className="text-white/90 font-helvetica">Contract Value</Label>
              <Input
                id="contractValue"
                type="text"
                placeholder="$0.00"
                value={formData.contractValue}
                onChange={(e) => handleInputChange('contractValue', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention" className="text-white/90 font-helvetica">Retention (%)</Label>
              <Input
                id="retention"
                type="text"
                placeholder="5% or Free text"
                value={formData.retention}
                onChange={(e) => handleInputChange('retention', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit" className="text-white/90 font-helvetica">Deposit or Security Held</Label>
              <Input
                id="deposit"
                type="text"
                placeholder="$0.00"
                value={formData.deposit}
                onChange={(e) => handleInputChange('deposit', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contract Dates & Documentation */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white font-playfair">Dates & Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white/90 font-helvetica">Contract Signed Date</Label>
              <DatePicker
                value={formData.signedDate}
                onChange={(date) => handleInputChange('signedDate', date)}
                placeholder="Select signed date"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/90 font-helvetica">Start Date</Label>
              <DatePicker
                value={formData.startDate}
                onChange={(date) => handleInputChange('startDate', date)}
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/90 font-helvetica">Completion Date</Label>
              <DatePicker
                value={formData.completionDate}
                onChange={(date) => handleInputChange('completionDate', date)}
                placeholder="Select completion date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-file" className="text-white/90 font-helvetica">Signed Contract File</Label>
              <div className="flex items-center gap-4">
                <input
                  id="contract-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('contract-file')?.click()}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Contract
                </Button>
                {contractFile && (
                  <div className="flex items-center gap-2 text-white/80">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{contractFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes & Activity Log */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Notes & Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white/90 font-helvetica">Contract Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant notes about the contract..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/60 min-h-[120px]"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium font-helvetica">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Contract details updated</p>
                  <p className="text-white/60 text-xs">2 hours ago by John Smith</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Contract file uploaded</p>
                  <p className="text-white/60 text-xs">1 day ago by Sarah Johnson</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};