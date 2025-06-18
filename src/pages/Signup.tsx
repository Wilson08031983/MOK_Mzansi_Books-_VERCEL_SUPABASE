
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
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
    companyName: isInvitationSignup ? 'MOK Mzansi Books' : '',
    businessType: '',
    phone: ''
  });

  useEffect(() => {
    if (isInvitationSignup) {
      // Pre-fill email and password for invitation signup
      setFormData(prev => ({
        ...prev,
        email: invitationData.invited_email,
        password: invitationPassword,
        confirmPassword: invitationPassword,
        companyName: 'MOK Mzansi Books'
      }));
    }
  }, [invitationData, invitationPassword, isInvitationSignup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // Save all form data in user metadata for profile completion
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName,
        business_type: formData.businessType,
        phone: formData.phone,
        email: formData.email, // Store email in metadata as well for easy access
        invitation_token: invitationData?.invitation_token || null
      };
      
      // Pass complete user data to signUp
      await signUp(formData.email, formData.password, userData);
      
      // Log the data being saved to ensure it's working
      console.log('User profile data saved:', userData);
      
      if (isInvitationSignup) {
        alert('Account created successfully! Welcome to the team.');
        navigate('/dashboard');
      } else {
        alert('Please check your email for verification instructions');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Link to={isInvitationSignup ? "/accept-invitation" : "/"} className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isInvitationSignup ? 'Back to Invitation' : 'Back to Home'}
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center">
              {isInvitationSignup ? (
                <UserPlus className="text-white text-2xl" />
              ) : (
                <span className="text-white font-bold text-2xl">M</span>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isInvitationSignup ? 'Complete Your Profile' : 'Start Your Free Trial'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {isInvitationSignup 
                  ? 'Fill in your details to complete your account setup'
                  : 'Create your MOKMzansiBooks account - no credit card required'
                }
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  required
                  disabled={isInvitationSignup}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-700 font-medium">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  required
                  disabled={isInvitationSignup}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-gray-700 font-medium">Business Type</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="private-company">Private Company</SelectItem>
                      <SelectItem value="public-company">Public Company</SelectItem>
                      <SelectItem value="npo">Non-Profit Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>
              </div>

              {!isInvitationSignup && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
                        required
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
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              )}

              {!isInvitationSignup && (
                <div className="flex items-start space-x-2">
                  <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                  <span className="text-sm text-gray-600">
                    I agree to the <Link to="/terms" className="text-purple-600 hover:text-purple-700">Terms of Service</Link> and <Link to="/privacy" className="text-purple-600 hover:text-purple-700">Privacy Policy</Link>
                  </span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? 'Creating Account...' : (isInvitationSignup ? 'Complete Registration' : 'Start Free Trial')}
              </Button>
            </form>

            {!isInvitationSignup && (
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Sign in
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
