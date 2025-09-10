
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuditLogger from '@/hooks/useAuditLogger';
import { getCompanyAssets as getScopedCompanyAssets, saveCompanyAssets as saveScopedCompanyAssets } from '@/services/companyService';

interface AssetType {
  name: string;
  dataUrl: string;
  lastModified: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

const CompanyAssetsUpload = () => {
  const [assets, setAssets] = useState<Record<string, AssetType>>({});
  const { logDocument, logDelete, logSystem } = useAuditLogger();
  
  // Load assets from scoped storage on component mount
  useEffect(() => {
    try {
      const savedAssets = getScopedCompanyAssets();
      if (savedAssets) {
        setAssets(savedAssets as any);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }, []);
  
  // Save assets to scoped storage whenever they change
  useEffect(() => {
    try {
      saveScopedCompanyAssets(assets as any);
    } catch (error) {
      console.error('Error saving assets:', error);
    }
  }, [assets]);

  const handleAssetUpload = (assetType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      const previous = assets[assetType];
      
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        
        // For logo specifically, ensure proper dimensions for PDF generation
        if (assetType === 'Logo') {
          // Create an image to get dimensions and process
          const img = new Image();
          img.onload = () => {
            // Create a canvas with proper dimensions
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Calculate dimensions while preserving aspect ratio
            const maxWidth = 800; // Max width for high quality
            const maxHeight = 600; // Max height for high quality
            let width = img.width;
            let height = img.height;
            
            // Maintain aspect ratio while sizing down if needed
            if (width > height) {
              if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
              }
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw image with proper dimensions
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert back to data URL with slightly reduced quality for size
            const optimizedDataUrl = canvas.toDataURL('image/png', 0.9);
            
            // Save the processed image
            setAssets(prev => ({
              ...prev,
              [assetType]: {
                name: file.name,
                dataUrl: optimizedDataUrl,
                lastModified: Date.now(),
                width: width,
                height: height,
                aspectRatio: width / height
              }
            }));
            // Audit: upload or replace asset (logo)
            try {
              if (previous) {
                logDocument('Upload Asset (Replace)', 'asset', `${assetType} - ${file.name}`, assetType.toLowerCase());
                logSystem('Asset Replaced', `Replaced ${assetType}`, { assetType, oldName: previous.name, newName: file.name });
              } else {
                logDocument('Upload Asset', 'asset', `${assetType} - ${file.name}`, assetType.toLowerCase());
              }
            } catch {}
            
            // Dispatch logo update event for Settings page sync
            if (assetType === 'Logo') {
              window.dispatchEvent(new CustomEvent('companyLogoUpdated', {
                detail: { logo: optimizedDataUrl }
              }));
            }
          };
          img.src = result;
        } else {
          // For other assets, just save as is
          setAssets(prev => ({
            ...prev,
            [assetType]: {
              name: file.name,
              dataUrl: result,
              lastModified: Date.now()
            }
          }));
          // Audit: upload or replace asset (non-logo)
          try {
            if (previous) {
              logDocument('Upload Asset (Replace)', 'asset', `${assetType} - ${file.name}`, assetType.toLowerCase());
              logSystem('Asset Replaced', `Replaced ${assetType}`, { assetType, oldName: previous.name, newName: file.name });
            } else {
              logDocument('Upload Asset', 'asset', `${assetType} - ${file.name}`, assetType.toLowerCase());
            }
          } catch {}
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const removeAsset = (assetType: string) => () => {
    const prevAsset = assets[assetType];
    setAssets(prev => {
      const newAssets = {...prev};
      delete newAssets[assetType];
      return newAssets;
    });
    // Audit: removal
    try {
      logDelete('asset', assetType, assetType.toLowerCase());
      if (prevAsset) {
        logSystem('Asset Removed', `Removed ${assetType}`, { assetType, name: prevAsset.name });
      }
    } catch {}
  };
  
  return (
    <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-100 font-sf-pro text-xl">Company Assets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Logo', 'Stamp', 'Signature'].map((asset) => (
            <div key={asset} className="text-center">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 font-sf-pro">{asset}</label>
              
              {assets[asset] ? (
                <div className="relative group">
                  <img 
                    src={assets[asset].dataUrl} 
                    alt={`Company ${asset}`} 
                    className="h-48 w-full object-contain p-4 glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/10 rounded-2xl shadow-business"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-2xl">
                    <div className="flex space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => document.getElementById(`${asset.toLowerCase()}-upload`)?.click()}
                        className="glass backdrop-blur-md bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-white/10"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Replace
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={removeAsset(asset)}
                        className="bg-red-500/90 hover:bg-red-500 text-white shadow-sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{assets[asset].name}</p>
                </div>
              ) : (
                <label htmlFor={`${asset.toLowerCase()}-upload`} className="glass backdrop-blur-md bg-white/10 dark:bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center h-48 shadow-business">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4 group-hover:text-mokm-purple-500 transition-colors" />
                  <p className="text-slate-600 dark:text-slate-400 font-sf-pro text-sm">Click to upload {asset.toLowerCase()}</p>
                </label>
              )}
              
              <input 
                type="file" 
                id={`${asset.toLowerCase()}-upload`} 
                onChange={handleAssetUpload(asset)} 
                accept="image/*"
                className="hidden" 
              />
            </div>
          ))}
        </div>
        
        <div className="glass backdrop-blur-md bg-amber-500/10 dark:bg-amber-400/10 border border-amber-200/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl shadow-business">
          <p className="text-sm font-sf-pro">
            <strong>Note:</strong> Images with no backgrounds are preferred.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyAssetsUpload;
