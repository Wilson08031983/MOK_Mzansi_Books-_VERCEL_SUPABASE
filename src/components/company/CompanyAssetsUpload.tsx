
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

const CompanyAssetsUpload = () => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-slate-900 font-sf-pro text-xl">Company Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Logo', 'Stamp', 'Signature'].map((asset) => (
            <div key={asset} className="text-center">
              <label className="block text-sm font-medium text-slate-700 mb-4 font-sf-pro">{asset}</label>
              <div className="glass backdrop-blur-sm bg-white/30 border-2 border-dashed border-white/40 rounded-2xl p-8 hover:bg-white/40 transition-all duration-300 group cursor-pointer">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4 group-hover:text-mokm-purple-500 transition-colors" />
                <p className="text-slate-600 font-sf-pro text-sm">Click to upload {asset.toLowerCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyAssetsUpload;
