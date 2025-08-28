
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { Database, Download, Upload, Trash2, HardDrive, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';
import { getAllKeys, getSize, clear as clearStorage, removeItem as removeStorageItem } from '@/services/localStorageService';

const DataManagementTab = () => {
  const { t } = useLocalization();
  const [storageSize, setStorageSize] = useState(0);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxStorageSize = 25 * 1024 * 1024; // 25MB threshold per request

  const refreshStorageInfo = () => {
    try {
      setStorageSize(getSize());
      setStorageKeys(getAllKeys());
    } catch (e) {
      console.error('Failed to read storage info', e);
    }
  };

  const getKeySize = (key: string): number => {
    try {
      const value = localStorage.getItem(key) || '';
      return key.length + value.length;
    } catch {
      return 0;
    }
  };

  const handleDeleteKey = async (key: string) => {
    try {
      setDeletingKey(key);
      removeStorageItem(key);
      toast({
        title: t('settings.dataManagement.keyDeletedTitle') || 'Key deleted',
        description: key,
      });
      refreshStorageInfo();
    } catch (error) {
      console.error('Delete key failed', error);
      toast({
        title: t('settings.dataManagement.keyDeleteFailedTitle') || 'Delete failed',
        description: key,
        variant: 'destructive',
      });
    } finally {
      setDeletingKey(null);
    }
  };

  useEffect(() => {
    refreshStorageInfo();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const keys = getAllKeys();
      const exportData: Record<string, any> = {};
      for (const key of keys) {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) {
            try {
              exportData[key] = JSON.parse(value);
            } catch {
              exportData[key] = value;
            }
          }
        } catch (e) {
          console.warn(`Skipping key ${key}`, e);
        }
      }
      const exportString = JSON.stringify(exportData, null, 2);
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
    } catch (error) {
      console.error('Export failed', error);
      toast({
        title: t('settings.dataManagement.exportFailedTitle'),
        description: t('settings.dataManagement.exportFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImport: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      let importedCount = 0;
      for (const [key, value] of Object.entries(imported)) {
        try {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
          importedCount++;
        } catch (e) {
          console.warn('Failed to import key', key, e);
        }
      }
      toast({
        title: t('settings.dataManagement.importSuccessTitle'),
        description: t('settings.dataManagement.importSuccessDesc', { count: importedCount }),
      });
      refreshStorageInfo();
    } catch (error) {
      console.error('Import failed', error);
      toast({
        title: t('settings.dataManagement.importFailedTitle'),
        description: t('settings.dataManagement.importFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
    try {
      setClearing(true);
      clearStorage();
      toast({
        title: t('settings.dataManagement.clearSuccessTitle'),
        description: t('settings.dataManagement.clearSuccessDesc'),
      });
      refreshStorageInfo();
    } catch (error) {
      console.error('Clear data failed', error);
      toast({
        title: t('settings.dataManagement.clearFailedTitle'),
        description: t('settings.dataManagement.clearFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <Database className="h-5 w-5 mr-2" />
            {t('settings.dataManagement.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Overview */}
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-slate-300" />
                <Label className="text-base text-slate-100">{t('settings.dataManagement.storageUsage')}</Label>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshStorageInfo} className="text-slate-200 hover:bg-white/10">
                <RefreshCw className="h-4 w-4 mr-1" /> {t('settings.dataManagement.refresh')}
              </Button>
            </div>
            <div className="text-sm text-slate-400 mb-2">
              {t('settings.dataManagement.ofMb', { used: (storageSize / 1024).toFixed(1), total: (maxStorageSize / 1024 / 1024).toFixed(0) })}
            </div>
            <Progress value={Math.min(100, (storageSize / maxStorageSize) * 100)} />
            <div className="text-xs text-slate-500 mt-2">{t('settings.dataManagement.keysCount', { count: storageKeys.length })}</div>
          </div>

          {/* Keys List */}
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-5 w-5 text-slate-300" />
              <Label className="text-base text-slate-100">{t('settings.dataManagement.keysListTitle') || 'Stored Keys'}</Label>
            </div>
            {storageKeys.length === 0 ? (
              <p className="text-sm text-slate-400">{t('settings.dataManagement.noKeys') || 'No keys found in local storage.'}</p>
            ) : (
              <div className="max-h-72 overflow-auto divide-y divide-white/5">
                {storageKeys
                  .slice()
                  .sort((a, b) => a.localeCompare(b))
                  .map((key) => {
                    const sizeBytes = getKeySize(key);
                    const sizeKB = (sizeBytes / 1024).toFixed(2);
                    return (
                      <div key={key} className="flex items-center justify-between py-2">
                        <div className="min-w-0 pr-3">
                          <div className="text-slate-200 truncate" title={key}>{key}</div>
                          <div className="text-xs text-slate-500">{sizeKB} KB</div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingKey === key}
                              className="bg-red-800/60 hover:bg-red-800 text-red-100 border border-red-800/50"
                            >
                              {deletingKey === key ? t('common.deleting') || 'Deleting…' : t('common.delete')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('settings.dataManagement.confirmDeleteKeyTitle') || 'Delete this key?'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('settings.dataManagement.confirmDeleteKeyDesc') || 'This action cannot be undone.'}
                                <br />
                                <span className="text-slate-300">{key}</span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteKey(key)}>{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5" />
                <Label className="text-base text-slate-100">{t('settings.dataManagement.exportTitle')}</Label>
              </div>
              <p className="text-sm text-slate-400 mb-3">{t('settings.dataManagement.exportDesc')}</p>
              <Button onClick={handleExport} disabled={exporting} className="bg-slate-800/70 hover:bg-slate-800 text-slate-100 border border-white/10">
                {exporting ? t('settings.dataManagement.exporting') : t('settings.dataManagement.exportButton')}
              </Button>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5" />
                <Label className="text-base text-slate-100">{t('settings.dataManagement.importTitle')}</Label>
              </div>
              <p className="text-sm text-slate-400 mb-3">{t('settings.dataManagement.importDesc')}</p>
              <div className="flex items-center gap-2">
                <Input type="file" accept="application/json" className="hidden" ref={fileInputRef} onChange={handleImport} />
                <Button onClick={handleImportClick} disabled={importing} className="bg-slate-800/70 hover:bg-slate-800 text-slate-100 border border-white/10">
                  {importing ? t('settings.dataManagement.importing') : t('settings.dataManagement.importButton')}
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-800/40 bg-red-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-red-300" />
              <Label className="text-base text-red-200">{t('settings.dataManagement.clearAllTitle')}</Label>
            </div>
            <p className="text-sm text-red-300 mb-3">{t('settings.dataManagement.clearAllDesc')}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={clearing} className="bg-red-800/60 hover:bg-red-800 text-red-100 border border-red-800/50">{t('settings.dataManagement.clearAllButton')}</Button>
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
                  <AlertDialogAction onClick={handleClearAll}>{t('common.delete')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagementTab;
