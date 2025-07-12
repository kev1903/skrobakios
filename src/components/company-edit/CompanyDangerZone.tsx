import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';

interface CompanyDangerZoneProps {
  company: Company;
  onCompanyDeleted: () => void;
}

export const CompanyDangerZone = ({ company, onCompanyDeleted }: CompanyDangerZoneProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteCompany } = useCompanies();
  const { toast } = useToast();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setConfirmationText('');
  };

  const handleDeleteConfirm = async () => {
    if (confirmationText !== company.name) {
      toast({
        title: "Error",
        description: "Company name doesn't match. Please type the exact company name to confirm deletion.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCompany(company.id);
      
      if (result.success) {
        toast({
          title: "Company Deleted",
          description: "The company and all associated data have been permanently deleted.",
          variant: "default"
        });
        setShowDeleteDialog(false);
        onCompanyDeleted();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete company",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowDeleteDialog(false);
    setConfirmationText('');
  };

  return (
    <>
      <Card className="backdrop-blur-sm bg-red-50/60 border-red-200/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-700/80">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-100/50 rounded-lg border border-red-200/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Delete Company
                </h4>
                <p className="text-sm text-red-700/80 mb-3">
                  Permanently delete <strong>{company.name}</strong> and all associated data. 
                  This action cannot be undone and will remove:
                </p>
                <ul className="text-xs text-red-700/70 space-y-1 ml-4 list-disc">
                  <li>All company projects and tasks</li>
                  <li>All team members and their roles</li>
                  <li>All company data and settings</li>
                  <li>All integrations and modules</li>
                  <li>All time entries and estimates</li>
                </ul>
              </div>
              <Button
                onClick={handleDeleteClick}
                variant="destructive"
                size="sm"
                className="ml-4 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Company
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Delete Company
            </DialogTitle>
            <DialogDescription className="text-red-700/80">
              This action cannot be undone. This will permanently delete the company{' '}
              <strong>"{company.name}"</strong> and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-sm font-medium">
                Type the company name <strong>"{company.name}"</strong> to confirm:
              </Label>
              <Input
                id="company-name"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={company.name}
                className="border-red-200 focus:border-red-400"
              />
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700">
                <strong>Warning:</strong> This will permanently delete all company data including:
                projects, tasks, team members, time entries, estimates, and all other associated records.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="destructive"
              disabled={confirmationText !== company.name || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                'Deleting...'
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Company
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};