import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Download, Eye, Badge, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Mock test data - replace with actual contract when available
const mockSummary = {
  title: "HIA Alterations/Additions – Example",
  status: "active",
  confidence: 0.82,
  parties: {
    principal: {legal_name:"John & Jane Example", abn:null},
    contractor:{legal_name:"Skrobaki Pty Ltd", abn:"12 345 678 901"}
  },
  money: {
    payment_type: "progress",
    contract_sum_ex_gst: 50000,
    gst: 5000,
    contract_sum_inc_gst: 55000,
    deposit_pct: 5,
    retention_pct: 10
  },
  dates: {
    start: null,
    practical_completion: null,
    defects_liability_period_days: 180
  },
  next_milestone: {name: "Base Stage", due_date: null, amount: 90000},
  insurances: [],
  clauses: {variations:{present:true}},
  signatures: [],
  risks: [{level:"medium",msg:"Retention 10% — confirm staged release."}],
  actions:[{label:"Upload DBI certificate",due:null}]
};

interface ContractSummaryPageProps {
  contractId?: string;
}

export const ContractSummaryPage = ({ contractId = "demo" }: ContractSummaryPageProps) => {
  const [contract, setContract] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // For demo purposes, use mock data
  const currentSummary = contract?.ai_summary_json || mockSummary;

  const StatusChip = ({ status }: { status: string }) => {
    const statusConfig = {
      queued: { color: "bg-gray-500", label: "Queued" },
      extracting: { color: "bg-blue-500", label: "Extracting" },
      extracted: { color: "bg-green-500", label: "Extracted" },
      needs_review: { color: "bg-amber-500", label: "Needs Review" },
      error: { color: "bg-red-500", label: "Error" },
      active: { color: "bg-green-500", label: "Active" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const ConfidenceBadge = ({ confidence }: { confidence: number }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {Math.round(confidence * 100)}% confidence
    </span>
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast.error('Please drop PDF files only');
      return;
    }
    
    if (pdfFiles.length > 1) {
      toast.error('Please drop only one PDF file at a time');
      return;
    }
    
    setSelectedFile(pdfFiles[0]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const fileName = `${contractId}/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Create version record
      const { data: versionData, error: versionError } = await supabase
        .from('contract_versions')
        .insert({
          contract_id: contractId,
          storage_path: fileName,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          status: 'queued'
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // TODO: Call n8n webhook here
      // const webhookUrl = process.env.N8N_CONTRACT_WEBHOOK_URL;
      // if (webhookUrl) {
      //   fetch(webhookUrl, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       versionId: versionData.id,
      //       contractId: contractId,
      //       storagePath: fileName
      //     })
      //   });
      // }

      setSelectedFile(null);
      toast.success('Contract uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload contract');
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);

  const formatDate = (date: string | null) => 
    date ? new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {currentSummary.title}
            </h1>
            <div className="flex items-center gap-3">
              <StatusChip status={currentSummary.status} />
              <ConfidenceBadge confidence={currentSummary.confidence} />
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Contract PDF</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                      dragActive ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-2">
                      {dragActive ? "Drop your PDF here" : "Drop PDF file here"}
                    </p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  
                  {selectedFile && (
                    <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">Cancel</Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={!selectedFile || isUploading}
                      className="flex-1"
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View PDF
            </Button>
            <Button variant="outline">Versions</Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Summary Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Facts */}
          <Card>
            <CardHeader>
              <CardTitle>Key Facts</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment Type</p>
                <p className="font-medium">{currentSummary.money.payment_type || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract Sum (ex GST)</p>
                <p className="font-medium">{formatCurrency(currentSummary.money.contract_sum_ex_gst)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deposit</p>
                <p className="font-medium">{currentSummary.money.deposit_pct}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retention</p>
                <p className="font-medium">{currentSummary.money.retention_pct}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Parties</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Principal</p>
                <p className="font-medium">{currentSummary.parties.principal.legal_name}</p>
                {currentSummary.parties.principal.abn && (
                  <p className="text-sm text-muted-foreground">ABN: {currentSummary.parties.principal.abn}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contractor</p>
                <p className="font-medium">{currentSummary.parties.contractor.legal_name}</p>
                {currentSummary.parties.contractor.abn && (
                  <p className="text-sm text-muted-foreground">ABN: {currentSummary.parties.contractor.abn}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Key Dates</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(currentSummary.dates.start)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practical Completion</p>
                <p className="font-medium">{formatDate(currentSummary.dates.practical_completion)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DLP Days</p>
                <p className="font-medium">{currentSummary.dates.defects_liability_period_days || '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Milestone */}
          {currentSummary.next_milestone && (
            <Card>
              <CardHeader>
                <CardTitle>Next Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentSummary.next_milestone.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(currentSummary.next_milestone.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(currentSummary.next_milestone.amount)}</p>
                    <Button size="sm" className="mt-2">Create Progress Claim</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risks */}
          {currentSummary.risks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Risks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentSummary.risks.map((risk: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 ${
                      risk.level === 'high' ? 'text-red-500' : 
                      risk.level === 'medium' ? 'text-amber-500' : 'text-green-500'
                    }`} />
                    <span className="text-sm">{risk.msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Versions & Files */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Versions & Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="bg-muted/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">No versions uploaded yet</p>
                <p className="text-sm text-muted-foreground">Upload your first contract PDF to get started</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};