
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization } from '../../hooks/useLocalization';

interface ContactData {
  contactName: string;
  contactSurname: string;
  position: string;
}

interface ContactPersonFormProps {
  companyData: ContactData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const ContactPersonForm = ({ companyData, isEditing, onInputChange }: ContactPersonFormProps) => {
  const { t } = useLocalization();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">{t('company.forms.contact.nameLabel')}</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.contactName}
            onChange={(e) => onInputChange('contactName', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.contactName || t('company.forms.common.notSpecified')}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">{t('company.forms.contact.surnameLabel')}</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.contactSurname}
            onChange={(e) => onInputChange('contactSurname', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.contactSurname || t('company.forms.common.notSpecified')}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">{t('company.forms.contact.positionLabel')}</label>
        {isEditing ? (
          <Select value={companyData.position} onValueChange={(value) => onInputChange('position', value)}>
            <SelectTrigger className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro">
              <SelectValue placeholder={t('company.forms.contact.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="glass backdrop-blur-md bg-white/10 dark:bg-black/80 text-foreground border border-white/10 rounded-xl">
              <SelectItem value="CEO">{t('company.forms.positions.ceo')}</SelectItem>
              <SelectItem value="Managing Director">{t('company.forms.positions.managingDirector')}</SelectItem>
              <SelectItem value="Director">{t('company.forms.positions.director')}</SelectItem>
              <SelectItem value="Founder">{t('company.forms.positions.founder')}</SelectItem>
              <SelectItem value="General Manager">{t('company.forms.positions.generalManager')}</SelectItem>
              <SelectItem value="Operations Manager">{t('company.forms.positions.operationsManager')}</SelectItem>
              <SelectItem value="Finance Manager">{t('company.forms.positions.financeManager')}</SelectItem>
              <SelectItem value="Bookkeeper">{t('company.forms.positions.bookkeeper')}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.position || t('company.forms.common.notSpecified')}</p>
        )}
      </div>
    </div>
  );
};

export default ContactPersonForm;
