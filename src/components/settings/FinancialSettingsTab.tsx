
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Calculator, Receipt, Percent, CreditCard, Building, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const FinancialSettingsTab = () => {
  const [settings, setSettings] = useState({
    currency: 'ZAR',
    taxRate: '15',
    invoicePrefix: 'INV',
    quotationPrefix: 'QUO',
    paymentTerms: '30',
    lateFee: '5',
    autoCalculateTax: true,
    roundAmounts: true,
    showTaxInclusive: false,
    bankDetails: {
      bankName: 'Standard Bank',
      accountName: 'MOK Mzansi Books',
      accountNumber: '123456789',
      branchCode: '051001'
    }
  });

  const handleSave = () => {
    localStorage.setItem('financialSettings', JSON.stringify(settings));
    toast.success('Financial settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Currency & Tax Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <DollarSign className="h-5 w-5 mr-2" />
            Currency & Tax Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxRate">Default VAT Rate (%)</Label>
              <Input
                id="taxRate"
                value={settings.taxRate}
                onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                placeholder="15"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={settings.autoCalculateTax}
                onCheckedChange={(checked) => setSettings({...settings, autoCalculateTax: checked})}
              />
              <Label>Auto-calculate tax</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Receipt className="h-5 w-5 mr-2" />
            Invoice & Document Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
              <Input
                id="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="quotationPrefix">Quotation Number Prefix</Label>
              <Input
                id="quotationPrefix"
                value={settings.quotationPrefix}
                onChange={(e) => setSettings({...settings, quotationPrefix: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Default Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                value={settings.paymentTerms}
                onChange={(e) => setSettings({...settings, paymentTerms: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="lateFee">Late Payment Fee (%)</Label>
              <Input
                id="lateFee"
                value={settings.lateFee}
                onChange={(e) => setSettings({...settings, lateFee: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Building className="h-5 w-5 mr-2" />
            Banking Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={settings.bankDetails.bankName}
                onChange={(e) => setSettings({
                  ...settings,
                  bankDetails: {...settings.bankDetails, bankName: e.target.value}
                })}
              />
            </div>
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={settings.bankDetails.accountName}
                onChange={(e) => setSettings({
                  ...settings,
                  bankDetails: {...settings.bankDetails, accountName: e.target.value}
                })}
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={settings.bankDetails.accountNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  bankDetails: {...settings.bankDetails, accountNumber: e.target.value}
                })}
              />
            </div>
            <div>
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input
                id="branchCode"
                value={settings.bankDetails.branchCode}
                onChange={(e) => setSettings({
                  ...settings,
                  bankDetails: {...settings.bankDetails, branchCode: e.target.value}
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white">
          Save Financial Settings
        </Button>
      </div>
    </div>
  );
};

export default FinancialSettingsTab;
