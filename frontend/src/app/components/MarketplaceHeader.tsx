import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CartDropdown } from './CartDropdown';
import { useAuth } from '../context/AuthContext';
import { Home, Search, User } from 'lucide-react';
import { PLATFORM_LOGO, PLATFORM_NAME } from '../lib/constants';

interface MarketplaceHeaderProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export function MarketplaceHeader({
  showSearch = false,
  searchQuery = '',
  onSearchChange,
}: MarketplaceHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName =
    user?.name ||
    user?.first_name ||
    user?.last_name ||
    user?.username ||
    user?.email ||
    'User';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardNavigation = () => {
    if (!user) return;

    if (
      user.role === 'buyer' ||
      user.role === 'buyer_individual' ||
      user.role === 'buyer_company' ||
      user.role === 'buyer_establishment'
    ) {
      navigate('/buyer/dashboard');
      return;
    }

    if (user.role === 'supplier') {
      navigate('/supplier/dashboard');
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <img
                src={PLATFORM_LOGO}
                alt={PLATFORM_NAME}
                className="h-25 w-auto object-contain"
              />
            </Link>

            {!showSearch && (
              <nav className="hidden items-center gap-6 md:flex">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 font-medium text-[#0F2854] transition-colors hover:text-[#4988C4]"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>

                <Link
                  to="/marketplace"
                  className="font-medium text-[#111827] transition-colors hover:text-[#4988C4]"
                >
                  Marketplace
                </Link>

                <Link
                  to="/about"
                  className="font-medium text-[#111827] transition-colors hover:text-[#4988C4]"
                >
                  About
                </Link>
              </nav>
            )}
          </div>

          {showSearch && (
            <div className="hidden max-w-2xl flex-1 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="h-11 border-[#D1D5DB] bg-white pl-10"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <CartDropdown />

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-[#D7E3F4] bg-[#F8FBFF] px-4 py-2 lg:flex">
                  <User className="h-4 w-4 text-[#0F2854]" />
                  <span className="text-sm font-semibold text-[#0F2854]">
                    {displayName}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDashboardNavigation}
                  className="hidden border-[#0F2854] text-[#0F2854] hover:bg-[#EEF4FB] md:inline-flex"
                >
                  Dashboard
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden text-[#111827] md:inline-flex"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="border-[#0F2854] text-[#0F2854] hover:bg-[#EEF4FB]"
                >
                  Sign In
                </Button>

                <Button
                  size="sm"
                  onClick={() => navigate('/register/select')}
                  className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}