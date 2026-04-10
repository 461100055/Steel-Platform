import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { PLATFORM_LOGO, PLATFORM_NAME } from '../../lib/constants';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get token from URL query parameters
  const token = searchParams.get('token');

  // Password validation
  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('Please meet all password requirements');
      return;
    }

    // Validate token exists
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to login with success message
      navigate('/login', { 
        state: { message: 'Password reset successful! Please login with your new password.' } 
      });
    }, 1500);
  };

  // Check if token is missing
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <img src={PLATFORM_LOGO} alt="Steel Platform" className="h-16" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Please request a new password reset link.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-[#0F2854] hover:bg-[#1C4D8D]"
              >
                Request New Reset Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={PLATFORM_LOGO} alt="Steel Platform" className="h-16" />
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 bg-white border-[#E5E7EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#6B7280] hover:text-[#374151]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {password && (
                <div className="space-y-2 p-3 bg-[#F3F4F6] rounded-lg">
                  <p className="text-xs font-medium text-[#374151]">Password Requirements:</p>
                  <ul className="space-y-1 text-xs">
                    <li className={passwordValidation.minLength ? 'text-green-600' : 'text-[#6B7280]'}>
                      <CheckCircle className={`inline h-3 w-3 mr-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-[#6B7280]'}`} />
                      At least 8 characters
                    </li>
                    <li className={passwordValidation.hasUpperCase ? 'text-green-600' : 'text-[#6B7280]'}>
                      <CheckCircle className={`inline h-3 w-3 mr-1 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-[#6B7280]'}`} />
                      One uppercase letter
                    </li>
                    <li className={passwordValidation.hasLowerCase ? 'text-green-600' : 'text-[#6B7280]'}>
                      <CheckCircle className={`inline h-3 w-3 mr-1 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-[#6B7280]'}`} />
                      One lowercase letter
                    </li>
                    <li className={passwordValidation.hasNumber ? 'text-green-600' : 'text-[#6B7280]'}>
                      <CheckCircle className={`inline h-3 w-3 mr-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-[#6B7280]'}`} />
                      One number
                    </li>
                    <li className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-[#6B7280]'}>
                      <CheckCircle className={`inline h-3 w-3 mr-1 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-[#6B7280]'}`} />
                      One special character
                    </li>
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10 bg-white border-[#E5E7EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-[#6B7280] hover:text-[#374151]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#0F2854] hover:bg-[#1C4D8D]"
                disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}