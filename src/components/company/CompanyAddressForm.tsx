import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';

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
  const { t } = useLocalization();
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">{t('company.forms.address.addressLabel')}</label>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-sf-pro">{t('company.forms.address.line1Label')}</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine1}
              onChange={(e) => onInputChange('addressLine1', e.target.value)}
              placeholder={t('company.forms.address.line1Placeholder')}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.addressLine1 || t('company.forms.common.notSpecified')}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-sf-pro">{t('company.forms.address.line2Label')}</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine2}
              onChange={(e) => onInputChange('addressLine2', e.target.value)}
              placeholder={t('company.forms.address.line2Placeholder')}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.addressLine2 || t('company.forms.common.notSpecified')}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-sf-pro">{t('company.forms.address.line3Label')}</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine3}
              onChange={(e) => onInputChange('addressLine3', e.target.value)}
              placeholder={t('company.forms.address.line3Placeholder')}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.addressLine3 || t('company.forms.common.notSpecified')}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-sf-pro">{t('company.forms.address.line4Label')}</label>
          {isEditing ? (
            <input
              type="text"
              value={companyData.addressLine4}
              onChange={(e) => onInputChange('addressLine4', e.target.value)}
              placeholder={t('company.forms.address.line4Placeholder')}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.addressLine4 || t('company.forms.common.notSpecified')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyAddressForm;
