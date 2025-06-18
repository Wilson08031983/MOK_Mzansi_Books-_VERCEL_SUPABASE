
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Globe, 
  Monitor, 
  Upload,
  Calendar,
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react';

const GeneralSettingsTab = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'MOKMzansiBooks',
    businessType: 'Software Company',
    industry: 'Technology',
    registrationNumber: 'REG123456789',
    vatNumber: 'VAT987654321',
    physicalAddress: '123 Business Street, Cape Town, 8001',
    mailingAddress: 'PO Box 123, Cape Town, 8000'
  });

  const [localization, setLocalization] = useState({
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    firstDayOfWeek: 'Monday',
    numberFormat: '1,234.56',
    measurementUnits: 'metric'
  });

  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light',
    colorScheme: 'default',
    fontSize: 'medium',
    dashboardLayout: 'cards',
    defaultView: 'grid',
    listDensity: 'comfortable',
    navigationStyle: 'sidebar'
  });

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Building2 className="h-5 w-5 mr-2" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={companyInfo.businessType}
                onChange={(e) => setCompanyInfo({...companyInfo, businessType: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={companyInfo.industry}
                onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={companyInfo.registrationNumber}
                onChange={(e) => setCompanyInfo({...companyInfo, registrationNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                value={companyInfo.vatNumber}
                onChange={(e) => setCompanyInfo({...companyInfo, vatNumber: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Label>Company Logo</Label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-mokm-orange-200 to-mokm-purple-200 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-mokm-purple-600" />
              </div>
              <Button variant="outline" className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <Label htmlFor="physicalAddress">Physical Address</Label>
              <Input
                id="physicalAddress"
                value={companyInfo.physicalAddress}
                onChange={(e) => setCompanyInfo({...companyInfo, physicalAddress: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="mailingAddress">Mailing Address</Label>
              <Input
                id="mailingAddress"
                value={companyInfo.mailingAddress}
                onChange={(e) => setCompanyInfo({...companyInfo, mailingAddress: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Globe className="h-5 w-5 mr-2" />
            Localization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="language">Default Language</Label>
              <select
                id="language"
                className="w-full p-2 border rounded-lg"
                value={localization.language}
                onChange={(e) => setLocalization({...localization, language: e.target.value})}
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">Zulu</option>
                <option value="xh">Xhosa</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <select
                id="dateFormat"
                className="w-full p-2 border rounded-lg"
                value={localization.dateFormat}
                onChange={(e) => setLocalization({...localization, dateFormat: e.target.value})}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timeFormat">Time Format</Label>
              <select
                id="timeFormat"
                className="w-full p-2 border rounded-lg"
                value={localization.timeFormat}
                onChange={(e) => setLocalization({...localization, timeFormat: e.target.value})}
              >
                <option value="24h">24 Hour</option>
                <option value="12h">12 Hour</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full p-2 border rounded-lg"
                value={localization.timezone}
                onChange={(e) => setLocalization({...localization, timezone: e.target.value})}
              >
                <option value="Africa/Johannesburg">South Africa (SAST)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">London (GMT)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Monitor className="h-5 w-5 mr-2" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                className="w-full p-2 border rounded-lg"
                value={displaySettings.theme}
                onChange={(e) => setDisplaySettings({...displaySettings, theme: e.target.value})}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <Label htmlFor="colorScheme">Color Scheme</Label>
              <select
                id="colorScheme"
                className="w-full p-2 border rounded-lg"
                value={displaySettings.colorScheme}
                onChange={(e) => setDisplaySettings({...displaySettings, colorScheme: e.target.value})}
              >
                <option value="default">Default</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <select
                id="fontSize"
                className="w-full p-2 border rounded-lg"
                value={displaySettings.fontSize}
                onChange={(e) => setDisplaySettings({...displaySettings, fontSize: e.target.value})}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettingsTab;
