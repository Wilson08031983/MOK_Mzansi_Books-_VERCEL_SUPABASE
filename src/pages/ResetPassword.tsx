import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocalization();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordResetSuccessful, setPasswordResetSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Extract token from URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');

  useEffect(() => {
    // Validate the token
    if (token && email) {
      try {
        const resetRequests = JSON.parse(localStorage.getItem('passwordResetRequests') || '{}');
        const resetRequest = resetRequests[email];
        
        if (
          resetRequest && 
          resetRequest.token === token && 
          resetRequest.expires > Date.now()
        ) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(t('auth.resetPassword.invalidLink'));
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setTokenValid(false);
        setError(t('auth.resetPassword.validationError'));
      }
    } else {
      setTokenValid(false);
      setError(t('auth.resetPassword.invalidLink'));
    }
  }, [token, email, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('auth.resetPassword.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // In production, this would be an API call to your backend
      // For local development, we'll simulate it with localStorage
      
      // For mock auth, update the user password
      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const userIndex = mockUsers.findIndex((user: { email: string }) => user.email === email);
      
      if (userIndex >= 0) {
        // Update the password
        mockUsers[userIndex].password = formData.password;
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        
        // Clear the reset request
        const resetRequests = JSON.parse(localStorage.getItem('passwordResetRequests') || '{}');
        delete resetRequests[email!];
        localStorage.setItem('passwordResetRequests', JSON.stringify(resetRequests));
        
        setPasswordResetSuccessful(true);
      } else {
        setError(t('auth.resetPassword.userNotFound'));
      }
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      setError(error instanceof Error ? error.message : t('auth.resetPassword.resetError'));
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (tokenValid === null) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }
    
    if (tokenValid === false) {
      return (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-left">
            <p className="text-red-700">{error}</p>
          </div>
          <Button
            onClick={() => navigate('/forgot-password')}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold w-full h-12"
          >
            {t('auth.resetPassword.requestNewLink')}
          </Button>
        </div>
      );
    }
    
    if (passwordResetSuccessful) {
      return (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-left">
            <p className="text-green-700 font-medium">{t('auth.resetPassword.passwordResetSuccess')}</p>
            <p className="text-green-700 text-sm mt-1">{t('auth.resetPassword.passwordResetSuccessMessage')}</p>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold w-full h-12"
          >
            {t('auth.resetPassword.goToLogin')}
          </Button>
        </div>
      );
    }
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium drop-shadow-sm">{t('auth.resetPassword.passwordLabel')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12 shadow-business hover:shadow-business-lg transition-all duration-300"
              placeholder={t('auth.resetPassword.passwordPlaceholder')}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:shadow-business"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium drop-shadow-sm">{t('auth.resetPassword.confirmPasswordLabel')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 shadow-business hover:shadow-business-lg transition-all duration-300"
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
            required
            minLength={8}
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
          {loading ? t('auth.resetPassword.resettingButton') : t('auth.resetPassword.resetButton')}
        </Button>
      </form>
    );
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
          <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors p-2 rounded-lg shadow-business hover:shadow-business-lg bg-white/80 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('auth.invitedSignup.backToLogin')}
          </Link>
        </div>

        <Card className="shadow-business-xl border-0 bg-white/90 backdrop-blur-md hover-lift animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 flex items-center justify-center shadow-business-lg animate-float rounded-2xl overflow-hidden bg-white">
              <img src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" alt="MOKMzansiBooks Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 drop-shadow-sm">{t('auth.resetPassword.title')}</CardTitle>
              <p className="text-gray-600 mt-2">{t('auth.resetPassword.subtitle')}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
