import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Shield,
  CheckCircle,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { PLATFORM_LOGO } from '../../lib/constants';
import { checkEmailExists, normalizeEmail, registerUser } from '../../lib/api';

const saudiCities = [
  'Riyadh',
  'Jeddah',
  'Mecca',
  'Medina',
  'Dammam',
  'Khobar',
  'Dhahran',
  'Taif',
  'Tabuk',
  'Buraidah',
  'Khamis Mushait',
  'Hofuf',
  'Jubail',
  'Yanbu',
];

const idTypes = [
  'National ID',
  'Iqama (Resident ID)',
  'GCC National ID',
];

type RegisterIndividualForm = {
  email: string;
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  dateOfBirth: string;
  phone: string;

  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  additionalDirections: string;

  password: string;
  confirmPassword: string;

  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
};

const initialFormData: RegisterIndividualForm = {
  email: '',
  firstName: '',
  lastName: '',
  idType: '',
  idNumber: '',
  dateOfBirth: '',
  phone: '',

  city: '',
  district: '',
  street: '',
  buildingNumber: '',
  postalCode: '',
  additionalDirections: '',

  password: '',
  confirmPassword: '',

  agreeToTerms: false,
  subscribeNewsletter: false,
};

const numericFields = new Set([
  'idNumber',
  'phone',
  'buildingNumber',
  'postalCode',
]);

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

export default function RegisterIndividual() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterIndividualForm>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summaryName = useMemo(
    () => `${formData.firstName} ${formData.lastName}`.trim(),
    [formData.firstName, formData.lastName]
  );

  const setFieldValue = (name: keyof RegisterIndividualForm, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (name === 'email') {
      setEmailVerified(false);
      setSubmitError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (numericFields.has(name)) {
      setFieldValue(name as keyof RegisterIndividualForm, sanitizeDigits(value));
      return;
    }

    setFieldValue(name as keyof RegisterIndividualForm, value);
  };

  const validateEmailAvailability = async () => {
    const normalizedEmail = normalizeEmail(formData.email);

    if (!normalizedEmail) {
      setErrors((prev) => ({
        ...prev,
        email: 'Email address is required.',
      }));
      setEmailVerified(false);
      return false;
    }

    if (!isValidEmail(normalizedEmail)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address.',
      }));
      setEmailVerified(false);
      return false;
    }

    setEmailChecking(true);
    setSubmitError('');

    try {
      const result = await checkEmailExists(normalizedEmail);
      const emailExists = parseEmailExistsResult(result);

      if (emailExists) {
        setErrors((prev) => ({
          ...prev,
          email: 'This email is already registered.',
        }));
        setEmailVerified(false);
        return false;
      }

      setErrors((prev) => ({
        ...prev,
        email: '',
      }));
      setEmailVerified(true);
      return true;
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        email: extractErrorMessage(error, 'Failed to check email availability.'),
      }));
      setEmailVerified(false);
      return false;
    } finally {
      setEmailChecking(false);
    }
  };

  const validateStep = async (currentStep: number): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      const normalizedEmail = normalizeEmail(formData.email);

      if (!normalizedEmail) {
        newErrors.email = 'Email address is required.';
      } else if (!isValidEmail(normalizedEmail)) {
        newErrors.email = 'Please enter a valid email address.';
      }

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required.';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required.';
      }

      if (!formData.idType) {
        newErrors.idType = 'ID type is required.';
      }

      if (!formData.idNumber.trim()) {
        newErrors.idNumber = 'ID number is required.';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required.';
      } else if (formData.phone.length < 8) {
        newErrors.phone = 'Please enter a valid phone number.';
      }
    }

    if (currentStep === 2) {
      if (!formData.city) {
        newErrors.city = 'City is required.';
      }

      if (!formData.district.trim()) {
        newErrors.district = 'District or neighborhood is required.';
      }

      if (!formData.street.trim()) {
        newErrors.street = 'Street name is required.';
      }
    }

    if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters.';
      } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must include letters and numbers.';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    if (currentStep === 1) {
      return await validateEmailAvailability();
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setSubmitError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateStep(3);
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await registerUser({
        role: 'buyer_individual',
        buyer_type: 'individual',

        email: normalizeEmail(formData.email),
        password: formData.password,
        password_confirm: formData.confirmPassword,

        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        id_type: formData.idType,
        id_number: formData.idNumber.trim(),
        date_of_birth: formData.dateOfBirth || '',
        phone: formData.phone.trim(),

        city: formData.city,
        district: formData.district.trim(),
        street: formData.street.trim(),
        building_number: formData.buildingNumber.trim(),
        postal_code: formData.postalCode.trim(),
        additional_directions: formData.additionalDirections.trim(),

        subscribe_newsletter: formData.subscribeNewsletter,
      });

      navigate('/login', {
        state: {
          message: 'Registration successful. You can now sign in to your account.',
          email: normalizeEmail(formData.email),
        },
      });
    } catch (error: any) {
      const message = extractErrorMessage(
        error,
        'Registration failed. Please try again.'
      );

      if (
        message.toLowerCase().includes('email') &&
        (
          message.toLowerCase().includes('exists') ||
          message.toLowerCase().includes('already') ||
          message.toLowerCase().includes('registered')
        )
      ) {
        setErrors((prev) => ({
          ...prev,
          email: message,
        }));

        if (step !== 1) {
          setStep(1);
        }
        return;
      }

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Email & Personal Info', icon: Mail },
    { number: 2, title: 'Address', icon: MapPin },
    { number: 3, title: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex flex-col items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={PLATFORM_LOGO} alt="Steel Platform" className="h-16 w-auto object-contain" />
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-[#1C4D8D] transition-colors hover:text-[#0F2854]"
          >
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isActive = step === item.number;
              const isCompleted = step > item.number;

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
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
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
            <CardTitle className="text-[#0F2854]">Create Your Individual Account</CardTitle>
            <CardDescription>
              Register as an individual buyer to purchase quality steel products for personal projects.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {submitError && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">{submitError}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="mb-2 text-lg font-semibold text-[#0F2854]">Email and Personal Information</h3>

                  <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
                    <Mail className="h-4 w-4 text-[#4988C4]" />
                    <AlertDescription className="text-sm text-[#111827]">
                      Start with your email address. Each email can only be used for one account.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={validateEmailAvailability}
                          autoComplete="email"
                          className={`border-[#E5E7EB] bg-white pl-10 ${
                            errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                          }`}
                          placeholder="your.email@example.com"
                        />
                      </div>

                      {emailChecking && <p className="text-xs text-[#4988C4]">Checking email availability...</p>}
                      {!errors.email && emailVerified && !emailChecking && (
                        <p className="text-xs text-green-600">This email is available.</p>
                      )}
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`border-[#E5E7EB] bg-white ${
                          errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder="e.g., Ahmed"
                      />
                      {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`border-[#E5E7EB] bg-white ${
                          errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder="e.g., Al-Mansoori"
                      />
                      {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idType">
                        ID Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.idType} onValueChange={(value) => setFieldValue('idType', value)}>
                        <SelectTrigger
                          className={`border-[#E5E7EB] bg-white ${
                            errors.idType ? 'border-red-500 focus:ring-red-500' : ''
                          }`}
                        >
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          {idTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.idType && <p className="text-xs text-red-500">{errors.idType}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">
                        ID Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        type="text"
                        inputMode="numeric"
                        value={formData.idNumber}
                        onChange={handleChange}
                        className={`border-[#E5E7EB] bg-white ${
                          errors.idNumber ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder="e.g., 1234567890"
                      />
                      {errors.idNumber && <p className="text-xs text-red-500">{errors.idNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="border-[#E5E7EB] bg-white"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                        <Input
                          id="phone"
                          name="phone"
                          type="text"
                          inputMode="numeric"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`border-[#E5E7EB] bg-white pl-10 ${
                            errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''
                          }`}
                          placeholder="9665XXXXXXXX"
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
                    <User className="h-4 w-4 text-[#4988C4]" />
                    <AlertDescription className="text-sm text-[#111827]">
                      Your personal information is used only for account, order, and delivery purposes.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="mb-2 text-lg font-semibold text-[#0F2854]">Delivery Address</h3>

                  <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
                    <MapPin className="h-4 w-4 text-[#4988C4]" />
                    <AlertDescription className="text-sm text-[#111827]">
                      Please provide accurate address details to ensure smooth delivery of your orders.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.city} onValueChange={(value) => setFieldValue('city', value)}>
                        <SelectTrigger
                          className={`border-[#E5E7EB] bg-white ${
                            errors.city ? 'border-red-500 focus:ring-red-500' : ''
                          }`}
                        >
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {saudiCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">
                        District or Neighborhood <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className={`border-[#E5E7EB] bg-white ${
                          errors.district ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder="e.g., Al Olaya"
                      />
                      {errors.district && <p className="text-xs text-red-500">{errors.district}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">
                        Street Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className={`border-[#E5E7EB] bg-white ${
                          errors.street ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder="e.g., King Fahd Road"
                      />
                      {errors.street && <p className="text-xs text-red-500">{errors.street}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buildingNumber">Building or House Number</Label>
                      <Input
                        id="buildingNumber"
                        name="buildingNumber"
                        type="text"
                        inputMode="numeric"
                        value={formData.buildingNumber}
                        onChange={handleChange}
                        className="border-[#E5E7EB] bg-white"
                        placeholder="e.g., 1234"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        inputMode="numeric"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="border-[#E5E7EB] bg-white"
                        placeholder="e.g., 12345"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalDirections">Additional Directions</Label>
                    <Textarea
                      id="additionalDirections"
                      name="additionalDirections"
                      value={formData.additionalDirections}
                      onChange={handleChange}
                      className="resize-none border-[#E5E7EB] bg-white"
                      rows={3}
                      placeholder="e.g., Near the mosque, white building, apartment 5A..."
                    />
                    <p className="text-xs text-[#6B7280]">
                      Provide any extra details to help the delivery driver find your location.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="mb-2 text-lg font-semibold text-[#0F2854]">Account Security</h3>

                  <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
                    <Shield className="h-4 w-4 text-[#4988C4]" />
                    <AlertDescription className="text-sm text-[#111827]">
                      Create a strong password to protect your account and personal information.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`border-[#E5E7EB] bg-white ${
                          errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder="Minimum 8 characters"
                      />
                      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                      <div className="space-y-1">
                        <p className="text-xs text-[#6B7280]">Password must contain:</p>
                        <ul className="list-inside list-disc space-y-0.5 text-xs text-[#6B7280]">
                          <li>At least 8 characters</li>
                          <li>A mix of letters and numbers</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`border-[#E5E7EB] bg-white ${
                          errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                        placeholder="Re-enter your password"
                      />
                      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => setFieldValue('agreeToTerms', checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="agreeToTerms" className="cursor-pointer text-sm leading-relaxed">
                          I agree to the{' '}
                          <Link to="/terms" className="text-[#4988C4] hover:underline">
                            Terms and Conditions
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-[#4988C4] hover:underline">
                            Privacy Policy
                          </Link>
                          .
                        </Label>
                      </div>
                    </div>
                    {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms}</p>}

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="subscribeNewsletter"
                        checked={formData.subscribeNewsletter}
                        onCheckedChange={(checked) => setFieldValue('subscribeNewsletter', checked as boolean)}
                      />
                      <Label htmlFor="subscribeNewsletter" className="cursor-pointer text-sm text-[#6B7280]">
                        Send me updates about new products, special offers, and promotions.
                      </Label>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                    <h4 className="mb-3 font-semibold text-[#111827]">Registration Summary</h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-[#6B7280]">Name:</span>
                        <span className="font-medium text-[#111827]">{summaryName || '-'}</span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#6B7280]">Email:</span>
                        <span className="text-[#111827]">{normalizeEmail(formData.email) || '-'}</span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#6B7280]">Phone:</span>
                        <span className="text-[#111827]">{formData.phone || '-'}</span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#6B7280]">ID Type:</span>
                        <span className="text-[#111827]">{formData.idType || '-'}</span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#6B7280]">City:</span>
                        <span className="text-[#111827]">{formData.city || '-'}</span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#6B7280]">District:</span>
                        <span className="text-[#111827]">{formData.district || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between border-t border-[#E5E7EB] pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || isSubmitting}
                  className="border-[#E5E7EB]"
                >
                  Back
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={emailChecking}
                    className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#6B7280]">Already have an account? </span>
              <Link to="/login" className="text-[#4988C4] hover:underline">
                Sign In
              </Link>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-[#6B7280]">Registering for a business? </span>
              <Link to="/register/buyer-company" className="text-[#4988C4] hover:underline">
                Register as Company
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-[#6B7280]">
            Need help?{' '}
            <a href="mailto:support@steelplatform.sa" className="text-[#4988C4] hover:underline">
              Contact Support
            </a>
          </p>

          <p className="text-sm text-[#6B7280]">
            Want to sell steel products?{' '}
            <Link to="/register/supplier" className="text-[#4988C4] hover:underline">
              Register as Supplier
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}