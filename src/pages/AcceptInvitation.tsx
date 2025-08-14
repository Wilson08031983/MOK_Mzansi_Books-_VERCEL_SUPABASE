
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';

// Define the invitation data type
interface InvitationData {
  id: string;
  company_id: string;
  invited_email: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_by: string;
  created_at: string;
  expires_at: string;
}

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const verifyInvitation = useCallback(async () => {
    try {
      // Get invitations from localStorage
      const invitations = JSON.parse(localStorage.getItem('mokInvitations') || '[]');
      
      // Find the invitation with the matching token
      const invitation = invitations.find((inv: InvitationData) => 
        inv.invitation_token === token && 
        inv.status === 'pending' && 
        new Date(inv.expires_at) > new Date()
      );
      
      if (!invitation) {
        toast({
          title: t('auth.acceptInvitation.invalidInvitation'),
          description: t('auth.acceptInvitation.invalidInvitation'),
          variant: 'destructive'
        });
        navigate('/');
        return;
      }
      
      setInvitationData(invitation);
      setInvitationValid(true);
    } catch (error) {
      console.error('Error verifying invitation:', error);
      navigate('/');
    } finally {
      setVerifying(false);
    }
  }, [token, navigate, toast, t]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    
    verifyInvitation();
  }, [token, navigate, verifyInvitation]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('auth.acceptInvitation.passwordMismatch'),
        description: t('auth.acceptInvitation.passwordMismatchMessage'),
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: t('auth.acceptInvitation.passwordTooShort'),
        description: t('auth.acceptInvitation.passwordTooShortMessage'),
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Get invitations from localStorage
      const invitations = JSON.parse(localStorage.getItem('mokInvitations') || '[]');
      
      // Update the invitation status
      const updatedInvitations = invitations.map((inv: InvitationData) => {
        if (inv.invitation_token === token) {
          return { ...inv, status: 'accepted' };
        }
        return inv;
      });
      
      // Save back to localStorage
      localStorage.setItem('mokInvitations', JSON.stringify(updatedInvitations));
      
      // Navigate to signup with invitation data
      navigate('/signup', { 
        state: { 
          invitationData,
          password: formData.password 
        } 
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('auth.acceptInvitation.errorAccepting'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>{t('auth.acceptInvitation.verifyingInvitation')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationValid) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToHome')}
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">{t('auth.acceptInvitation.title')}</CardTitle>
              <p className="text-gray-600 mt-2">
                {t('auth.invitedSignup.invitationTitle')}
              </p>
              <p className="text-sm text-gray-500">
                {/* No explicit key for Invited by label; using static label with dynamic email */}
                {t('common.email')}: {invitationData?.invited_email}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">{t('common.success')}</p>
              <p className="text-green-700 text-sm">{t('auth.acceptInvitation.subtitle')}</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.acceptInvitation.passwordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
                    placeholder={t('auth.acceptInvitation.passwordPlaceholder')}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.acceptInvitation.confirmPasswordLabel')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  placeholder={t('auth.acceptInvitation.confirmPasswordPlaceholder')}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? t('auth.acceptInvitation.acceptingButton') : t('auth.acceptInvitation.acceptButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvitation;
