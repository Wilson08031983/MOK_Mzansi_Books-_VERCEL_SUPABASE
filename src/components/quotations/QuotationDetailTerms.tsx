
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QuotationDetailTermsProps {
  quotation: any;
}

const QuotationDetailTerms: React.FC<QuotationDetailTermsProps> = ({ quotation }) => {
  if (!quotation.terms && !quotation.notes) {
    return null;
  }

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotation.terms && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2 font-sf-pro">Terms and Conditions</h3>
              <p className="text-slate-700 font-sf-pro">{quotation.terms}</p>
            </div>
          )}
          
          {quotation.notes && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2 font-sf-pro">Notes</h3>
              <p className="text-slate-700 font-sf-pro">{quotation.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationDetailTerms;
