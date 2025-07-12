import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, Globe, MapPin, Phone } from 'lucide-react';
import { Company } from '@/types/company';
import { format } from 'date-fns';

interface CompaniesTableProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  loading: boolean;
  canManageCompanies: boolean;
}

export const CompaniesTable = ({
  companies,
  onEditCompany,
  loading,
  canManageCompanies
}: CompaniesTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading companies...</div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No companies found</h3>
        <p className="text-slate-500">No companies match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200/50">
            <TableHead className="w-[300px]">Company</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            {canManageCompanies && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} className="border-slate-200/50 hover:bg-slate-50/50 h-12">
              <TableCell className="py-2">
                <div className="flex items-center space-x-3">
                  {company.logo_url ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-slate-900">{company.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="space-y-1">
                  {company.website && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Globe className="w-3 h-3 mr-1" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-3 h-3 mr-1" />
                      {company.phone}
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {company.address}
                    </div>
                  )}
                  {!company.website && !company.phone && !company.address && (
                    <div className="text-sm text-slate-400">No contact info</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm text-slate-600">
                  {format(new Date(company.created_at), 'MMM dd, yyyy')}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </TableCell>
              {canManageCompanies && (
                <TableCell className="text-right py-2">
                  <Button
                    onClick={() => onEditCompany(company)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 hover:border-blue-200 h-8"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};