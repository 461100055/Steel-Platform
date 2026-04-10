import { Link, useNavigate } from 'react-router-dom';
import { Building2, Store, User, ArrowRight } from 'lucide-react';
import { PLATFORM_LOGO } from '../../lib/constants';

const buyerOptions = [
  {
    title: 'Individual',
    description:
      'Create an account for personal purchases and small project orders.',
    icon: User,
    path: '/register/individual',
  },
  {
    title: 'Company',
    description:
      'Register your company to purchase steel products for procurement and business operations.',
    icon: Building2,
    path: '/register/buyer-company',
  },
  {
    title: 'Commercial Establishment',
    description:
      'Register a commercial establishment account for recurring purchases and delivery management.',
    icon: Store,
    path: '/register/buyer-establishment',
  },
];

export default function RegisterBuyer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
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

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#0F2854]">
            Choose Buyer Account Type
          </h1>
          <p className="mt-3 text-base text-[#6B7280]">
            Select the type of buyer account you want to create on Steel Platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {buyerOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.path}
                type="button"
                onClick={() => navigate(option.path)}
                className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#4988C4] hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#BDE8F5]/30 text-[#0F2854]">
                    <Icon className="h-7 w-7" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-[#9CA3AF] transition-transform group-hover:translate-x-1 group-hover:text-[#1C4D8D]" />
                </div>

                <h2 className="text-xl font-semibold text-[#0F2854]">
                  {option.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                  {option.description}
                </p>

                <div className="mt-5 inline-flex items-center text-sm font-medium text-[#1C4D8D] group-hover:text-[#0F2854]">
                  Continue Registration
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center text-sm">
          <span className="text-[#6B7280]">Already have an account? </span>
          <Link to="/login" className="text-[#4988C4] hover:underline">
            Sign In
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-[#6B7280]">
          Need help?{' '}
          <a
            href="mailto:support@steelplatform.sa"
            className="text-[#4988C4] hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}