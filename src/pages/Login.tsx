
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';
import { resetLocalAuth } from '@/services/resetLocalAuth';
import { useLocalization } from '@/hooks/useLocalization';
import { toast } from '@/hooks/use-toast';
// 2FA logic removed

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useLocalization();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(formData.email, formData.password);
      // 2FA removed: proceed directly
      navigate('/welcome-back');
    } catch (error: unknown) {
      console.error(t('auth.login.loginError'), error);
      const errorMessage = error instanceof Error ? error.message : t('auth.login.loginError');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob shadow-4xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000 shadow-4xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-mokm-purple-600 transition-colors p-2 rounded-lg shadow-business hover:shadow-business-lg glass glass-soft">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToHome')}
          </Link>
        </div>

        <Card className="shadow-business-xl border-0 glass glass-soft hover-lift animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 flex items-center justify-center shadow-business-lg animate-float rounded-2xl overflow-hidden glass glass-soft">
              <img src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" alt="MOKMzansiBooks Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground drop-shadow-sm">{t('auth.login.title')}</CardTitle>
              <p className="text-muted-foreground mt-2">{t('auth.login.subtitle')}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium drop-shadow-sm">{t('auth.login.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-background border-border focus:border-primary focus:ring-primary shadow-business hover:shadow-business-lg transition-all duration-300"
                  placeholder={t('auth.login.emailPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium drop-shadow-sm">{t('auth.login.passwordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 bg-background border-border focus:border-primary focus:ring-primary pr-12 shadow-business hover:shadow-business-lg transition-all duration-300"
                    placeholder={t('auth.login.passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:shadow-business"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded border-border shadow-sm" />
                  <span className="text-sm text-muted-foreground">{t('auth.login.rememberMe')}</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 transition-colors hover:underline">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold shadow-business-lg hover:shadow-business-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                {loading ? t('auth.login.signingInButton') : t('auth.login.signInButton')}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('auth.login.dontHaveAccount')}{' '}
                <Link to="/signup" className="text-mokm-purple-600 hover:text-mokm-purple-800 font-medium">
                  {t('auth.login.signUp')}
                </Link>
              </p>
              <div className="flex justify-between mt-2">
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary inline-block">
                   {t('auth.login.forgotPassword')}
                 </Link>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm text-mokm-orange-600 hover:text-mokm-orange-800 flex items-center gap-1 p-0"
                  onClick={() => {
                    resetLocalAuth();
                    alert(t('auth.login.refreshLocalAuth'));
                  }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('auth.login.refreshLocalAuth')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
