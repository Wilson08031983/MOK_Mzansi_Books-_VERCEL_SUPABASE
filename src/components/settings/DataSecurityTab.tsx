
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Lock, 
  Download, 
  Upload, 
  Trash2, 
  Shield, 
  Database, 
  HardDrive, 
  Calendar,
  FileText,
  AlertTriangle,
  Save,
  CheckCircle,
  XCircle,
  Loader2,
  Key,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  getAllKeys, 
  getSize, 
  clear as clearStorage,
  setItem as setStorageItem,
  getItem as getStorageItem
} from '@/services/localStorageService';

interface DataRetentionSettings {
  enabled: boolean;
  retentionPeriodDays: number;
  autoCleanup: boolean;
  categories: {
    invoices: number;
    clients: number;
    expenses: number;
    employees: number;
    attendance: number;
    reports: number;
  };
}

interface EncryptionSettings {
  enabled: boolean;
  algorithm: string;
  keyRotationDays: number;
  encryptSensitiveData: boolean;
}

interface PrivacySettings {
  anonymizeData: boolean;
  dataMinimization: boolean;
  consentTracking: boolean;
  rightToErasure: boolean;
  dataPortability: boolean;
}

const DataSecurityTab = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  
  // Storage info
  const [storageSize, setStorageSize] = useState(0);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [maxStorageSize] = useState(10 * 1024 * 1024); // 10MB limit for demo
  
  // Settings states
  const [retentionSettings, setRetentionSettings] = useState<DataRetentionSettings>({
    enabled: false,
    retentionPeriodDays: 365,
    autoCleanup: false,
    categories: {
      invoices: 730,
      clients: 1095,
      expenses: 365,
      employees: 1095,
      attendance: 365,
      reports: 180,
    }
  });
  
  const [encryptionSettings, setEncryptionSettings] = useState<EncryptionSettings>({
    enabled: false,
    algorithm: 'AES-256',
    keyRotationDays: 90,
    encryptSensitiveData: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    anonymizeData: false,
    dataMinimization: true,
    consentTracking: true,
    rightToErasure: true,
    dataPortability: true,
  });

  // Load settings and storage info on mount
  useEffect(() => {
    loadSettings();
    updateStorageInfo();
  }, []);

  const loadSettings = () => {
    try {
      const savedRetention = getStorageItem('dataRetentionSettings', retentionSettings);
      const savedEncryption = getStorageItem('encryptionSettings', encryptionSettings);
      const savedPrivacy = getStorageItem('privacySettings', privacySettings);
      
      setRetentionSettings(savedRetention);
      setEncryptionSettings(savedEncryption);
      setPrivacySettings(savedPrivacy);
    } catch (error) {
      console.error('Failed to load data security settings:', error);
    }
  };

  const updateStorageInfo = () => {
    try {
      const size = getSize();
      const keys = getAllKeys();
      setStorageSize(size);
      setStorageKeys(keys);
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      setStorageItem('dataRetentionSettings', retentionSettings);
      setStorageItem('encryptionSettings', encryptionSettings);
      setStorageItem('privacySettings', privacySettings);
      
      toast({
        title: 'Settings saved',
        description: 'Data security settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const dataToExport: Record<string, any> = {};
      const keys = getAllKeys();
      
      // Filter out sensitive keys
      const allowedKeys = keys.filter(key => 
        !key.startsWith('_') && 
        !key.includes('password') && 
        !key.includes('secret') &&
        !key.includes('token')
      );
      
      for (const key of allowedKeys) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            dataToExport[key] = JSON.parse(value);
          }
        } catch {
          dataToExport[key] = localStorage.getItem(key);
        }
      }
      
      const exportString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([exportString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mokm-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: `Exported ${allowedKeys.length} data categories.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportLoading(true);
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      let importedCount = 0;
      for (const [key, value] of Object.entries(importedData)) {
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          importedCount++;
        } catch (error) {
          console.warn(`Failed to import key: ${key}`, error);
        }
      }
      
      updateStorageInfo();
      toast({
        title: 'Import successful',
        description: `Imported ${importedCount} data entries.`,
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import failed',
        description: 'Failed to import data. Please check the file format.',
        variant: 'destructive',
      });
    } finally {
      setImportLoading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const clearAllData = async () => {
    setClearLoading(true);
    try {
      const success = clearStorage();
      if (success) {
        updateStorageInfo();
        toast({
          title: 'Data cleared',
          description: 'All application data has been permanently deleted.',
        });
      } else {
        throw new Error('Clear operation failed');
      }
    } catch (error) {
      console.error('Clear failed:', error);
      toast({
        title: 'Clear failed',
        description: 'Failed to clear data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClearLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storageUsagePercentage = (storageSize / maxStorageSize) * 100;

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <HardDrive className="h-5 w-5 mr-2" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Used Storage</span>
            <Badge variant={storageUsagePercentage > 80 ? 'destructive' : 'secondary'}>
              {formatBytes(storageSize)} / {formatBytes(maxStorageSize)}
            </Badge>
          </div>
          <Progress value={storageUsagePercentage} className="w-full" />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{storageKeys.length} data categories</span>
            <span>{storageUsagePercentage.toFixed(1)}% used</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Backup & Export */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Database className="h-5 w-5 mr-2" />
            Data Backup & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={exportData}
              disabled={exportLoading}
              className="w-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={importLoading}
              />
              <Button
                disabled={importLoading}
                className="w-full bg-gradient-to-r from-mokm-green-500 to-mokm-teal-500 hover:from-mokm-green-600 hover:to-mokm-teal-600"
              >
                {importLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Export creates a JSON backup of all your data</p>
            <p>• Import restores data from a backup file</p>
            <p>• Sensitive information like passwords are excluded from exports</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Calendar className="h-5 w-5 mr-2" />
            Data Retention Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Data Retention</Label>
              <p className="text-sm text-gray-600">Automatically manage data lifecycle</p>
            </div>
            <Switch
              checked={retentionSettings.enabled}
              onCheckedChange={(checked) =>
                setRetentionSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {retentionSettings.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Retention Period (Days)</Label>
                  <Input
                    type="number"
                    value={retentionSettings.retentionPeriodDays}
                    onChange={(e) =>
                      setRetentionSettings(prev => ({
                        ...prev,
                        retentionPeriodDays: parseInt(e.target.value) || 365
                      }))
                    }
                    min="30"
                    max="3650"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={retentionSettings.autoCleanup}
                    onCheckedChange={(checked) =>
                      setRetentionSettings(prev => ({ ...prev, autoCleanup: checked }))
                    }
                  />
                  <Label>Auto Cleanup</Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Category-specific Retention (Days)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(retentionSettings.categories).map(([category, days]) => (
                    <div key={category} className="space-y-1">
                      <Label className="text-xs capitalize">{category}</Label>
                      <Input
                        type="number"
                        value={days}
                        onChange={(e) =>
                          setRetentionSettings(prev => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              [category]: parseInt(e.target.value) || 365
                            }
                          }))
                        }
                        min="30"
                        max="3650"
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encryption Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Key className="h-5 w-5 mr-2" />
            Encryption Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Data Encryption</Label>
              <p className="text-sm text-gray-600">Encrypt sensitive data at rest</p>
            </div>
            <Switch
              checked={encryptionSettings.enabled}
              onCheckedChange={(checked) =>
                setEncryptionSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {encryptionSettings.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Encryption Algorithm</Label>
                  <Select
                    value={encryptionSettings.algorithm}
                    onValueChange={(value) =>
                      setEncryptionSettings(prev => ({ ...prev, algorithm: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-256">AES-256</SelectItem>
                      <SelectItem value="AES-128">AES-128</SelectItem>
                      <SelectItem value="ChaCha20">ChaCha20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Key Rotation (Days)</Label>
                  <Input
                    type="number"
                    value={encryptionSettings.keyRotationDays}
                    onChange={(e) =>
                      setEncryptionSettings(prev => ({
                        ...prev,
                        keyRotationDays: parseInt(e.target.value) || 90
                      }))
                    }
                    min="30"
                    max="365"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={encryptionSettings.encryptSensitiveData}
                  onCheckedChange={(checked) =>
                    setEncryptionSettings(prev => ({ ...prev, encryptSensitiveData: checked }))
                  }
                />
                <Label>Encrypt PII and Financial Data</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Shield className="h-5 w-5 mr-2" />
            Privacy & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Anonymization</Label>
                <p className="text-sm text-gray-600">Anonymize personal data for analytics</p>
              </div>
              <Switch
                checked={privacySettings.anonymizeData}
                onCheckedChange={(checked) =>
                  setPrivacySettings(prev => ({ ...prev, anonymizeData: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Minimization</Label>
                <p className="text-sm text-gray-600">Collect only necessary data</p>
              </div>
              <Switch
                checked={privacySettings.dataMinimization}
                onCheckedChange={(checked) =>
                  setPrivacySettings(prev => ({ ...prev, dataMinimization: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Consent Tracking</Label>
                <p className="text-sm text-gray-600">Track user consent for data processing</p>
              </div>
              <Switch
                checked={privacySettings.consentTracking}
                onCheckedChange={(checked) =>
                  setPrivacySettings(prev => ({ ...prev, consentTracking: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Right to Erasure</Label>
                <p className="text-sm text-gray-600">Enable data deletion requests</p>
              </div>
              <Switch
                checked={privacySettings.rightToErasure}
                onCheckedChange={(checked) =>
                  setPrivacySettings(prev => ({ ...prev, rightToErasure: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Portability</Label>
                <p className="text-sm text-gray-600">Allow users to export their data</p>
              </div>
              <Switch
                checked={privacySettings.dataPortability}
                onCheckedChange={(checked) =>
                  setPrivacySettings(prev => ({ ...prev, dataPortability: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass backdrop-blur-xl bg-red-50/80 border-red-200/50 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-red-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-100/50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h4 className="font-medium text-red-800">Clear All Data</h4>
                <p className="text-sm text-red-700">
                  This will permanently delete all application data including invoices, clients, 
                  employees, and settings. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your 
                        application data including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All invoices and quotations</li>
                          <li>Client information</li>
                          <li>Employee records</li>
                          <li>Financial data and reports</li>
                          <li>All settings and configurations</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearAllData}
                        disabled={clearLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {clearLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Clearing...
                          </>
                        ) : (
                          'Delete Everything'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DataSecurityTab;
