import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmailExists, registerUser } from "../../lib/api";

const LOGO_URL = "https://i.ibb.co/chMhLF6T/steel-logo-transparent.png";

type RegistrationRole =
  | "buyer_individual"
  | "buyer_company"
  | "buyer_establishment"
  | "supplier";

type RegistrationFormProps = {
  roleType: RegistrationRole;
};

type RegistrationConfig = {
  title: string;
  subtitle: string;
  showCompanyName: boolean;
  role: RegistrationRole;
  accentLabel: string;
};

export default function RegistrationForm({
  roleType,
}: RegistrationFormProps) {
  const navigate = useNavigate();

  const config = useMemo<RegistrationConfig>(() => {
    switch (roleType) {
      case "buyer_individual":
        return {
          title: "Individual Buyer Registration",
          subtitle:
            "Start by entering your email first. It is checked instantly before you continue.",
          showCompanyName: false,
          role: "buyer_individual",
          accentLabel: "Individual Buyer",
        };

      case "buyer_company":
        return {
          title: "Company Buyer Registration",
          subtitle:
            "Register your company account with immediate email uniqueness validation.",
          showCompanyName: true,
          role: "buyer_company",
          accentLabel: "Company Buyer",
        };

      case "buyer_establishment":
        return {
          title: "Commercial Establishment Registration",
          subtitle:
            "A dedicated registration flow for establishments and commercial entities.",
          showCompanyName: true,
          role: "buyer_establishment",
          accentLabel: "Commercial Establishment",
        };

      case "supplier":
        return {
          title: "Supplier Registration",
          subtitle:
            "Create a supplier account and start listing products and managing marketplace activity.",
          showCompanyName: true,
          role: "supplier",
          accentLabel: "Supplier",
        };
    }
  }, [roleType]);

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    if (!email.trim() || !isValidEmail) {
      setEmailExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setChecking(true);
        setError("");
        const exists = await checkEmailExists(email.trim());
        setEmailExists(exists);
      } catch (err: any) {
        setError(err.message || "Failed to check email.");
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, isValidEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (emailExists) {
      setError("This email is already registered.");
      return;
    }

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (config.showCompanyName && !companyName.trim()) {
      setError("Company / establishment name is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await registerUser({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        company_name: companyName.trim(),
        role: config.role,
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="text-center">
            <img
              src={LOGO_URL}
              alt="Steel Platform Logo"
              className="mx-auto h-20 w-20 object-contain"
            />

            <div className="mt-5 inline-flex rounded-full border border-[#D8E8F3] bg-[#F3FAFE] px-3 py-1 text-xs font-semibold text-[#1C4D8D]">
              {config.accentLabel}
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#0F2854]">
              {config.title}
            </h1>

            <p className="mt-3 text-base leading-8 text-slate-500">
              {config.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email first"
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
              />

              {checking && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Checking email...
                </div>
              )}

              {!checking && email.trim() && isValidEmail && emailExists && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  This email is already registered.
                </div>
              )}

              {!checking && email.trim() && isValidEmail && !emailExists && (
                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  This email is available.
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setError("");
                  }}
                  className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
                />
              </div>
            </div>

            {config.showCompanyName && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                  Company / Establishment name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setError("");
                  }}
                  className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
                />
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0F2854]">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#4988C4]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || checking}
              className="h-14 w-full rounded-2xl bg-[#0F2854] text-sm font-semibold text-white transition hover:bg-[#1C4D8D] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <div className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-[#1C4D8D]"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}