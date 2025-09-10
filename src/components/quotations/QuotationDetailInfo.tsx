
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building,
  Mail,
  Phone,
  MapPin,
  User,
  Globe,
  CreditCard
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { getCompany as getScopedCompany } from '@/services/companyService';

interface Client {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  website?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostal?: string;
  billingCountry?: string;
  contactPerson?: string;
}

interface CompanyDetails {
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  vatNumber?: string;
  vatNumberNotApplicable?: boolean;
  regNumber?: string;
  regNumberNotApplicable?: boolean;
  website?: string;
  websiteNotApplicable?: boolean;
}

interface Quotation {
  id: string;
  number: string;
  date: string;
  expiryDate?: string;
  clientId: string;
  clientEmail?: string;
  clientPhone?: string;
  clientContact?: string;
  clientAddress?: string;
  client?: string;
}

interface QuotationDetailInfoProps {
  quotation: Quotation;
}

const QuotationDetailInfo: React.FC<QuotationDetailInfoProps> = ({ quotation }) => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({ name: 'Your Company Name' });
  const [clientDetails, setClientDetails] = useState<Client | null>(null);
  // Fetch company details
  useEffect(() => {
    try {
      const company = getScopedCompany();
      if (company) {
        setCompanyDetails(company as any);
      }
    } catch (error) {
      console.error('Error loading company details:', error);
    }
  }, []);

  // Fetch client details from localStorage based on quotation.clientId
  useEffect(() => {
    if (!quotation.clientId) return;
    
    try {
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const client = clients.find((c: Client) => c.id === quotation.clientId);
        if (client) {
          setClientDetails(client);
        }
      }
    } catch (error) {
      console.error('Error loading client details:', error);
    }
  }, [quotation.clientId]);

  // Format company address
  const formatCompanyAddress = () => {
    const lines = [
      companyDetails.addressLine1,
      companyDetails.addressLine2,
      companyDetails.addressLine3,
      companyDetails.addressLine4
    ].filter(line => line && line.trim().length > 0);
    
    return lines;
  };

  // Format client address
  const formatClientAddress = () => {
    if (!clientDetails) return [];
    
    const lines = [];
    if (clientDetails.billingStreet) lines.push(clientDetails.billingStreet);
    
    const cityStatePostal = [
      clientDetails.billingCity,
      clientDetails.billingState,
      clientDetails.billingPostal
    ].filter(Boolean).join(', ');
    
    if (cityStatePostal) lines.push(cityStatePostal);
    if (clientDetails.billingCountry) lines.push(clientDetails.billingCountry);
    
    return lines;
  };
  
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
            {quotation.expiryDate && (
              <p className="text-slate-600 font-sf-pro">Expiry: {formatDate(quotation.expiryDate)}</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3 font-sf-pro">From</h3>
              <div className="space-y-2">
                <p className="font-medium flex items-center font-sf-pro">
                  <Building className="h-4 w-4 text-slate-400 mr-2" />
                  {companyDetails.name || 'Your Company Name'}
                </p>
                
                {companyDetails.email && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    {companyDetails.email}
                  </p>
                )}
                
                {companyDetails.phone && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <Phone className="h-4 w-4 text-slate-400 mr-2" />
                    {companyDetails.phone}
                  </p>
                )}
                
                {!companyDetails.websiteNotApplicable && companyDetails.website && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <Globe className="h-4 w-4 text-slate-400 mr-2" />
                    {companyDetails.website}
                  </p>
                )}
                
                <div className="flex items-start text-slate-600 font-sf-pro">
                  <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    {formatCompanyAddress().map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
                
                {!companyDetails.vatNumberNotApplicable && companyDetails.vatNumber && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <CreditCard className="h-4 w-4 text-slate-400 mr-2" />
                    VAT: {companyDetails.vatNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3 font-sf-pro">To</h3>
              <div className="space-y-2">
                <p className="font-medium flex items-center font-sf-pro">
                  <Building className="h-4 w-4 text-slate-400 mr-2" />
                  {clientDetails?.companyName || 
                   (clientDetails?.firstName && clientDetails?.lastName ? 
                    `${clientDetails.firstName} ${clientDetails.lastName}` : 
                    quotation.client || 'Client')}
                </p>
                
                <p className="flex items-center text-slate-600 font-sf-pro">
                  <Mail className="h-4 w-4 text-slate-400 mr-2" />
                  {clientDetails?.email || quotation.clientEmail || 'No email provided'}
                </p>
                
                {(clientDetails?.phone || quotation.clientPhone) && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <Phone className="h-4 w-4 text-slate-400 mr-2" />
                    {clientDetails?.phone || quotation.clientPhone}
                  </p>
                )}
                
                {clientDetails?.website && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <Globe className="h-4 w-4 text-slate-400 mr-2" />
                    {clientDetails.website}
                  </p>
                )}
                
                <div className="flex items-start text-slate-600 font-sf-pro">
                  <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    {formatClientAddress().length > 0 ? (
                      formatClientAddress().map((line, i) => (
                        <div key={i}>{line}</div>
                      ))
                    ) : (
                      <div>{quotation.clientAddress || 'No address provided'}</div>
                    )}
                  </div>
                </div>
                
                {(clientDetails?.contactPerson || quotation.clientContact) && (
                  <p className="flex items-center text-slate-600 font-sf-pro">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    Contact: {clientDetails?.contactPerson || quotation.clientContact}
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
