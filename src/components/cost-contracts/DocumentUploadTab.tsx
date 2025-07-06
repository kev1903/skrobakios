import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Folder } from 'lucide-react';

interface DocumentUploadTabProps {
  onNavigate?: (page: string) => void;
}

export const DocumentUploadTab = ({ onNavigate }: DocumentUploadTabProps) => {
  const folders = [
    'Signed Contracts',
    'Variations',
    'Progress Claims',
    'Invoices / Receipts',
    'Correspondence',
    'BOQ and Cost Plans'
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-playfair">Document Upload</h2>
          <p className="text-white/70 font-helvetica">Manage project documents and files</p>
        </div>
        <Button className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <Card key={folder} className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium font-helvetica">{folder}</h3>
                  <p className="text-white/60 text-sm">0 files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};