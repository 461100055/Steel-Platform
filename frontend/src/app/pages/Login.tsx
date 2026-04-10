import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, isBuyer, isSupplier, isAdmin, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pageError, setPageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectByRole = (role: string | null | undefined) => {
    if (
      role === 'buyer_individual' ||
      role === 'buyer_company' ||
      role === 'buyer_establishment'
    ) {
      navigate('/buyer/dashboard', { replace: true });
      return;
    }

    if (role === 'supplier') {
      navigate('/supplier/dashboard', { replace: true });
      return;
    }

    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    navigate('/', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setPageError('');

      if (!email.trim()) {
        throw new Error('Email is required.');
      }

      if (!password.trim()) {
        throw new Error('Password is required.');
      }

      const loggedInUser = await login(email.trim(), password);

      toast.success('Login successful');
      redirectByRole(loggedInUser?.role);
    } catch (error: any) {
      const message = error?.message || 'Login failed.';
      setPageError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    if (isBuyer) {
      navigate('/buyer/dashboard', { replace: true });
    } else if (isSupplier) {
      navigate('/supplier/dashboard', { replace: true });
    } else if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="border border-[#E5E7EB] shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0F2854] text-white">
              <LogIn className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0F2854]">
              Sign In
            </CardTitle>
            <CardDescription>
              Access your Steel Platform account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {pageError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {pageError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-[#E5E7EB]"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white border-[#E5E7EB] pr-10"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0F2854] hover:bg-[#1C4D8D]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm text-[#6B7280]">
                Don&apos;t have an account?
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link to="/register-buyer">Register as Buyer</Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link to="/register-supplier">Register as Supplier</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}