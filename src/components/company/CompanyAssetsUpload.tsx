
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetType {
  name: string;
  dataUrl: string;
  lastModified: number;
}

const CompanyAssetsUpload = () => {
  const [assets, setAssets] = useState<Record<string, AssetType>>({});
  
  // Load assets from localStorage on component mount
  useEffect(() => {
    try {
      const savedAssets = localStorage.getItem('companyAssets');
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }
    } catch (error) {
      console.error('Error loading assets from localStorage:', error);
    }
  }, []);
  
  // Save assets to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(assets).length > 0) {
      localStorage.setItem('companyAssets', JSON.stringify(assets));
    }
  }, [assets]);

  const handleAssetUpload = (assetType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        setAssets(prev => ({
          ...prev,
          [assetType]: {
            name: file.name,
            dataUrl: result,
            lastModified: Date.now()
          }
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const removeAsset = (assetType: string) => () => {
    setAssets(prev => {
      const newAssets = {...prev};
      delete newAssets[assetType];
      return newAssets;
    });
  };
  
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-slate-900 font-sf-pro text-xl">Company Assets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Logo', 'Stamp', 'Signature'].map((asset) => (
            <div key={asset} className="text-center">
              <label className="block text-sm font-medium text-slate-700 mb-4 font-sf-pro">{asset}</label>
              
              {assets[asset] ? (
                <div className="relative group">
                  <img 
                    src={assets[asset].dataUrl} 
                    alt={`Company ${asset}`} 
                    className="h-48 w-full object-contain p-4 glass backdrop-blur-sm bg-white/30 border-2 border-white/40 rounded-2xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 rounded-2xl">
                    <div className="flex space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => document.getElementById(`${asset.toLowerCase()}-upload`)?.click()}
                        className="bg-white hover:bg-slate-100 text-slate-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Replace
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={removeAsset(asset)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{assets[asset].name}</p>
                </div>
              ) : (
                <label htmlFor={`${asset.toLowerCase()}-upload`} className="glass backdrop-blur-sm bg-white/30 border-2 border-dashed border-white/40 rounded-2xl p-8 hover:bg-white/40 transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center h-48">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4 group-hover:text-mokm-purple-500 transition-colors" />
                  <p className="text-slate-600 font-sf-pro text-sm">Click to upload {asset.toLowerCase()}</p>
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
        
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
          <p className="text-yellow-700 text-sm font-sf-pro">
            <strong>Note:</strong> Images with no backgrounds are preferred.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyAssetsUpload;
