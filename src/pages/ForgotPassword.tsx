import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from '@/services/emailService';
import { useLocalization } from '@/hooks/useLocalization';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add immediate alert to test if form submission is working
    alert('Form submitted! Check console for details.');
    
    setError(null);
    setLoading(true);
    
    console.log('=== FORGOT PASSWORD FORM SUBMITTED ===');
    console.log('Email entered:', email);
    console.log('Form event:', e);
    console.log('Loading state:', loading);
    
    try {
      // Check if a user exists for this email in our local mock store
      const mockUsers: Array<{ email: string; firstName?: string }> = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      console.log('Mock users in localStorage:', mockUsers);
      
      const user = mockUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      console.log('Found user for email:', user);

      // Always show the same outcome to avoid user enumeration
      // Only generate/store token and send email if the user exists locally
      if (user) {
        console.log('User exists, proceeding with password reset');
        
        // Read existing reset requests
        const resetRequests = JSON.parse(localStorage.getItem('passwordResetRequests') || '{}');
        const existing = resetRequests[email];

        // Reuse existing unexpired token to rate limit repeated requests
        const now = Date.now();
        const tokenToUse = existing && existing.expires > now
          ? existing.token
          : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        console.log('Using reset token:', tokenToUse);

        // Store/refresh the reset request (1 hour expiry) with metadata
        resetRequests[email] = {
          token: tokenToUse,
          expires: now + 3600000,
          createdAt: existing?.createdAt || now,
          lastRequestedAt: now,
        };
        localStorage.setItem('passwordResetRequests', JSON.stringify(resetRequests));

        // Attempt to send password reset email (mock/real based on env)
        console.log('Calling sendPasswordResetEmail with:', {
          to: email,
          subject: t('auth.forgotPassword.resetTitle'),
          resetToken: tokenToUse,
          firstName: user.firstName,
        });
        
        const result = await sendPasswordResetEmail({
          to: email,
          subject: t('auth.forgotPassword.resetTitle'),
          resetToken: tokenToUse,
          firstName: user.firstName,
        });

        console.log('sendPasswordResetEmail result:', result);

        if (!result) {
          // Log but continue to avoid leaking information
          console.error('Failed to send password reset email');
        }
      } else {
        console.log('User not found in mock users, not sending email');
      }

      // Show success regardless of whether the user exists
      setSubmitted(true);
    } catch (error) {
      console.error(t('auth.forgotPassword.resetError'), error);
      setError(t('auth.forgotPassword.generalError'));
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

      <div className="relative w-full max-w-md">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg shadow-business hover:shadow-business-lg glass backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('auth.invitedSignup.backToLogin')}
          </Link>
        </div>

        <Card className="shadow-business-xl border-0 glass backdrop-blur-md hover-lift animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 flex items-center justify-center shadow-business-lg animate-float rounded-2xl overflow-hidden bg-card">
              <img src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" alt="MOKMzansiBooks Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground drop-shadow-sm">{t('auth.forgotPassword.title')}</CardTitle>
              <p className="text-muted-foreground mt-2">
                {!submitted ? t('auth.forgotPassword.description') : t('auth.forgotPassword.successMessage')}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium drop-shadow-sm">{t('auth.forgotPassword.emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background border-border focus:border-primary focus:ring-primary shadow-business hover:shadow-business-lg transition-all duration-300"
                    required
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold shadow-business-lg hover:shadow-business-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  {loading ? t('auth.forgotPassword.sendingButton') : t('auth.forgotPassword.resetButton')}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-left">
                  <p className="text-green-700">{t('auth.forgotPassword.emailSentTo')} <strong>{email}</strong></p>
                  <p className="text-green-700 text-sm mt-1">{t('auth.forgotPassword.checkInboxMessage')}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <Mail className="h-16 w-16 text-purple-500 animate-pulse" />
                </div>
                
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-background border border-border text-foreground hover:bg-muted hover:text-primary shadow-business transition-all duration-300"
                >
                  {t('common.reset')}
                </Button>
              </div>
            )}

            <div className="text-center">
              <span className="text-muted-foreground">{t('auth.forgotPassword.backToLogin')} </span>
              <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline">
                {t('auth.forgotPassword.signIn')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
