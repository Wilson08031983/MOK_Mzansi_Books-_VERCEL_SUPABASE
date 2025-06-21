
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthHook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import CompanyInformationForm from './CompanyInformationForm';
import ContactPersonForm from './ContactPersonForm';
import CompanyAddressForm from './CompanyAddressForm';
import CompanyNumbersForm from './CompanyNumbersForm';
import CompanyAssetsUpload from './CompanyAssetsUpload';

const CompanyDetails = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState({
    name: 'MOK Mzansi Books',
    contactName: '',
    contactSurname: '',
    position: '',
    email: 'info@mokmzansibooks.com',
    phone: '+27 11 123 4567',
    website: 'www.mokmzansibooks.com',
    addressLine1: '123 Business Street',
    addressLine2: '',
    addressLine3: '',
    addressLine4: 'Johannesburg, 2000',
    regNumber: '2024/123456/07',
    vatNumber: '4123456789',
    taxNumber: 'TAX123456789',
    maaarNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user data from localStorage (previously saved in useAuth)
        const storedUser = localStorage.getItem('mokUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userMeta = userData.user_metadata || {};
          
          setCompanyData(prev => ({
            ...prev,
            name: userMeta.company_name || prev.name,
            contactName: userMeta.first_name || prev.contactName,
            contactSurname: userMeta.last_name || prev.contactSurname,
            email: userMeta.email || user.email || prev.email,
            phone: userMeta.phone || prev.phone
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      if (user) {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('mokUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Update user metadata
          const updatedUserData = {
            ...userData,
            user_metadata: {
              ...userData.user_metadata,
              company_name: companyData.name,
              first_name: companyData.contactName,
              last_name: companyData.contactSurname,
              email: companyData.email,
              phone: companyData.phone
            }
          };
          
          // Store updated user data
          localStorage.setItem('mokUser', JSON.stringify(updatedUserData));
        }
      }
      
      console.log('Saving company data:', companyData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company data:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {loading && (
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="py-6">
            <p className="text-center text-slate-600">Loading company information...</p>
          </CardContent>
        </Card>
      )}
      {/* Company Information */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 font-sf-pro text-xl">Company Information</CardTitle>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-sf-pro rounded-xl transition-all duration-300"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <CompanyInformationForm 
            companyData={companyData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
          
          {/* Contact Person Details */}
          <ContactPersonForm
            companyData={companyData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />

          {/* Address Fields */}
          <CompanyAddressForm
            companyData={companyData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />

          <CompanyNumbersForm
            companyData={companyData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
        </CardContent>
      </Card>

      {/* Company Assets */}
      <CompanyAssetsUpload />
    </div>
  );
};

export default CompanyDetails;
