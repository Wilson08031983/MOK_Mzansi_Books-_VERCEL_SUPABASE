
import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { useAuth } from '@/hooks/useAuthHook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, ShieldAlert, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { verifyAdminPermission, updatePrimaryUserInTeamMembers } from '@/services/localAuthService';
import { companyEmployeeSyncService } from '@/services/companyEmployeeSyncService';
import { workingCompanySync } from '@/services/workingCompanySync';
import useAuditLogger from '@/hooks/useAuditLogger';

import AuthModal from './AuthModal';
import CompanyInformationForm from './CompanyInformationForm';
import ContactPersonForm from './ContactPersonForm';
import CompanyAddressForm from './CompanyAddressForm';
import CompanyNumbersForm from './CompanyNumbersForm';
import BankDetailsForm from './BankDetailsForm';
import CompanyAssetsUpload from './CompanyAssetsUpload';

const CompanyDetails = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const { logSettings, logAuth, logSystem, logUpdate, logNavigation } = useAuditLogger();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Initialize local auth system on component mount
  useEffect(() => {
    // Log viewing the Company Details tab
    try { logNavigation('Company Details'); } catch {}

    // Reset the auth state first, then initialize with new credentials
    
    // Initialize company details for sync
    companyEmployeeSyncService.initializeCompanyDetails();
    
    // Load the initialized company details immediately
    const initializedDetails = companyEmployeeSyncService.getCompanyDetails();
    console.log('DEBUG: Loading company details on mount:', initializedDetails);
    if (initializedDetails) {
      console.log('DEBUG: Setting company data from loaded details');
      setCompanyData(prev => ({
        ...prev,
        name: initializedDetails.companyName || prev.name,
        contactName: initializedDetails.ownerName || prev.contactName,
        contactSurname: initializedDetails.ownerSurname || prev.contactSurname,
        position: initializedDetails.ownerPosition || prev.position,
        email: initializedDetails.email || prev.email,
        phone: initializedDetails.phone || prev.phone,
        addressLine1: initializedDetails.addressLine1 || prev.addressLine1,
        addressLine2: initializedDetails.addressLine2 || prev.addressLine2,
        addressLine3: initializedDetails.addressLine3 || prev.addressLine3,
        addressLine4: initializedDetails.addressLine4 || prev.addressLine4
      }));
    }
    
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
    csdNumberNotApplicable: false,
    // Bank Details Fields
    bankName: '',
    accountHolder: '',
    bankAccount: '',
    accountType: '',
    branchCode: ''
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
        
        // Prepare stored data
        let parsedDetails: any = null;
        let parsedBankDetails: any = null;
        let userMeta: any = null;
        
        // Load complete company details if available
        try {
          const savedCompanyDetails = localStorage.getItem('companyDetails');
          if (savedCompanyDetails) {
            parsedDetails = JSON.parse(savedCompanyDetails);
          }
        } catch (parseError) {
          console.error('Error parsing company details:', parseError);
        }
        
        // Load bank details if available
        try {
          const savedBankDetails = localStorage.getItem('companyBankDetails');
          if (savedBankDetails) {
            parsedBankDetails = JSON.parse(savedBankDetails);
          }
        } catch (bankError) {
          console.error('Error loading bank details:', bankError);
        }
        
        // Load mokUser metadata for cautious fallback only if needed
        try {
          const storedUser = localStorage.getItem('mokUser');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userMeta = userData.user_metadata || {};
          }
        } catch (userError) {
          console.error('Error parsing user data:', userError);
        }
        
        // Merge everything in ONE state update to avoid race conditions
        setCompanyData(prev => {
          let next = { ...prev };
          
          if (parsedDetails) {
            next = { ...next, ...parsedDetails };
          }
          
          if (parsedBankDetails) {
            next = { ...next, ...parsedBankDetails };
          }
          
          // Only apply mokUser fallback if owner details are still missing after loading saved data
          const missingOwner = (!next.contactName || next.contactName.trim() === '') && (!next.contactSurname || next.contactSurname.trim() === '');
          if (missingOwner && userMeta) {
            next = {
              ...next,
              name: next.name || userMeta.company_name || next.name,
              contactName: next.contactName || userMeta.first_name || next.contactName,
              contactSurname: next.contactSurname || userMeta.last_name || next.contactSurname,
              email: next.email || userMeta.email || user.email || next.email,
              phone: next.phone || userMeta.phone || next.phone
            };
          }
          
          return next;
        });
        
        // Trigger sync after data is loaded
        setTimeout(() => {
          companyEmployeeSyncService.autoSyncCompanyEmployee();
        }, 500);
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
        // Audit: admin authenticated to edit company details
        try {
          logAuth('Admin Edit Authorized', 'Company details edit authorized');
        } catch (_) {}
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
    // Audit: user initiated edit flow
    try {
      logSystem('Start Edit', 'Entered company details edit mode');
    } catch (_) {}
  };
  
  const handleSave = async () => {
    try {
      if (user) {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('mokUser');
        if (storedUser) {
          try {
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
          } catch (userError) {
            console.error('Error updating user data:', userError);
          }
        }
      }
      
      // Extract bank details
      const bankDetails = {
        bankName: companyData.bankName || '',
        accountHolder: companyData.accountHolder || '',
        bankAccount: companyData.bankAccount || '',
        accountType: companyData.accountType || '',
        branchCode: companyData.branchCode || ''
      };
      
      // Prepare old values for audit before saving
      let prevDetails: any = null;
      let prevBankDetails: any = null;
      try {
        const savedCompanyDetails = localStorage.getItem('companyDetails');
        if (savedCompanyDetails) prevDetails = JSON.parse(savedCompanyDetails);
      } catch (_) {}
      try {
        const savedBankDetails = localStorage.getItem('companyBankDetails');
        if (savedBankDetails) prevBankDetails = JSON.parse(savedBankDetails);
      } catch (_) {}

      // Save bank details separately
      localStorage.setItem('companyBankDetails', JSON.stringify(bankDetails));
      
      // Save complete company data (including bank details) for persistence
      const companyDetailsToSave = {
        companyName: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        website: companyData.website,
        ownerName: companyData.contactName,
        ownerSurname: companyData.contactSurname,
        ownerPosition: companyData.position,
        addressLine1: companyData.addressLine1,
        addressLine2: companyData.addressLine2,
        addressLine3: companyData.addressLine3,
        addressLine4: companyData.addressLine4,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('companyDetails', JSON.stringify(companyDetailsToSave));
      // Notify other parts of the app in the same tab
      window.dispatchEvent(new Event('companyDetailsUpdated'));

      // Audit: log settings update with diffs
      try {
        const oldValues = { ...(prevDetails || {}), ...(prevBankDetails || {}) };
        const newValues = { ...companyDetailsToSave, ...bankDetails };
        logSettings('Company Details Updated', 'Company', oldValues, newValues);
        logUpdate('Company', companyData.name || 'Company', 'company', oldValues, newValues);
      } catch (_) {}
      
      
      
      // Automatically sync company details to HR Management employee record
      try {
        const syncResult = companyEmployeeSyncService.syncCompanyDetailsToEmployee();
        if (syncResult.success) {
          toast.success('Company details saved and automatically synced to HR Management.');
        } else {
          toast.success('Company details saved successfully.');
          toast.info(`Auto-sync note: ${syncResult.message}`);
        }
      } catch (syncError) {
        console.error('Auto-sync error:', syncError);
        toast.success('Company details saved successfully.');
        toast.warning('Note: Could not auto-sync to HR Management. Please check employee records.');
      }

      // Sync to Settings page General tab
      try {
        workingCompanySync.syncCompanyToSettings();
        console.log('Company data synced to Settings page');
      } catch (settingsyncError) {
        console.error('Settings sync error:', settingsyncError);
      }
      
      // Update the primary admin user (admin@mokmzansibooks.com) to reflect company owner details
      try {
        const updateResult = updatePrimaryUserInTeamMembers({
          ownerName: companyData.contactName,
          ownerSurname: companyData.contactSurname,
          ownerPosition: companyData.position,
          email: companyData.email,
          phone: companyData.phone
        });
        if (updateResult.success) {
          console.log('Primary admin user updated with company owner details');
          // Let Settings > Users and Team Management know to refresh their views
          window.dispatchEvent(new CustomEvent('teamMembersUpdated', { detail: { reason: 'companyDetailsSaved' } }));
        } else if (updateResult.error) {
          console.warn('Could not update primary admin user:', updateResult.error);
        }
      } catch (updateErr) {
        console.error('Error updating primary admin user:', updateErr);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company data:', error);
      toast.error('Error saving company details.');
    }
  };
  


  const handleCancel = () => {
    setIsEditing(false);
    toast.info('Edit cancelled. No changes were saved.');
    // Audit: user cancelled edit
    try {
      logSystem('Cancel Edit', 'Cancelled editing company details');
    } catch (_) {}
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
      <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground font-sf-pro text-xl">{t('company.information')}</CardTitle>
          {!isEditing ? (
            <div className="flex space-x-2">
              {/* Sync to HR button hidden as auto-sync is triggered on Save */}
              <Button
                onClick={handleStartEdit}
                className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                {t('company.edit')}
              </Button>

            </div>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-sf-pro rounded-xl transition-all duration-300"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('company.save')}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                {t('company.cancel')}
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
          
          {/* Bank Details */}
          <BankDetailsForm
            bankData={{
              bankName: companyData.bankName || '',
              accountHolder: companyData.accountHolder || '',
              bankAccount: companyData.bankAccount || '',
              accountType: companyData.accountType || '',
              branchCode: companyData.branchCode || ''
            }}
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
