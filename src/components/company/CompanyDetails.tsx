
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthHook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { verifyAdminPermission, initializeLocalAuth, resetAuthState } from '@/services/localAuthService';
import AuthModal from './AuthModal';
import CompanyInformationForm from './CompanyInformationForm';
import ContactPersonForm from './ContactPersonForm';
import CompanyAddressForm from './CompanyAddressForm';
import CompanyNumbersForm from './CompanyNumbersForm';
import CompanyAssetsUpload from './CompanyAssetsUpload';

const CompanyDetails = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Initialize local auth system on component mount
  useEffect(() => {
    // Reset the auth state first, then initialize with new credentials
    resetAuthState();
    initializeLocalAuth();
    
    // Notify about the test users available
    toast.info("Admin: admin@mokmzansibooks.com / admin123\nRegular: user@mokmzansibooks.com / user123", {
      description: "Test Users Available",
      duration: 5000
    });
  }, []);
  const [companyData, setCompanyData] = useState({
    name: 'MOK Mzansi Books',
    contactName: '',
    contactSurname: '',
    position: '',
    email: 'info@mokmzansibooks.com',
    phone: '+27 11 123 4567',
    website: 'www.mokmzansibooks.com',
    websiteNotApplicable: false,
    addressLine1: '123 Business Street',
    addressLine2: '',
    addressLine3: '',
    addressLine4: 'Johannesburg, 2000',
    regNumber: '2024/123456/07',
    vatNumber: '4123456789',
    vatNumberNotApplicable: false,
    taxNumber: 'TAX123456789',
    csdNumber: '', // renamed from maaarNumber
    csdNumberNotApplicable: false
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === 'websiteNotApplicable' || field === 'vatNumberNotApplicable' || field === 'csdNumberNotApplicable') {
      setCompanyData(prev => ({ ...prev, [field]: value === 'true' }));
    } else {
      setCompanyData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // First try to load complete company details if available
        const savedCompanyDetails = localStorage.getItem('companyDetails');
        if (savedCompanyDetails) {
          const parsedDetails = JSON.parse(savedCompanyDetails);
          setCompanyData(parsedDetails);
          setLoading(false);
          return;
        }
        
        // Fallback to user metadata from mokUser
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

  // Function to handle authentication with the modal
  const handleAuthenticate = async (email: string, password: string): Promise<boolean> => {
    try {
      const hasPermission = await verifyAdminPermission(email, password);
      
      if (hasPermission) {
        setIsEditing(true);
        setIsAuthModalOpen(false);
        toast.success('Authentication successful. You can now edit company details.');
        return true;
      } else {
        toast.error('Authentication failed. You do not have admin privileges.');
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An error occurred during authentication.');
      return false;
    }
  };
  
  // Start edit mode only after authentication
  const handleStartEdit = () => {
    setIsAuthModalOpen(true);
  };
  
  const handleSave = async () => {
    try {
      if (user) {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('mokUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Update user metadata with basic info
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
      
      // Save complete company data separately for persistence
      localStorage.setItem('companyDetails', JSON.stringify({
        ...companyData,
        lastUpdated: new Date().toISOString()
      }));
      
      toast.success('Company details saved successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company data:', error);
      toast.error('Error saving company details.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    toast.info('Edit cancelled. No changes were saved.');
  };
  
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        onAuthenticate={handleAuthenticate} 
      />
      
      {/* Company Information */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 font-sf-pro text-xl">Company Information</CardTitle>
          {!isEditing ? (
            <Button
              onClick={handleStartEdit}
              className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
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
