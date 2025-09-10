
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';
import { sendConfirmationEmail } from '@/services/emailService';
import { useLocalization } from '@/hooks/useLocalization';
import { userLinkingService } from '@/services/userLinkingService';
import { addNotification } from '@/services/notificationService';
import { autoSyncCompanyEmployee, companyEmployeeSyncService } from '@/services/companyEmployeeSyncService';
import { updatePrimaryUserInTeamMembers, createEmailVerificationToken } from '@/services/localAuthService';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const { t } = useLocalization();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if this is from an invitation
  const invitationData = location.state?.invitationData;
  const invitationPassword = location.state?.password;
  const isInvitationSignup = !!invitationData;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: invitationData?.invited_email || '',
    password: invitationPassword || '',
    confirmPassword: invitationPassword || '',
    // New fields for normal signup
    companyName: '',
    position: 'CEO'
  });
  
  // State for terms agreement checkbox
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsWarning, setShowTermsWarning] = useState(false);

  useEffect(() => {
    if (isInvitationSignup) {
      // Pre-fill email and password for invitation signup
      setFormData(prev => ({
        ...prev,
        email: invitationData.invited_email,
        password: invitationPassword,
        confirmPassword: invitationPassword,
        // For invited signups, position is from the invitation role if available
        position: invitationData.role || 'Staff'
      }));
    }
  }, [invitationData, invitationPassword, isInvitationSignup]);

  // Helper: check duplicate email in local storage registry
  const emailExists = (email: string): boolean => {
    try {
      const raw = localStorage.getItem('userCredentials');
      if (!raw) return false;
      const creds = JSON.parse(raw);
      return Object.values<any>(creds).some((c: any) => String(c.email).toLowerCase() === String(email).toLowerCase());
    } catch (_) {
      return false;
    }
  };

  // Helper: check duplicate company name
  const companyNameExists = (name: string): boolean => {
    try {
      // Check companyDetails store
      const detailsRaw = localStorage.getItem('companyDetails');
      if (detailsRaw) {
        const details = JSON.parse(detailsRaw);
        const existing = (details.companyName || details.name || '').toString();
        if (existing && existing.trim().toLowerCase() === name.trim().toLowerCase()) return true;
      }
      // Check typed company store
      const typedRaw = localStorage.getItem('mokMzansiBooks_company');
      if (typedRaw) {
        const company = JSON.parse(typedRaw);
        const existing = (company.name || '').toString();
        if (existing && existing.trim().toLowerCase() === name.trim().toLowerCase()) return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For normal signup, check if terms are agreed to
    if (!isInvitationSignup && !agreeToTerms) {
      setShowTermsWarning(true);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.resetPassword.passwordMismatch'));
      return;
    }

    // Additional validations for normal signup
    if (!isInvitationSignup) {
      if (!formData.companyName || !formData.companyName.trim()) {
        alert('Please enter your Company Name');
        return;
      }
      if (!formData.position || !formData.position.trim()) {
        alert('Please select your Position');
        return;
      }
      if (emailExists(formData.email)) {
        alert('An account with this email already exists. Please sign in or use a different email.');
        return;
      }
      if (companyNameExists(formData.companyName)) {
        alert('This company name is already registered on this device. Please sign in or use a different company name.');
        return;
      }
    }

    setLoading(true);
    
    try {
      // Save all form data in user metadata for profile completion
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email, // Store email in metadata as well for easy access
        invitation_token: invitationData?.invitation_token || null,
        // Link company fields for normal signup
        ...(isInvitationSignup ? {} : { company_name: formData.companyName, role: formData.position })
      } as Record<string, any>;
      
      // Pass complete user data to signUp
      // Set one-time email verification bypass for localhost to allow immediate login
      try {
        const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname || '');
        if (isLocalhost) {
          const key = String(formData.email || '').toLowerCase();
          const raw = localStorage.getItem('mokBypassEmailVerificationOnce');
          const map = raw ? JSON.parse(raw) : {};
          map[key] = true; // consumed on first login attempt
          localStorage.setItem('mokBypassEmailVerificationOnce', JSON.stringify(map));
        }
      } catch {}

      await signUp(formData.email, formData.password, userData);
      
      // Log the data being saved to ensure it's working
      console.log('User profile data saved:', userData);
      
      if (isInvitationSignup) {
        // Handle invitation acceptance workflow
        try {
          const invitationAcceptanceData = {
            email: formData.email,
            fullName: `${formData.firstName} ${formData.lastName}`,
            position: invitationData.role || 'Staff Member'
          };
          
          const linkingSuccess = await userLinkingService.handleInvitationAcceptance(invitationAcceptanceData);
          
          if (linkingSuccess) {
            console.log('User successfully linked across all tables during invitation acceptance');
          } else {
            console.warn('User linking encountered issues during invitation acceptance');
          }
        } catch (linkingError) {
          console.error('Error during invitation acceptance linking:', linkingError);
        }
        
        alert(t('auth.signup.accountCreatedSuccess'));
        navigate('/dashboard');
      } else {
        // Persist company details for the new account owner
        try {
          const detailsToSave = {
            companyName: formData.companyName,
            email: formData.email,
            phone: '',
            website: '',
            ownerName: formData.firstName,
            ownerSurname: formData.lastName,
            ownerPosition: formData.position,
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            addressLine4: ''
          };
          companyEmployeeSyncService.saveCompanyDetails(detailsToSave as any);
          // Broadcast update for listeners
          window.dispatchEvent(new Event('companyDetailsUpdated'));
          // Update primary user in team members with owner info
          updatePrimaryUserInTeamMembers({
            ownerName: formData.firstName,
            ownerSurname: formData.lastName,
            ownerPosition: formData.position,
            email: formData.email,
            phone: ''
          });
          // Auto-sync to HR employees
          autoSyncCompanyEmployee();
        } catch (persistErr) {
          console.warn('Could not persist company details during signup:', persistErr);
        }

        // Add a welcome notification for new trial users
        addNotification({
          title: t('auth.signup.welcomeNotificationTitle'),
          message: t('auth.signup.welcomeTrialNotificationMessage'),
          type: 'system'
        });

        // Send confirmation email using Resend
        const tokenResult = createEmailVerificationToken(formData.email);
        let verifyLink: string | undefined = undefined;
        if (tokenResult.success && tokenResult.token) {
          const baseUrl = window.location.origin;
          verifyLink = `${baseUrl}/verify-email?token=${tokenResult.token}&email=${encodeURIComponent(formData.email)}`;
          // Helpful for local testing when email sending may be disabled
          console.log('Email verification link:', verifyLink);
        }
        const emailSent = await sendConfirmationEmail({
          to: formData.email,
          subject: 'Confirm Your MOK Mzansi Books Account',
          firstName: formData.firstName,
          lastName: formData.lastName,
          verifyLink
        });
        
        if (emailSent) {
          alert(t('auth.signup.accountCreatedSuccess'));
        } else {
          alert(t('auth.signup.accountCreatedPartial'));
        }
        // Redirect to login so user can sign in with the new account
        navigate('/login');
      }
    } catch (error: any) {
      console.error(t('auth.signup.signupError'), error);
      alert(error.message || t('auth.signup.signupError'));
    } finally {
      setLoading(false);
    }
  };

  const positionOptions = ['CEO', 'Director', 'Founder', 'Manager', 'Bookkeeper', 'Staff'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob shadow-4xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000 shadow-4xl"></div>
      </div>
      
      <div className="relative w-full max-w-2xl">
        <div className="mb-8">
          <Link to={isInvitationSignup ? "/accept-invitation" : "/"} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg shadow-business hover:shadow-business-lg glass backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isInvitationSignup ? t('auth.invitedSignup.backToInvitation') : t('common.backToHome')}
          </Link>
        </div>

        <Card className="shadow-business-xl border-0 glass backdrop-blur-md hover-lift animate-fade-in">
          <CardHeader className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mx-auto w-24 h-24 flex items-center justify-center shadow-business-lg animate-float rounded-2xl overflow-hidden bg-card">
              <img
                src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png"
                alt="MOKMzansiBooks Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {isInvitationSignup ? t('auth.invitedSignup.title') : t('auth.signup.title')}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {isInvitationSignup 
                  ? t('auth.invitedSignup.invitationTitle')
                  : t('auth.signup.subtitle')
                }
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground font-medium">{t('auth.invitedSignup.nameLabel')}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-12 bg-background border-border focus:border-primary focus:ring-primary"
                    placeholder={t('auth.invitedSignup.namePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground font-medium">{t('auth.invitedSignup.surnameLabel')}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-12 bg-background border-border focus:border-primary focus:ring-primary"
                    placeholder={t('auth.invitedSignup.surnamePlaceholder')}
                    required
                  />
                </div>
              </div>

              {!isInvitationSignup && (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-foreground font-medium">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="h-12 bg-background border-border focus:border-primary focus:ring-primary"
                    placeholder="e.g. Morwa Moabelo (PTY) Ltd"
                    required={!isInvitationSignup}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">{t('auth.signup.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-background border-border focus:border-primary focus:ring-primary"
                  placeholder={t('auth.signup.emailPlaceholder')}
                  required
                  disabled={isInvitationSignup}
                />
              </div>

              {!isInvitationSignup && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-foreground font-medium">Position</Label>
                    <Select value={formData.position} onValueChange={(val) => setFormData({ ...formData, position: val })}>
                      <SelectTrigger className="h-12 bg-background border-border focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">{t('common.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 bg-background border-border focus:border-primary focus:ring-primary pr-12"
                        placeholder={t('auth.signup.passwordPlaceholder')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isInvitationSignup && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">{t('auth.signup.confirmPasswordLabel')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-12 bg-background border-border focus:border-primary focus:ring-primary"
                      placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                      required
                    />
                  </div>
                </div>
              )}

              {!isInvitationSignup && (
                <>
                  <div className="flex items-start space-x-2">
                    <input 
                      type="checkbox" 
                      id="terms-checkbox"
                      className="mt-1 rounded border-border" 
                      checked={agreeToTerms}
                      onChange={() => {
                        setAgreeToTerms(!agreeToTerms);
                        if (!agreeToTerms) {
                          setShowTermsWarning(false);
                        }
                      }}
                    />
                    <label htmlFor="terms-checkbox" className="text-sm text-muted-foreground">
                      I agree to the <Link to="/terms" className="text-primary hover:text-primary/80">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
                    </label>
                  </div>
                  
                  {showTermsWarning && (
                    <div className="text-red-500 text-sm flex items-center space-x-1 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>You must agree to the Terms of Service and Privacy Policy to continue</span>
                    </div>
                  )}
                </>
              )}

              <Button
                type="submit"
                disabled={loading || (!isInvitationSignup && !agreeToTerms)}
                className={`w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${(!isInvitationSignup && !agreeToTerms) ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={(e) => {
                  if (!isInvitationSignup && !agreeToTerms) {
                    e.preventDefault();
                    setShowTermsWarning(true);
                  }
                }}
              >
                {loading ? t('auth.signup.signingUpButton') : (isInvitationSignup ? t('auth.invitedSignup.completeButton') : t('auth.signup.signUpButton'))}
              </Button>
            </form>

            {!isInvitationSignup && (
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium">Log in</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
