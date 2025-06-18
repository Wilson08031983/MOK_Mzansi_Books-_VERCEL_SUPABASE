
import React from 'react';

interface NumbersData {
  regNumber: string;
  vatNumber: string;
  taxNumber: string;
  maaarNumber: string;
}

interface CompanyNumbersFormProps {
  companyData: NumbersData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const CompanyNumbersForm = ({ companyData, isEditing, onInputChange }: CompanyNumbersFormProps) => {
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
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">VAT Number</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.vatNumber}
            onChange={(e) => onInputChange('vatNumber', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.vatNumber}</p>
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
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">MAAA Registration Number</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.maaarNumber}
            onChange={(e) => onInputChange('maaarNumber', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.maaarNumber || 'Not specified'}</p>
        )}
      </div>
    </div>
  );
};

export default CompanyNumbersForm;
