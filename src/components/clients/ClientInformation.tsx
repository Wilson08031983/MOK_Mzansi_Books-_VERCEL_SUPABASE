
import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText, 
  Briefcase,
  Building,
  User
} from 'lucide-react';

type ClientType = 'individual' | 'company' | 'government' | 'non-profit';

type Client = {
  type: ClientType;
  email: string;
  phone: string;
  address: string;
  contactPerson?: string;
  position?: string;
  registrationNumber?: string;
  taxNumber?: string;
  industry?: string;
  website?: string;
  notes?: string;
};

interface ClientInformationProps {
  client: Client;
}

export const ClientInformation: React.FC<ClientInformationProps> = ({ client }) => {
  const getClientTypeIcon = (type: ClientType) => {
    switch (type) {
      case 'company':
        return <Building className="h-5 w-5" />;
      case 'government':
        return <Building className="h-5 w-5" />;
      case 'non-profit':
        return <Building className="h-5 w-5" />;
      case 'individual':
      default:
        return <User className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 mr-2">
            {getClientTypeIcon(client.type)}
          </div>
          <h2 className="text-lg font-medium font-sf-pro">Client Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1 font-sf-pro">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                <div>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline font-sf-pro">
                    {client.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                <div>
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline font-sf-pro">
                    {client.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-slate-700 font-sf-pro">{client.address}</p>
                </div>
              </div>
              
              {client.website && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-sf-pro">
                      {client.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1 font-sf-pro">Business Details</h3>
            <div className="space-y-3">
              {client.type !== 'individual' && client.contactPerson && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-700 font-sf-pro">{client.contactPerson}</p>
                    {client.position && (
                      <p className="text-sm text-slate-500 font-sf-pro">{client.position}</p>
                    )}
                  </div>
                </div>
              )}
              
              {client.registrationNumber && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 font-sf-pro">Registration Number</p>
                    <p className="text-slate-700 font-sf-pro">{client.registrationNumber}</p>
                  </div>
                </div>
              )}
              
              {client.taxNumber && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 font-sf-pro">Tax Number</p>
                    <p className="text-slate-700 font-sf-pro">{client.taxNumber}</p>
                  </div>
                </div>
              )}
              
              {client.industry && (
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 font-sf-pro">Industry</p>
                    <p className="text-slate-700 font-sf-pro">{client.industry}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3 font-sf-pro">Notes</h2>
          <p className="text-slate-700 font-sf-pro">{client.notes}</p>
        </div>
      )}
    </div>
  );
};
