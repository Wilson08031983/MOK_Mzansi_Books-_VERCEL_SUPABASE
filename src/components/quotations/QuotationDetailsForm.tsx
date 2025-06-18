
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import ClientSelector from './ClientSelector';

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  type: string;
}

interface QuotationDetailsFormProps {
  quotationNumber: string;
  onQuotationNumberChange: (value: string) => void;
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
  issueDate: string;
  onIssueDateChange: (value: string) => void;
  expiryDate: string;
  onExpiryDateChange: (value: string) => void;
  clients: Client[];
}

const QuotationDetailsForm: React.FC<QuotationDetailsFormProps> = ({
  quotationNumber,
  onQuotationNumberChange,
  selectedClientId,
  onClientSelect,
  issueDate,
  onIssueDateChange,
  expiryDate,
  onExpiryDateChange,
  clients
}) => {
  const [showClientSelector, setShowClientSelector] = React.useState(false);
  const selectedClient = clients.find(client => client.id === selectedClientId);

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
      <CardHeader>
        <CardTitle className="text-lg font-sf-pro">Quotation Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quotationNumber" className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
              Quotation Number
            </label>
            <input
              id="quotationNumber"
              type="text"
              value={quotationNumber}
              onChange={(e) => onQuotationNumberChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              placeholder="QUO-2025-0001"
            />
          </div>
          
          <ClientSelector
            selectedClient={selectedClient}
            isOpen={showClientSelector}
            onClose={() => setShowClientSelector(false)}
            onSelectClient={onClientSelect}
            onOpenSelector={() => setShowClientSelector(true)}
            clients={clients}
          />
          
          <div>
            <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
              Issue Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => onIssueDateChange(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 mb-1 font-sf-pro">
              Expiry Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => onExpiryDateChange(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationDetailsForm;
