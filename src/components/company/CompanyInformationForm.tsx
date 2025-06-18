
import React from 'react';
import { Input } from '@/components/ui/input';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  website: string;
}

interface CompanyInformationFormProps {
  companyData: CompanyData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const CompanyInformationForm = ({ companyData, isEditing, onInputChange }: CompanyInformationFormProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Company Name</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Email</label>
          {isEditing ? (
            <input
              type="email"
              value={companyData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={companyData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Website</label>
          {isEditing ? (
            <input
              type="url"
              value={companyData.website}
              onChange={(e) => onInputChange('website', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.website}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyInformationForm;
