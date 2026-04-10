import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { PLATFORM_LOGO } from '../../lib/constants';
import { checkEmailExists, normalizeEmail, registerUser } from '../../lib/api';

type SupplierForm = {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  city: string;
  description: string;
  image: string;
};

const initialForm: SupplierForm = {
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  company: '',
  phone: '',
  city: '',
  description: '',
  image: '',
};

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, '');
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseEmailExistsResult(result: any): boolean {
  if (typeof result === 'boolean') return result;

  if (result?.exists === true) return true;
  if (result?.is_registered === true) return true;
  if (result?.available === false) return true;

  return false;
}

function extractErrorMessage(error: any, fallback: string) {
  if (!error) return fallback;

  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  if (error?.error) return error.error;

  return fallback;
}

export default function RegisterSupplier() {
  const navigate = useNavigate();

  const [form, setForm] = useState<SupplierForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const nextValue =
      name === 'phone' ? sanitizeDigits(value) : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === 'email') {
      setEmailVerified(false);
    }

    if (error) {
      setError('');
    }
  };

  const validateEmailAvailability = async () => {
    const normalized = normalizeEmail(form.email);

    if (!normalized) {
      setError('Email address is required.');
      setEmailVerified(false);
      return false;
    }

    if (!isValidEmail(normalized)) {
      setError('Please enter a valid email address.');
      setEmailVerified(false);
      return false;
    }

    setCheckingEmail(true);
    setError('');

    try {
      const result = await checkEmailExists(normalized);
      const emailExists = parseEmailExistsResult(result);

      if (emailExists) {
        setError('This email is already registered.');
        setEmailVerified(false);
        return false;
      }

      setEmailVerified(true);
      return true;
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to check email availability.'));
      setEmailVerified(false);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = normalizeEmail(form.email);

    if (!form.username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!normalizedEmail) {
      setError('Email address is required.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setCheckingEmail(true);
    let emailExists = false;

    try {
      const result = await checkEmailExists(normalizedEmail);
      emailExists = parseEmailExistsResult(result);
    } catch {
      emailExists = false;
    } finally {
      setCheckingEmail(false);
    }

    if (emailExists) {
      setError('This email is already registered.');
      setEmailVerified(false);
      return;
    }

    if (!form.first_name.trim()) {
      setError('First name is required.');
      return;
    }

    if (!form.last_name.trim()) {
      setError('Last name is required.');
      return;
    }

    if (!form.company.trim()) {
      setError('Company name is required.');
      return;
    }

    if (!form.phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (form.phone.trim().length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!form.city.trim()) {
      setError('City is required.');
      return;
    }

    if (!form.password) {
      setError('Password is required.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      setError('Password must include letters and numbers.');
      return;
    }

    if (!form.confirm_password) {
      setError('Please confirm your password.');
      return;
    }

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        role: 'supplier',

        username: form.username.trim(),
        email: normalizedEmail,
        password: form.password,
        password_confirm: form.confirm_password,

        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),

        supplier_description: form.description.trim(),
        description: form.description.trim(),

        supplier_categories: ['Steel'],
        supplier_image: form.image.trim(),
        image: form.image.trim(),
      });

      navigate('/login', {
        state: {
          message: 'Supplier registration successful. You can now sign in to your account.',
          email: normalizedEmail,
        },
      });
    } catch (err: any) {
      const message = extractErrorMessage(
        err,
        'Registration failed. Please try again.'
      );
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Business Info', icon: Building2 },
    { number: 2, title: 'Contact', icon: User },
    { number: 3, title: 'Profile', icon: FileText },
    { number: 4, title: 'Security', icon: Shield },
  ];

  const currentStep = 1;

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center justify-center">
            <img
              src={PLATFORM_LOGO}
              alt="Steel Platform"
              className="h-16 w-auto object-contain"
            />
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-[#1C4D8D] transition-colors hover:text-[#0F2854]"
          >
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentStep === item.number;
              const isCompleted = currentStep > item.number;

              return (
                <div key={item.number} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'border-[#0F2854] bg-[#0F2854] text-white'
                          : isActive
                          ? 'border-[#0F2854] bg-white text-[#0F2854]'
                          : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>

                    <span
                      className={`mt-2 text-center text-sm font-medium ${
                        isActive ? 'text-[#0F2854]' : 'text-[#6B7280]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 mb-8 h-0.5 flex-1 ${
                        isCompleted ? 'bg-[#0F2854]' : 'bg-[#E5E7EB]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#0F2854]">Register as Supplier</CardTitle>
            <CardDescription>
              Create a supplier account to list products, receive orders, and connect with buyers.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
                <Mail className="h-4 w-4 text-[#4988C4]" />
                <AlertDescription className="text-sm text-[#111827]">
                  Use a company email if possible. Each email can only be used for one account.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="border-[#E5E7EB] bg-white"
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={validateEmailAvailability}
                      className="border-[#E5E7EB] bg-white pl-10"
                      placeholder="supplier@company.com"
                    />
                  </div>

                  {checkingEmail && (
                    <p className="text-xs text-[#4988C4]">Checking email availability...</p>
                  )}

                  {!error && emailVerified && !checkingEmail && (
                    <p className="text-xs text-green-600">This email is available.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      id="first_name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="border-[#E5E7EB] bg-white pl-10"
                      placeholder="First name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="border-[#E5E7EB] bg-white"
                    placeholder="Last name"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      id="company"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      className="border-[#E5E7EB] bg-white pl-10"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="border-[#E5E7EB] bg-white pl-10"
                      placeholder="Numbers only"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="border-[#E5E7EB] bg-white pl-10"
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Company Description</Label>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                    <Input
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="border-[#E5E7EB] bg-white pl-10"
                      placeholder="Short description about your company"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <Input
                      id="image"
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      className="border-[#E5E7EB] bg-white pl-10"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="border-[#E5E7EB] bg-white"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    className="border-[#E5E7EB] bg-white"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={checkingEmail || loading}
                className="w-full bg-[#0F2854] hover:bg-[#1C4D8D]"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#6B7280]">Already have an account? </span>
              <Link to="/login" className="text-[#4988C4] hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}