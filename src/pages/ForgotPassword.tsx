import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from '@/services/emailService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Generate a reset token (for local development only)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Store the token in localStorage (in production this would be in the database)
      const resetRequests = JSON.parse(localStorage.getItem('passwordResetRequests') || '{}');
      resetRequests[email] = {
        token: resetToken,
        expires: Date.now() + 3600000, // 1 hour expiry
      };
      localStorage.setItem('passwordResetRequests', JSON.stringify(resetRequests));
      
      // Send password reset email
      const result = await sendPasswordResetEmail({
        to: email,
        subject: 'Reset Your MOK Mzansi Books Password',
        resetToken,
      });
      
      if (result) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('There was a problem processing your request. Please try again.');
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
          <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors p-2 rounded-lg shadow-business hover:shadow-business-lg bg-white/80 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        <Card className="shadow-business-xl border-0 bg-white/90 backdrop-blur-md hover-lift animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 flex items-center justify-center shadow-business-lg animate-float rounded-2xl overflow-hidden bg-white">
              <img src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" alt="MOKMzansiBooks Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 drop-shadow-sm">Forgot Password</CardTitle>
              <p className="text-gray-600 mt-2">
                {!submitted ? 'Enter your email to receive a password reset link' : 'Check your email for reset instructions'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium drop-shadow-sm">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 shadow-business hover:shadow-business-lg transition-all duration-300"
                    required
                    placeholder="your@email.com"
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
                  {loading ? 'Sending...' : 'Reset Password'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-left">
                  <p className="text-green-700">We've sent a password reset link to <strong>{email}</strong></p>
                  <p className="text-green-700 text-sm mt-1">Please check your inbox and follow the instructions to reset your password.</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <Mail className="h-16 w-16 text-purple-500 animate-pulse" />
                </div>
                
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-purple-600 shadow-business transition-all duration-300"
                >
                  Try a different email
                </Button>
              </div>
            )}

            <div className="text-center">
              <span className="text-gray-600">Remember your password? </span>
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
