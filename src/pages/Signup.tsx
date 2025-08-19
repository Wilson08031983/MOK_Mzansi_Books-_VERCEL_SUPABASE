
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
    confirmPassword: invitationPassword || ''
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
        confirmPassword: invitationPassword
      }));
    }
  }, [invitationData, invitationPassword, isInvitationSignup]);

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

    setLoading(true);
    
    try {
      // Save all form data in user metadata for profile completion
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email, // Store email in metadata as well for easy access
        invitation_token: invitationData?.invitation_token || null
      };
      
      // Pass complete user data to signUp
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
        // Send confirmation email using Resend
        const emailSent = await sendConfirmationEmail({
          to: formData.email,
          subject: 'Confirm Your MOK Mzansi Books Account',
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        
        if (emailSent) {
          alert(t('auth.signup.accountCreatedSuccess'));
        } else {
          alert(t('auth.signup.accountCreatedPartial'));
        }
        navigate('/login');
      }
    } catch (error: any) {
      console.error(t('auth.signup.signupError'), error);
      alert(error.message || t('auth.signup.signupError'));
    } finally {
      setLoading(false);
    }
  };

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
            {isInvitationSignup ? t('auth.invitedSignup.backToInvitation') : t('auth.login.backToHome')}
          </Link>
        </div>

        <Card className="shadow-business-xl border-0 glass backdrop-blur-md hover-lift animate-fade-in">
          <CardHeader className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mx-auto w-24 h-24 flex items-center justify-center shadow-business-lg animate-float rounded-2xl overflow-hidden bg-card">
              <LogoColor className="w-16 h-16" />
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
              <div className="text-center">
                <span className="text-muted-foreground">{t('auth.signup.alreadyHaveAccount')} </span>
                <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                  {t('auth.signup.signIn')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
