
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface NumbersData {
  regNumber: string;
  vatNumber: string;
  vatNumberNotApplicable: boolean;
  taxNumber: string;
  csdNumber: string;
  csdNumberNotApplicable: boolean;
}

interface CompanyNumbersFormProps {
  companyData: NumbersData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const CompanyNumbersForm = ({ companyData, isEditing, onInputChange }: CompanyNumbersFormProps) => {
  
  const handleCheckboxChange = (field: string) => (checked: boolean) => {
    if (field === 'vatNumberNotApplicable') {
      onInputChange('vatNumberNotApplicable', checked ? 'true' : 'false');
      if (checked) onInputChange('vatNumber', 'N/A');
    } else if (field === 'csdNumberNotApplicable') {
      onInputChange('csdNumberNotApplicable', checked ? 'true' : 'false');
      if (checked) onInputChange('csdNumber', 'N/A');
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Registration Number</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.regNumber}
            onChange={(e) => onInputChange('regNumber', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.regNumber}</p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-700 font-sf-pro">VAT Number</label>
          {isEditing && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="vatNA"
                checked={companyData.vatNumberNotApplicable}
                onCheckedChange={handleCheckboxChange('vatNumberNotApplicable')}
                className="data-[state=checked]:bg-mokm-purple-500"
              />
              <label htmlFor="vatNA" className="text-xs text-slate-500 cursor-pointer">Not Applicable</label>
            </div>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={companyData.vatNumber}
            onChange={(e) => onInputChange('vatNumber', e.target.value)}
            disabled={companyData.vatNumberNotApplicable}
            className={`w-full px-4 py-3 glass backdrop-blur-sm ${companyData.vatNumberNotApplicable ? 'bg-slate-100 text-slate-400' : 'bg-white/50'} border border-slate-200 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro`}
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">
            {companyData.vatNumberNotApplicable ? 'Not Applicable' : companyData.vatNumber}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Tax Number</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.taxNumber}
            onChange={(e) => onInputChange('taxNumber', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.taxNumber}</p>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-700 font-sf-pro">CSD Registration</label>
          {isEditing && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="csdNA"
                checked={companyData.csdNumberNotApplicable}
                onCheckedChange={handleCheckboxChange('csdNumberNotApplicable')}
                className="data-[state=checked]:bg-mokm-purple-500"
              />
              <label htmlFor="csdNA" className="text-xs text-slate-500 cursor-pointer">Not Applicable</label>
            </div>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={companyData.csdNumber}
            onChange={(e) => onInputChange('csdNumber', e.target.value)}
            disabled={companyData.csdNumberNotApplicable}
            className={`w-full px-4 py-3 glass backdrop-blur-sm ${companyData.csdNumberNotApplicable ? 'bg-slate-100 text-slate-400' : 'bg-white/50'} border border-slate-200 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro`}
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.csdNumber || 'Not specified'}</p>
        )}
      </div>
    </div>
  );
};

export default CompanyNumbersForm;
