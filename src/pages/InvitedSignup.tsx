import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';
import { validateInvitationToken, completeInvitation } from '@/services/invitationService';
import { userLinkingService } from '@/services/userLinkingService';

const InvitedSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [invitedUserData, setInvitedUserData] = useState({
    email: '',
    role: '',
    token: '',
    permissions: {},
    companyId: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: ''
  });

  // Extract and verify token on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (!token) {
      toast({
        title: t('auth.invitedSignup.invalidInvitation'),
        description: t('auth.invitedSignup.invalidInvitationMessage')
      });
      navigate('/login');
      return;
    }

    // Verify token
    const invitation = validateInvitationToken(token);
    if (invitation) {
      setTokenVerified(true);
      setInvitedUserData({
        email: invitation.email,
        role: invitation.role,
        token: token,
        permissions: invitation.permissions,
        companyId: invitation.companyId
      });
    } else {
      toast({
        title: t('auth.invitedSignup.invalidInvitation'),
        description: t('auth.invitedSignup.invalidInvitationMessage')
      });
      navigate('/login');
    }
  }, [location.search, navigate, toast, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = completeInvitation(invitedUserData.token, {
        ...formData,
        companyId: invitedUserData.companyId
      });
      
      if (success) {
        // Handle invitation acceptance workflow
        try {
          const invitationAcceptanceData = {
            email: invitedUserData.email,
            fullName: `${formData.name} ${formData.surname}`,
            position: invitedUserData.role || 'Staff Member'
          };
          
          const linkingSuccess = await userLinkingService.handleInvitationAcceptance(invitationAcceptanceData);
          
          if (linkingSuccess) {
            console.log('User successfully linked across all tables during invitation completion');
          } else {
            console.warn('User linking encountered issues during invitation completion');
          }
        } catch (linkingError) {
          console.error('Error during invitation completion linking:', linkingError);
        }
        
        toast({
          title: t('auth.invitedSignup.profileCompleted'),
          description: 'Your account has been set up successfully. You can now log in with your credentials.'
        });
        navigate('/login');
      } else {
        throw new Error(t('auth.invitedSignup.failedToComplete'));
      }
    } catch (error) {
      toast({
        title: t('auth.invitedSignup.error'),
        description: error instanceof Error ? error.message : 'There was an error completing your profile.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenVerified) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mokm-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sf-pro">{t('auth.invitedSignup.verifyingMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background effects - matching Login page styling */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob shadow-4xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000 shadow-4xl"></div>
        <div className="absolute top-1/4 left-1/3 w-60 h-60 bg-gradient-to-br from-blue-200/20 to-cyan-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000 shadow-4xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 glass backdrop-blur-sm bg-white/70 border border-white/20 shadow-business p-8 rounded-2xl">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/mokm-logo.png" 
              alt="MOK Mzansi Books Logo"
              className="h-12 mb-4"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-sf-pro tracking-tight mb-2">{t('auth.invitedSignup.title')}</h1>
      <p className="text-muted-foreground font-sf-pro">{t('auth.invitedSignup.invitationTitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('auth.invitedSignup.nameLabel')}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t('auth.invitedSignup.namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                required
                className="border-slate-200 focus:border-mokm-purple-400 focus:ring-mokm-purple-400/20"
              />
            </div>
            <div>
              <Label htmlFor="surname">{t('auth.invitedSignup.surnameLabel')}</Label>
              <Input
                id="surname"
                name="surname"
                placeholder={t('auth.invitedSignup.surnamePlaceholder')}
                value={formData.surname}
                onChange={handleChange}
                required
                className="border-slate-200 focus:border-mokm-purple-400 focus:ring-mokm-purple-400/20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">{t('auth.invitedSignup.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              value={invitedUserData.email}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('auth.invitedSignup.emailDescription')}</p>
          </div>

          <div>
            <Label htmlFor="role">{t('auth.invitedSignup.positionLabel')}</Label>
            <Input
              id="role"
              value={invitedUserData.role}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('auth.invitedSignup.positionPlaceholder')}</p>
          </div>

          <div>
            <Label htmlFor="phoneNumber">{t('auth.invitedSignup.phoneLabel')}</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder={t('auth.invitedSignup.phonePlaceholder')}
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="border-slate-200 focus:border-mokm-purple-400 focus:ring-mokm-purple-400/20"
            />
          </div>

          <div>
            <Label htmlFor="addressLine1">{t('auth.invitedSignup.address1Label')}</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder={t('auth.invitedSignup.address1Placeholder')}
              value={formData.addressLine1}
              onChange={handleChange}
              required
              className="border-slate-200 focus:border-mokm-purple-400 focus:ring-mokm-purple-400/20"
            />
          </div>

          <div>
            <Label htmlFor="addressLine2">{t('auth.invitedSignup.address2Label')}</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              placeholder={t('auth.invitedSignup.address2Placeholder')}
              value={formData.addressLine2}
              onChange={handleChange}
              className="border-slate-200 focus:border-mokm-purple-400 focus:ring-mokm-purple-400/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="addressLine3">{t('auth.invitedSignup.cityLabel')}</Label>
              <Input
                id="addressLine3"
                name="addressLine3"
                placeholder={t('auth.invitedSignup.cityLabel')}
                value={formData.addressLine3}
                onChange={handleChange}
                className="border-slate-200 focus:border-mokm-purple-400 focus:ring-mokm-purple-400/20"
              />
            </div>
            <div>
              <Label htmlFor="addressLine4">{t('auth.invitedSignup.postalCodeLabel')}</Label>
              <Input
                id="addressLine4"
                name="addressLine4"
                placeholder={t('auth.invitedSignup.postalCodeLabel')}
                value={formData.addressLine4}
                onChange={handleChange}
                className="border-slate-200 focus:border-mokm-purple-400 focus:ring-mokm-purple-400/20"
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full transition-all duration-200 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white font-semibold rounded-xl py-2"
          >
            {loading ? t('auth.invitedSignup.processingButton') : t('auth.invitedSignup.completeButton')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-muted-foreground hover:text-primary font-sf-pro text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('auth.invitedSignup.backToLogin')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InvitedSignup;
