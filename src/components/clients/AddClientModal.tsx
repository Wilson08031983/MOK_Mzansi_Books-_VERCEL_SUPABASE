
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Save, User, Building, MapPin, CreditCard, Check, AlertCircle } from 'lucide-react';
import { addClient, getClientById, ClientFormData } from '@/services/clientService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: (client?: any) => void;
  clientId?: string;
  viewMode?: boolean;
}

const AddClientModal = ({ isOpen, onClose, onClientAdded, clientId, viewMode = false }: AddClientModalProps) => {
  const [formData, setFormData] = useState<ClientFormData>({
    // Basic Information
    clientType: 'individual',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    websiteNotApplicable: false,
    taxNumber: '',
    registrationNumber: '',
    vatNumber: '',
    vatNumberNotApplicable: false,
    
    // Billing Address
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingPostal: '',
    billingCountry: 'South Africa',
    
    // Shipping Address
    sameAsBilling: true,
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingPostal: '',
    shippingCountry: 'South Africa',
    
    // Payment Information
    paymentTerms: '30',
    currency: 'ZAR',
    creditLimit: '',
    discountRate: '',
    preferredPaymentMethod: 'bank_transfer',
    
    // Additional Information
    notes: '',
    tags: '',
    referralSource: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset form when modal is reopened or load client data if clientId is provided
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
      setSubmitSuccess(false);
      
      if (clientId) {
        // Load client data if an ID is provided
        const client = getClientById(clientId);
        if (client) {
          setFormData({
            clientType: client.clientType,
            companyName: client.companyName,
            contactPerson: client.contactPerson,
            email: client.email,
            phone: client.phone,
            website: client.website,
            websiteNotApplicable: client.websiteNotApplicable,
            taxNumber: client.taxNumber,
            registrationNumber: client.registrationNumber,
            vatNumber: client.vatNumber,
            vatNumberNotApplicable: client.vatNumberNotApplicable,
            billingStreet: client.billingStreet,
            billingCity: client.billingCity,
            billingState: client.billingState,
            billingPostal: client.billingPostal,
            billingCountry: client.billingCountry,
            sameAsBilling: client.sameAsBilling,
            shippingStreet: client.shippingStreet,
            shippingCity: client.shippingCity,
            shippingState: client.shippingState,
            shippingPostal: client.shippingPostal,
            shippingCountry: client.shippingCountry,
            paymentTerms: client.paymentTerms,
            currency: client.currency,
            creditLimit: client.creditLimit,
            discountRate: client.discountRate,
            preferredPaymentMethod: client.preferredPaymentMethod,
            notes: client.notes,
            tags: client.tags,
            referralSource: client.referralSource
          });
        }
      }
    }
  }, [isOpen, clientId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Conditional validation for website
    // Using manual pattern without escape issues
    const websitePattern = '^(https?://)?([a-z0-9.-]+)[.](a-z[.]?){2,6}(/[a-zA-Z0-9 .-]*)*/?$';
    const websiteRegex = new RegExp(websitePattern, 'i');
    if (!formData.websiteNotApplicable && formData.website && !websiteRegex.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    // Set errors
    setErrors(newErrors);
    
    // If there are any errors, form is not valid
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add client to localStorage
      const newClient = addClient(formData);
      console.log('Client added:', newClient);
      
      setSubmitSuccess(true);
      
      // Notify parent component if callback provided
      if (onClientAdded) {
        onClientAdded();
      }
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding client:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save client. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass backdrop-blur-sm bg-white/95 border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 font-sf-pro flex items-center">
            <User className="h-6 w-6 mr-2 text-mokm-purple-500" />
            {viewMode ? 'Client Details' : 'Add New Client'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" id="client-form">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Payment</span>
              </TabsTrigger>
              <TabsTrigger value="additional" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Additional</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    Client Type
                  </label>
                  <select
                    value={formData.clientType}
                    onChange={(e) => handleInputChange('clientType', e.target.value)}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="government">Government</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    placeholder="Enter contact person name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    placeholder="+27 11 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    Website
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={formData.websiteNotApplicable || viewMode}
                      className={`w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro ${formData.websiteNotApplicable || viewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="https://example.com"
                    />
                    {errors.website && (
                      <p className="text-red-500 text-xs">{errors.website}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="websiteNotApplicable"
                        checked={formData.websiteNotApplicable}
                        onCheckedChange={(checked) => {
                          if (!viewMode) {
                            handleInputChange('websiteNotApplicable', !!checked);
                            if (checked) handleInputChange('website', '');
                          }
                        }}
                        disabled={viewMode}
                      />
                      <label htmlFor="websiteNotApplicable" className="text-xs text-slate-600 font-sf-pro cursor-pointer">
                        Not Applicable
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    Tax Number
                  </label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    placeholder="Enter tax number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                    VAT Number
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.vatNumber}
                      onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                      disabled={formData.vatNumberNotApplicable || viewMode}
                      className={`w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro ${formData.vatNumberNotApplicable || viewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Enter VAT number"
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vatNumberNotApplicable"
                        checked={formData.vatNumberNotApplicable}
                        onCheckedChange={(checked) => {
                          if (!viewMode) {
                            handleInputChange('vatNumberNotApplicable', !!checked);
                            if (checked) handleInputChange('vatNumber', '');
                          }
                        }}
                        disabled={viewMode}
                      />
                      <label htmlFor="vatNumberNotApplicable" className="text-xs text-slate-600 font-sf-pro cursor-pointer">
                        Not Applicable
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Additional tab contents would go here */}
            <TabsContent value="address" className="space-y-4 mt-6">
              {/* Billing Address */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-sf-pro mb-4">Billing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.billingStreet}
                      onChange={(e) => handleInputChange('billingStreet', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      placeholder="Enter street address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.billingCity}
                      onChange={(e) => handleInputChange('billingCity', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.billingState}
                      onChange={(e) => handleInputChange('billingState', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      placeholder="Enter state/province"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Postal/ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.billingPostal}
                      onChange={(e) => handleInputChange('billingPostal', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      placeholder="Enter postal code"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Country *
                    </label>
                    <select
                      value={formData.billingCountry}
                      onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      required
                    >
                      <option value="South Africa">South Africa</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Eswatini">Eswatini</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="Mozambique">Mozambique</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="sameAsBilling"
                    checked={formData.sameAsBilling}
                    onCheckedChange={(checked) => handleInputChange('sameAsBilling', !!checked)}
                  />
                  <label htmlFor="sameAsBilling" className="text-sm font-medium text-slate-700 font-sf-pro cursor-pointer">
                    Shipping address is the same as billing address
                  </label>
                </div>
                
                {!formData.sameAsBilling && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 font-sf-pro mb-4">Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={formData.shippingStreet}
                          onChange={(e) => handleInputChange('shippingStreet', e.target.value)}
                          className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                          placeholder="Enter street address"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.shippingCity}
                          onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                          className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                          placeholder="Enter city"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={formData.shippingState}
                          onChange={(e) => handleInputChange('shippingState', e.target.value)}
                          className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                          placeholder="Enter state/province"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                          Postal/ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={formData.shippingPostal}
                          onChange={(e) => handleInputChange('shippingPostal', e.target.value)}
                          className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                          placeholder="Enter postal code"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                          Country *
                        </label>
                        <select
                          value={formData.shippingCountry}
                          onChange={(e) => handleInputChange('shippingCountry', e.target.value)}
                          className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                          required
                        >
                          <option value="South Africa">South Africa</option>
                          <option value="Botswana">Botswana</option>
                          <option value="Namibia">Namibia</option>
                          <option value="Lesotho">Lesotho</option>
                          <option value="Eswatini">Eswatini</option>
                          <option value="Zimbabwe">Zimbabwe</option>
                          <option value="Mozambique">Mozambique</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-sf-pro mb-4">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Payment Terms (Days)
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    >
                      <option value="0">Due on Receipt</option>
                      <option value="7">Net 7 Days</option>
                      <option value="14">Net 14 Days</option>
                      <option value="30">Net 30 Days</option>
                      <option value="45">Net 45 Days</option>
                      <option value="60">Net 60 Days</option>
                      <option value="90">Net 90 Days</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    >
                      <option value="ZAR">South African Rand (ZAR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="BWP">Botswana Pula (BWP)</option>
                      <option value="NAD">Namibian Dollar (NAD)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Credit Limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.creditLimit}
                      onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountRate}
                      onChange={(e) => handleInputChange('discountRate', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Preferred Payment Method
                    </label>
                    <select
                      value={formData.preferredPaymentMethod}
                      onChange={(e) => handleInputChange('preferredPaymentMethod', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="paypal">PayPal</option>
                      <option value="crypto">Cryptocurrency</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-sf-pro mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro min-h-[150px]"
                      placeholder="Add any additional notes about this client"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                      placeholder="e.g. vip, corporate, retail"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 font-sf-pro">
                      Referral Source
                    </label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => handleInputChange('referralSource', e.target.value)}
                      className="w-full px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                    >
                      <option value="">Select Source</option>
                      <option value="website">Website</option>
                      <option value="social_media">Social Media</option>
                      <option value="referral">Client Referral</option>
                      <option value="advertisement">Advertisement</option>
                      <option value="event">Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />Close
            </Button>
            {!viewMode && (
              <Button type="submit" form="client-form" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />{isSubmitting ? 'Saving...' : 'Save Client'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;
