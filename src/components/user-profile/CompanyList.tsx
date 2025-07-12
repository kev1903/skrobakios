import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, Globe, MapPin, Phone, Mail } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { UserCompany } from '@/types/company';

export const CompanyList = () => {
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const { getUserCompanies, loading } = useCompanies();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const userCompanies = await getUserCompanies();
        setCompanies(userCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, [getUserCompanies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/70">Loading companies...</div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/70">No companies found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companies.map((company) => (
        <Card 
          key={company.id} 
          className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{company.name}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {company.role}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {company.status}
                  </span>
                </div>
              </div>
              {company.logo_url && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/20">
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Slug: {company.slug}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};