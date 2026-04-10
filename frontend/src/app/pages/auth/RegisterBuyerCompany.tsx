import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { PLATFORM_LOGO } from "../../lib/constants";
import { checkEmailExists, normalizeEmail, registerUser } from "../../lib/api";

const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseEmailExistsResult(result: any): boolean {
  if (typeof result === "boolean") return result;

  if (result?.exists === true) return true;
  if (result?.is_registered === true) return true;
  if (result?.available === false) return true;

  return false;
}

function extractErrorMessage(error: any, fallback: string) {
  if (!error) return fallback;

  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  if (error?.error) return error.error;

  return fallback;
}

export default function RegisterBuyerCompany() {
  const navigate = useNavigate();

  const [step] = useState(1);

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [commercialRegistrationNumber, setCommercialRegistrationNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [yearEstablished, setYearEstablished] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [error, setError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmailAvailability = async () => {
    const normalized = normalizeEmail(email);

    if (!normalized) {
      setError("Email address is required.");
      setEmailVerified(false);
      return false;
    }

    if (!isValidEmail(normalized)) {
      setError("Please enter a valid email address.");
      setEmailVerified(false);
      return false;
    }

    setCheckingEmail(true);
    setError("");

    try {
      const result = await checkEmailExists(normalized);
      const emailExists = parseEmailExistsResult(result);

      if (emailExists) {
        setError("This email is already registered.");
        setEmailVerified(false);
        return false;
      }

      setEmailVerified(true);
      return true;
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to check email availability."));
      setEmailVerified(false);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalized = normalizeEmail(email);

    if (!normalized) {
      setError("Email address is required.");
      return;
    }

    if (!isValidEmail(normalized)) {
      setError("Please enter a valid email address.");
      return;
    }

    setCheckingEmail(true);
    let emailExists = false;

    try {
      const result = await checkEmailExists(normalized);
      emailExists = parseEmailExistsResult(result);
    } catch {
      emailExists = false;
    } finally {
      setCheckingEmail(false);
    }

    if (emailExists) {
      setError("This email is already registered.");
      setEmailVerified(false);
      return;
    }

    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!commercialRegistrationNumber.trim()) {
      setError("Commercial registration number is required.");
      return;
    }

    if (!taxNumber.trim()) {
      setError("Tax number is required.");
      return;
    }

    if (!yearEstablished.trim()) {
      setError("Year established is required.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNumber = Number(yearEstablished);
    if (!Number.isFinite(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
      setError(`Year must be between 1900 and ${currentYear}.`);
      return;
    }

    if (!companySize) {
      setError("Company size is required.");
      return;
    }

    if (!contactPerson.trim()) {
      setError("Contact person name is required.");
      return;
    }

    if (!position.trim()) {
      setError("Position is required.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (phone.trim().length < 8) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError("Password must include letters and numbers.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        role: "buyer_company",
        buyer_type: "company",

        email: normalized,
        password,
        password_confirm: confirmPassword,

        company_name: companyName.trim(),
        company: companyName.trim(),

        commercial_registration_number: commercialRegistrationNumber.trim(),
        tax_number: taxNumber.trim(),
        year_established: yearEstablished.trim(),
        company_size: companySize,

        contact_person: contactPerson.trim(),
        position: position.trim(),
        phone: phone.trim(),
        website: website.trim(),
      });

      navigate("/login", {
        state: {
          message: "Company registration successful. You can now sign in to your account.",
          email: normalized,
        },
      });
    } catch (err: any) {
      const message = extractErrorMessage(
        err,
        "Registration failed. Please try again."
      );

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Company Info", icon: Building2 },
    { number: 2, title: "Contact Details", icon: User },
    { number: 3, title: "Business Details", icon: FileText },
    { number: 4, title: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
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
          <div className="mx-auto flex max-w-2xl items-center justify-between">
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
                          ? "border-[#0F2854] bg-[#0F2854] text-white"
                          : isActive
                          ? "border-[#0F2854] bg-white text-[#0F2854]"
                          : "border-[#E5E7EB] bg-white text-[#6B7280]"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>

                    <span
                      className={`mt-2 text-center text-sm font-medium ${
                        isActive ? "text-[#0F2854]" : "text-[#6B7280]"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 mb-8 h-0.5 flex-1 ${
                        isCompleted ? "bg-[#0F2854]" : "bg-[#E5E7EB]"
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
            <CardTitle className="text-[#0F2854]">Register as Buyer Company</CardTitle>
            <CardDescription>
              Create a company account to purchase steel products for your business operations.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-5">
                <h3 className="mb-2 text-lg font-semibold text-[#0F2854]">Company Information</h3>

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
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                          setEmailVerified(false);
                        }}
                        onBlur={validateEmailAvailability}
                        className="border-[#E5E7EB] bg-white pl-10"
                        placeholder="procurement@company.com"
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
                    <Label htmlFor="companyName">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          setError("");
                        }}
                        className="border-[#E5E7EB] bg-white pl-10"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commercialRegistrationNumber">
                      Commercial Registration Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="commercialRegistrationNumber"
                      inputMode="numeric"
                      value={commercialRegistrationNumber}
                      onChange={(e) => {
                        setCommercialRegistrationNumber(sanitizeDigits(e.target.value));
                        setError("");
                      }}
                      className="border-[#E5E7EB] bg-white"
                      placeholder="Numbers only"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">
                      Tax Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="taxNumber"
                      inputMode="numeric"
                      value={taxNumber}
                      onChange={(e) => {
                        setTaxNumber(sanitizeDigits(e.target.value));
                        setError("");
                      }}
                      className="border-[#E5E7EB] bg-white"
                      placeholder="Numbers only"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearEstablished">
                      Year Established <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="yearEstablished"
                      inputMode="numeric"
                      maxLength={4}
                      value={yearEstablished}
                      onChange={(e) => {
                        setYearEstablished(sanitizeDigits(e.target.value));
                        setError("");
                      }}
                      className="border-[#E5E7EB] bg-white"
                      placeholder="e.g. 2008"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="companySize">
                      Company Size <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={companySize}
                      onValueChange={(value) => {
                        setCompanySize(value);
                        setError("");
                      }}
                    >
                      <SelectTrigger className="border-[#E5E7EB] bg-white">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">
                      Contact Person <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <Input
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => {
                          setContactPerson(e.target.value);
                          setError("");
                        }}
                        className="border-[#E5E7EB] bg-white pl-10"
                        placeholder="Enter contact person"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">
                      Position <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => {
                        setPosition(e.target.value);
                        setError("");
                      }}
                      className="border-[#E5E7EB] bg-white"
                      placeholder="e.g. Procurement Manager"
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
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => {
                          setPhone(sanitizeDigits(e.target.value));
                          setError("");
                        }}
                        className="border-[#E5E7EB] bg-white pl-10"
                        placeholder="Numbers only"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Company Website</Label>
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                      <Input
                        id="website"
                        type="url"
                        value={website}
                        onChange={(e) => {
                          setWebsite(e.target.value);
                          setError("");
                        }}
                        className="border-[#E5E7EB] bg-white pl-10"
                        placeholder="https://www.company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="border-[#E5E7EB] bg-white"
                      placeholder="Minimum 8 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="border-[#E5E7EB] bg-white"
                      placeholder="Re-enter your password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                    <Checkbox
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="agreeToTerms" className="cursor-pointer text-sm leading-relaxed">
                        I agree to the{" "}
                        <Link to="/terms" className="text-[#4988C4] hover:underline">
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-[#4988C4] hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between border-t border-[#E5E7EB] pt-6">
                <Button type="button" variant="outline" disabled className="border-[#E5E7EB]">
                  Back
                </Button>

                <Button
                  type="submit"
                  disabled={checkingEmail || isSubmitting}
                  className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
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