
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
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Name</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.contactName}
            onChange={(e) => onInputChange('contactName', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.contactName || 'Not specified'}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Surname</label>
        {isEditing ? (
          <input
            type="text"
            value={companyData.contactSurname}
            onChange={(e) => onInputChange('contactSurname', e.target.value)}
            className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
          />
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.contactSurname || 'Not specified'}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">Position</label>
        {isEditing ? (
          <Select value={companyData.position} onValueChange={(value) => onInputChange('position', value)}>
            <SelectTrigger className="w-full px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="glass backdrop-blur-sm bg-white/95 border border-white/20 rounded-xl">
              <SelectItem value="CEO">CEO</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Bookkeeper">Bookkeeper</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
              <SelectItem value="Founder">Founder</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <p className="px-4 py-3 bg-slate-50 rounded-xl font-sf-pro text-slate-900">{companyData.position || 'Not specified'}</p>
        )}
      </div>
    </div>
  );
};

export default ContactPersonForm;
