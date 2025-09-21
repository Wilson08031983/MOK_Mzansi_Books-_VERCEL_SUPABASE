
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalization } from '@/hooks/useLocalization';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  website: string;
  websiteNotApplicable: boolean;
}

interface CompanyInformationFormProps {
  companyData: CompanyData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const CompanyInformationForm = ({ companyData, isEditing, onInputChange }: CompanyInformationFormProps) => {
  const { t } = useLocalization();
  
  const handleWebsiteCheckboxChange = (checked: boolean) => {
    onInputChange('websiteNotApplicable', checked ? 'true' : 'false');
    if (checked) onInputChange('website', 'N/A');
  };
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">{t('company.forms.information.nameLabel')}</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">{t('company.forms.information.emailLabel')}</label>
          {isEditing ? (
            <input
              type="email"
              value={companyData.email}
              readOnly
              disabled
              aria-readonly="true"
              title="Email is locked for security and cannot be changed"
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/5 text-slate-500 placeholder:text-slate-400 border border-white/10 rounded-xl opacity-70 cursor-not-allowed font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">{t('company.forms.information.phoneLabel')}</label>
          {isEditing ? (
            <input
              type="tel"
              value={companyData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.phone}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-300 font-sf-pro">{t('company.forms.information.websiteLabel')}</label>
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="websiteNA"
                  checked={companyData.websiteNotApplicable}
                  onCheckedChange={handleWebsiteCheckboxChange}
                  className="data-[state=checked]:bg-mokm-purple-500"
                />
                <label htmlFor="websiteNA" className="text-xs text-slate-400 cursor-pointer">{t('company.forms.common.notApplicable')}</label>
              </div>
            )}
          </div>
          {isEditing ? (
            <input
              type="url"
              value={companyData.website}
              onChange={(e) => onInputChange('website', e.target.value)}
              disabled={companyData.websiteNotApplicable}
              className={`w-full px-4 py-3 glass backdrop-blur-md ${companyData.websiteNotApplicable ? 'bg-white/5 text-slate-500' : 'bg-white/10 dark:bg-black/30 text-foreground'} placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro`}
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">
              {companyData.websiteNotApplicable ? t('company.forms.common.notApplicable') : companyData.website}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyInformationForm;
