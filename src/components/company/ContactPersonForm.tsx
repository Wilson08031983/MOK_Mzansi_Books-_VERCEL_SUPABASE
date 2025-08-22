
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Name</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.contactName}
            onChange={(e) => onInputChange('contactName', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.contactName || 'Not specified'}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Surname</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.contactSurname}
            onChange={(e) => onInputChange('contactSurname', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.contactSurname || 'Not specified'}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Position</label>
        {isEditing ? (
          <Select value={companyData.position} onValueChange={(value) => onInputChange('position', value)}>
            <SelectTrigger className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="glass backdrop-blur-md bg-white/10 dark:bg-black/80 text-foreground border border-white/10 rounded-xl">
              <SelectItem value="CEO">CEO (Chief Executive Officer)</SelectItem>
              <SelectItem value="Managing Director">Managing Director (MD)</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
              <SelectItem value="Founder">Founder</SelectItem>
              <SelectItem value="General Manager">General Manager (GM)</SelectItem>
              <SelectItem value="Operations Manager">Operations Manager</SelectItem>
              <SelectItem value="Finance Manager">Finance Manager / CFO</SelectItem>
              <SelectItem value="Bookkeeper">Bookkeeper</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{companyData.position || 'Not specified'}</p>
        )}
      </div>
    </div>
  );
};

export default ContactPersonForm;
