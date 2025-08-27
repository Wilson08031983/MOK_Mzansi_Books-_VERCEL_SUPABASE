
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
import { useLocalization } from '@/hooks/useLocalization';
import { 
  getAllKeys, 
  getSize, 
  clear as clearStorage,
  setItem as setStorageItem,
  getItem as getStorageItem
} from '@/services/localStorageService';
import { auditService } from '@/services/auditService';

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
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  
  // Storage info
  const [storageSize, setStorageSize] = useState(0);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [maxStorageSize] = useState(30 * 1024 * 1024); // 30MB limit for demo
  
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
        title: t('settings.security.savedTitle'),
        description: t('settings.security.savedDesc'),
      });
      try {
        auditService.logAudit({
          category: 'data_security',
          action: 'Save Data Security Settings',
          page: 'Settings',
          section: 'Data Security',
          entityType: 'settings',
          changeType: 'update',
          newValues: { retentionSettings, encryptionSettings, privacySettings },
          description: 'User saved Data Security settings'
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: t('settings.security.errorTitle'),
        description: t('settings.security.saveErrorDesc'),
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
        title: t('settings.dataManagement.exportSuccessTitle'),
        description: t('settings.dataManagement.exportSuccessDesc'),
      });
      try {
        auditService.logAudit({
          category: 'data_security',
          action: 'Export Data',
          page: 'Settings',
          section: 'Data Security',
          entityType: 'data',
          changeType: 'export',
          description: 'User exported local application data',
          metadata: { keys: Object.keys(dataToExport), count: Object.keys(dataToExport).length }
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: t('settings.dataManagement.exportFailedTitle'),
        description: t('settings.dataManagement.exportFailedDesc'),
        variant: 'destructive',
      });
      try {
        auditService.logAudit({
          category: 'data_security',
          action: 'Export Data Failed',
          page: 'Settings',
          section: 'Data Security',
          entityType: 'data',
          changeType: 'read',
          description: 'Data export failed',
          metadata: { error: String(error) },
          severity: 'warning'
        });
      } catch {/* noop */}
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
        title: t('settings.dataManagement.importSuccessTitle'),
        description: t('settings.dataManagement.importSuccessDesc', { count: importedCount }),
      });
      try {
        auditService.logAudit({
          category: 'data_security',
          action: 'Import Data',
          page: 'Settings',
          section: 'Data Security',
          entityType: 'data',
          changeType: 'import',
          description: 'User imported local application data',
          metadata: { importedCount }
        });
      } catch {/* noop */}
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: t('settings.dataManagement.importFailedTitle'),
        description: t('settings.dataManagement.importFailedDesc'),
        variant: 'destructive',
      });
      try {
        auditService.logAudit({
          category: 'data_security',
          action: 'Import Data Failed',
          page: 'Settings',
          section: 'Data Security',
          entityType: 'data',
          changeType: 'update',
          description: 'Data import failed',
          metadata: { error: String(error) },
          severity: 'warning'
        });
      } catch {/* noop */}
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
          title: t('settings.dataManagement.clearSuccessTitle'),
          description: t('settings.dataManagement.clearSuccessDesc'),
        });
        try {
          auditService.logAudit({
            category: 'data_security',
            action: 'Clear All Data',
            page: 'Settings',
            section: 'Data Security',
            entityType: 'data',
            changeType: 'delete',
            description: 'User cleared all local application data'
          });
        } catch {/* noop */}
      } else {
        throw new Error('Clear operation failed');
      }
    } catch (error) {
      console.error('Clear failed:', error);
      toast({
        title: t('settings.dataManagement.clearFailedTitle'),
        description: t('settings.dataManagement.clearFailedDesc'),
        variant: 'destructive',
      });
      try {
        auditService.logAudit({
          category: 'data_security',
          action: 'Clear All Data Failed',
          page: 'Settings',
          section: 'Data Security',
          entityType: 'data',
          changeType: 'update',
          description: 'Failed to clear all local application data',
          metadata: { error: String(error) },
          severity: 'warning'
        });
      } catch {/* noop */}
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
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <HardDrive className="h-5 w-5 mr-2" />
            {t('settings.dataManagement.storageUsage')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('settings.dataManagement.usedStorage')}</span>
            <Badge variant={storageUsagePercentage > 80 ? 'destructive' : 'secondary'}>
              {formatBytes(storageSize)} / {formatBytes(maxStorageSize)}
            </Badge>
          </div>
          <Progress value={storageUsagePercentage} className="w-full" />
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t('settings.dataManagement.dataCategories', { count: storageKeys.length })}</span>
            <span>{t('settings.dataManagement.usedPercent', { percent: storageUsagePercentage.toFixed(1) })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Backup & Export */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Database className="h-5 w-5 mr-2" />
            {t('settings.dataManagement.exportTitle')}
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
                  {t('settings.dataManagement.exporting')}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {t('settings.dataManagement.exportButton')}
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
                    {t('settings.dataManagement.importing')}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('settings.dataManagement.importButton')}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-slate-400 space-y-1">
            <p>• {t('settings.dataManagement.exportDesc')}</p>
            <p>• {t('settings.dataManagement.importDesc')}</p>
            <p>• {t('settings.dataManagement.exportFailedDesc')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Settings */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Calendar className="h-5 w-5 mr-2" />
            {t('settings.dataManagement.retentionTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('settings.dataManagement.enableRetention')}</Label>
              <p className="text-sm text-slate-400">{t('settings.dataManagement.retentionDesc')}</p>
            </div>
            <Switch
              checked={retentionSettings.enabled}
              onCheckedChange={(checked) => {
                setRetentionSettings(prev => ({ ...prev, enabled: checked }));
                try {
                  auditService.logAudit({
                    category: 'data_security',
                    action: 'Toggle Data Retention',
                    page: 'Settings',
                    section: 'Data Security',
                    entityType: 'retention',
                    changeType: 'update',
                    newValues: { enabled: checked }
                  });
                } catch {/* noop */}
              }}
            />
          </div>

          {retentionSettings.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('settings.dataManagement.defaultRetentionDays')}</Label>
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
                    onCheckedChange={(checked) => {
                      setRetentionSettings(prev => ({ ...prev, autoCleanup: checked }));
                      try {
                        auditService.logAudit({
                          category: 'data_security',
                          action: 'Toggle Auto Cleanup',
                          page: 'Settings',
                          section: 'Data Security',
                          entityType: 'retention',
                          changeType: 'update',
                          newValues: { autoCleanup: checked }
                        });
                      } catch {/* noop */}
                    }}
                  />
                  <Label>{t('settings.dataManagement.autoCleanup')}</Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">{t('settings.dataManagement.categoryRetention')}</Label>
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
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Key className="h-5 w-5 mr-2" />
            {t('settings.dataManagement.encryptionTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('settings.dataManagement.enableEncryption')}</Label>
              <p className="text-sm text-slate-400">{t('settings.dataManagement.encryptionDesc')}</p>
            </div>
            <Switch
              checked={encryptionSettings.enabled}
              onCheckedChange={(checked) => {
                setEncryptionSettings(prev => ({ ...prev, enabled: checked }));
                try {
                  auditService.logAudit({
                    category: 'data_security',
                    action: 'Toggle Encryption',
                    page: 'Settings',
                    section: 'Data Security',
                    entityType: 'encryption',
                    changeType: 'update',
                    newValues: { enabled: checked }
                  });
                } catch {/* noop */}
              }}
            />
          </div>

          {encryptionSettings.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('settings.dataManagement.algorithm')}</Label>
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
                  <Label>{t('settings.dataManagement.keyRotationDays')}</Label>
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
                  onCheckedChange={(checked) => {
                    setEncryptionSettings(prev => ({ ...prev, encryptSensitiveData: checked }));
                    try {
                      auditService.logAudit({
                        category: 'data_security',
                        action: 'Toggle Encrypt Sensitive Data',
                        page: 'Settings',
                        section: 'Data Security',
                        entityType: 'encryption',
                        changeType: 'update',
                        newValues: { encryptSensitiveData: checked }
                      });
                    } catch {/* noop */}
                  }}
                />
                <Label>{t('settings.dataManagement.encryptPII')}</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Shield className="h-5 w-5 mr-2" />
            {t('settings.dataManagement.privacyTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.dataManagement.dataAnonymization')}</Label>
                <p className="text-sm text-slate-400">{t('settings.dataManagement.dataAnonymizationDesc')}</p>
              </div>
              <Switch
                checked={privacySettings.anonymizeData}
                onCheckedChange={(checked) => {
                  setPrivacySettings(prev => ({ ...prev, anonymizeData: checked }));
                  try {
                    auditService.logAudit({
                      category: 'data_security',
                      action: 'Toggle Anonymize Data',
                      page: 'Settings',
                      section: 'Data Security',
                      entityType: 'privacy',
                      changeType: 'update',
                      newValues: { anonymizeData: checked }
                    });
                  } catch {/* noop */}
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.dataManagement.dataMinimization')}</Label>
                <p className="text-sm text-slate-400">{t('settings.dataManagement.dataMinimizationDesc')}</p>
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
                <Label>{t('settings.dataManagement.consentTracking')}</Label>
                <p className="text-sm text-slate-400">{t('settings.dataManagement.consentTrackingDesc')}</p>
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
                <Label>{t('settings.dataManagement.rightToErasure')}</Label>
                <p className="text-sm text-slate-400">{t('settings.dataManagement.rightToErasureDesc')}</p>
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
                <Label>{t('settings.dataManagement.dataPortability')}</Label>
                <p className="text-sm text-slate-400">{t('settings.dataManagement.dataPortabilityDesc')}</p>
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
      <Card className="glass backdrop-blur-xl bg-red-950/40 border-red-500/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-red-300">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('settings.dataManagement.clearAllTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h4 className="font-medium text-red-200">{t('settings.dataManagement.clearAllTitle')}</h4>
                <p className="text-sm text-red-300">{t('settings.dataManagement.clearAllDesc')}</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('settings.dataManagement.clearAllButton')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('settings.dataManagement.confirmDeleteTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('settings.dataManagement.confirmDeleteDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearAllData}
                        disabled={clearLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {clearLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {t('common.loading')}
                          </>
                        ) : (
                          t('settings.dataManagement.clearAllButton')
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
              {t('settings.security.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('settings.security.saveSettings')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DataSecurityTab;
