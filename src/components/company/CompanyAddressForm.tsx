
import React from 'react';

interface AddressData {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
}

interface CompanyAddressFormProps {
  companyData: AddressData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const CompanyAddressForm = ({ companyData, isEditing, onInputChange }: CompanyAddressFormProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Address</label>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1 font-sf-pro">Address Line 1</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine1}
              onChange={(e) => onInputChange('addressLine1', e.target.value)}
              placeholder="Street number and name"
              className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.addressLine1 || 'Not specified'}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1 font-sf-pro">Address Line 2</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine2}
              onChange={(e) => onInputChange('addressLine2', e.target.value)}
              placeholder="Apartment, suite, building (optional)"
              className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.addressLine2 || 'Not specified'}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1 font-sf-pro">Address Line 3</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine3}
              onChange={(e) => onInputChange('addressLine3', e.target.value)}
              placeholder="District, suburb (optional)"
              className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.addressLine3 || 'Not specified'}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1 font-sf-pro">Address Line 4</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine4}
              onChange={(e) => onInputChange('addressLine4', e.target.value)}
              placeholder="City, postal code"
              className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.addressLine4 || 'Not specified'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyAddressForm;
