import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload } from 'lucide-react';

interface ProgressClaimsTabProps {
  onNavigate?: (page: string) => void;
}

export const ProgressClaimsTab = ({ onNavigate }: ProgressClaimsTabProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-playfair">Progress Claims</h2>
          <p className="text-white/70 font-helvetica">Track project progress claims and payments</p>
        </div>
        <Button className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Claim
        </Button>
      </div>
      
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Claims Register</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Progress claims functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};