
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building,
  Mail,
  Phone,
  MapPin,
  User
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface QuotationDetailInfoProps {
  quotation: any;
}

const QuotationDetailInfo: React.FC<QuotationDetailInfoProps> = ({ quotation }) => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sf-pro">Quotation</h2>
            <p className="text-slate-600 font-sf-pro">{quotation.number}</p>
          </div>
          <div className="text-right">
            <p className="font-medium font-sf-pro">Date: {formatDate(quotation.date)}</p>
            <p className="text-slate-600 font-sf-pro">Expiry: {formatDate(quotation.expiryDate)}</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3 font-sf-pro">From</h3>
              <div className="space-y-1">
                <p className="font-medium font-sf-pro">Your Company Name</p>
                <p className="text-slate-600 font-sf-pro">123 Business Avenue</p>
                <p className="text-slate-600 font-sf-pro">Pretoria, 0001</p>
                <p className="text-slate-600 font-sf-pro">South Africa</p>
                <p className="text-slate-600 font-sf-pro mt-2">VAT: 4230142398</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3 font-sf-pro">To</h3>
              <div className="space-y-2">
                <p className="font-medium flex items-center font-sf-pro">
                  <Building className="h-4 w-4 text-slate-400 mr-2" />
                  {quotation.client}
                </p>
                <p className="flex items-center text-slate-600 font-sf-pro">
                  <Mail className="h-4 w-4 text-slate-400 mr-2" />
                  {quotation.clientEmail}
                </p>
                <p className="flex items-center text-slate-600 font-sf-pro">
                  <Phone className="h-4 w-4 text-slate-400 mr-2" />
                  {quotation.clientPhone}
                </p>
                <p className="flex items-start text-slate-600 font-sf-pro">
                  <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <span>{quotation.clientAddress}</span>
                </p>
                {quotation.clientContact && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    Contact: {quotation.clientContact}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationDetailInfo;
