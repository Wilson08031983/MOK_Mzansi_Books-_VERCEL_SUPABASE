
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
import { getAllKeys, getSize, clear as clearStorage } from '@/services/localStorageService';

const DataManagementTab = () => {
  const [storageSize, setStorageSize] = useState(0);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxStorageSize = 10 * 1024 * 1024; // 10MB demo threshold

  const refreshStorageInfo = () => {
    try {
      setStorageSize(getSize());
      setStorageKeys(getAllKeys());
    } catch (e) {
      console.error('Failed to read storage info', e);
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
         title: 'Export successful',
         description: 'Data export created successfully',
       });
    } catch (error) {
      console.error('Export failed', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export data',
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
        title: 'Import successful',
        description: `Imported ${importedCount} data entries`,
      });
      refreshStorageInfo();
    } catch (error) {
      console.error('Import failed', error);
      toast({
        title: 'Import failed',
        description: 'Failed to import data. Please check the file format.',
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
      toast({ title: 'All data cleared', description: 'All application data has been cleared' });
      refreshStorageInfo();
    } catch (error) {
      console.error('Clear data failed', error);
      toast({ title: 'Clear failed', description: 'Failed to clear data', variant: 'destructive' });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Database className="h-5 w-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Overview */}
          <div className="rounded-xl border bg-white/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-slate-700" />
                <Label className="text-base">Local Storage Usage</Label>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshStorageInfo}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
            <div className="text-sm text-slate-600 mb-2">
              {(storageSize / 1024).toFixed(1)} KB of {(maxStorageSize / 1024 / 1024).toFixed(0)} MB
            </div>
            <Progress value={Math.min(100, (storageSize / maxStorageSize) * 100)} />
            <div className="text-xs text-slate-500 mt-2">{storageKeys.length} keys</div>
          </div>

          {/* Backup & Restore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5" />
                <Label className="text-base">Export Data</Label>
              </div>
              <p className="text-sm text-gray-600 mb-3">Download a JSON backup of your application data.</p>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>

            <div className="rounded-xl border bg-white/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5" />
                <Label className="text-base">Import Data</Label>
              </div>
              <p className="text-sm text-gray-600 mb-3">Restore data from a previously exported JSON file.</p>
              <div className="flex items-center gap-2">
                <Input type="file" accept="application/json" className="hidden" ref={fileInputRef} onChange={handleImport} />
                <Button onClick={handleImportClick} disabled={importing}>
                  {importing ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border bg-red-50/70 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-red-700" />
              <Label className="text-base text-red-800">Clear All Data</Label>
            </div>
            <p className="text-sm text-red-700 mb-3">This will permanently delete all application data in your browser.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={clearing}>Clear All Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all local data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All locally stored data including invoices, clients, and reports will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>Delete</AlertDialogAction>
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
