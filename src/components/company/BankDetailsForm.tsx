import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BankDetailsData {
  bankName: string;
  accountHolder: string;
  bankAccount: string;
  accountType: string;
  branchCode: string;
}

interface BankDetailsFormProps {
  bankData: BankDetailsData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const BankDetailsForm = ({ bankData, isEditing, onInputChange }: BankDetailsFormProps) => {
  return (
    <div>
      <h3 className="text-md font-medium text-foreground mb-4 font-sf-pro border-b border-white/10 pb-2">Bank Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Bank Name</label>
          {isEditing ? (
            <input
              type="text"
              value={bankData.bankName || ''}
              onChange={(e) => onInputChange('bankName', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              placeholder="Enter bank name"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{bankData.bankName || 'Not specified'}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Account Holder</label>
          {isEditing ? (
            <input
              type="text"
              value={bankData.accountHolder || ''}
              onChange={(e) => onInputChange('accountHolder', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              placeholder="Enter account holder name"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{bankData.accountHolder || 'Not specified'}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Bank Account</label>
          {isEditing ? (
            <input
              type="text"
              value={bankData.bankAccount || ''}
              onChange={(e) => onInputChange('bankAccount', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              placeholder="Enter bank account number"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{bankData.bankAccount || 'Not specified'}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Account Type</label>
          {isEditing ? (
            <Select
              value={bankData.accountType || ''}
              onValueChange={(value) => onInputChange('accountType', value)}
            >
              <SelectTrigger className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="glass backdrop-blur-md bg-white/10 dark:bg-black/80 text-foreground border border-white/10 rounded-xl">
                <SelectItem value="Current">Current</SelectItem>
                <SelectItem value="Savings">Savings</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{bankData.accountType || 'Not specified'}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 font-sf-pro">Branch Code</label>
          {isEditing ? (
            <input
              type="text"
              value={bankData.branchCode || ''}
              onChange={(e) => onInputChange('branchCode', e.target.value)}
              className="w-full px-4 py-3 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-foreground placeholder:text-slate-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              placeholder="Enter branch code"
            />
          ) : (
            <p className="px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl font-sf-pro text-foreground">{bankData.branchCode || 'Not specified'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetailsForm;
