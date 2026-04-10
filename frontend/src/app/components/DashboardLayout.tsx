import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  FileText,
  Settings,
  Store,
  BarChart3,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CartDropdown } from './CartDropdown';
import { mockConversations } from '../lib/mock-data';
import { PLATFORM_LOGO } from '../lib/constants';

interface DashboardLayoutProps {
  children: ReactNode;
}

function isBuyerRole(role?: string | null) {
  return (
    role === 'buyer' ||
    role === 'buyer_individual' ||
    role === 'buyer_company' ||
    role === 'buyer_establishment'
  );
}

function getDisplayName(user: any) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  if (user?.name) return user.name;
  if (user?.username) return user.username;
  return 'User';
}

function getRoleLabel(role?: string | null) {
  const roleMap: Record<string, string> = {
    buyer: 'Buyer',
    buyer_individual: 'Buyer Individual',
    buyer_company: 'Buyer Company',
    buyer_establishment: 'Buyer Establishment',
    supplier: 'Supplier',
    admin: 'Admin',
  };

  if (!role) return 'User';
  return roleMap[role] || role.replace(/_/g, ' ');
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const buyerNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/buyer/dashboard' },
    { icon: Store, label: 'Browse Products', path: '/marketplace' },
    { icon: ShoppingCart, label: 'Cart', path: '/buyer/cart' },
    { icon: Package, label: 'Orders', path: '/buyer/orders' },
    { icon: FileText, label: 'Request Quote', path: '/buyer/rfq' },
    { icon: MessageSquare, label: 'Messages', path: '/buyer/messages' },
    { icon: Settings, label: 'Settings', path: '/buyer/settings' },
  ];

  const supplierNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/supplier/dashboard' },
    { icon: Store, label: 'Products', path: '/supplier/products' },
    { icon: Package, label: 'Orders', path: '/supplier/orders' },
    { icon: FileText, label: 'RFQ Requests', path: '/supplier/rfq' },
    { icon: BarChart3, label: 'Analytics', path: '/supplier/analytics' },
    { icon: Settings, label: 'Settings', path: '/supplier/settings' },
  ];

  const adminNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  ];

  const navigation = isBuyerRole(user?.role)
    ? buyerNav
    : user?.role === 'supplier'
    ? supplierNav
    : user?.role === 'admin'
    ? adminNav
    : [];

  const totalUnreadMessages = mockConversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  const getPageTitle = () => {
    if (location.pathname === '/buyer/dashboard') return 'Dashboard';
    if (location.pathname === '/buyer/cart') return 'Shopping Cart';
    if (location.pathname === '/buyer/orders') return 'My Orders';
    if (location.pathname.startsWith('/buyer/orders/')) return 'Order Details';
    if (location.pathname === '/buyer/messages') return 'Messages';
    if (location.pathname === '/buyer/rfq' || location.pathname === '/buyer/rfq/new') {
      return 'Request Quote';
    }
    if (location.pathname === '/buyer/checkout') return 'Checkout';
    if (location.pathname === '/buyer/payment') return 'Payment';
    if (location.pathname === '/buyer/payment/otp') return 'Payment Verification';
    if (
      location.pathname === '/buyer/payment/success' ||
      location.pathname === '/buyer/order-confirmation'
    ) {
      return 'Order Confirmation';
    }
    if (location.pathname === '/buyer/settings') return 'Settings';
    if (
      location.pathname === '/marketplace' ||
      location.pathname.startsWith('/marketplace/')
    ) {
      return 'Browse Products';
    }

    if (location.pathname === '/supplier/dashboard') return 'Dashboard';
    if (location.pathname === '/supplier/products') return 'Products';
    if (location.pathname === '/supplier/products/new') return 'Add Product';
    if (location.pathname.startsWith('/supplier/products/edit/')) return 'Edit Product';
    if (location.pathname === '/supplier/orders') return 'Orders';
    if (location.pathname.startsWith('/supplier/orders/')) return 'Order Details';
    if (location.pathname === '/supplier/rfq') return 'RFQ Requests';
    if (location.pathname === '/supplier/analytics') return 'Analytics';
    if (location.pathname === '/supplier/settings') return 'Settings';

    if (location.pathname === '/admin/dashboard') return 'Admin Dashboard';
    if (location.pathname === '/admin/users') return 'Users Management';
    if (location.pathname === '/admin/products') return 'Products Management';
    if (location.pathname === '/admin/analytics') return 'Analytics';

    return 'Dashboard';
  };

  const getPageSubtitle = () => {
    if (user?.role === 'admin') {
      return 'Manage platform operations, users, products, and analytics.';
    }

    if (user?.role === 'supplier') {
      return 'Manage your catalog, orders, and supplier activity.';
    }

    if (isBuyerRole(user?.role)) {
      return 'Manage your purchases, orders, quotes, and account.';
    }

    return 'Welcome back.';
  };

  const showTopHeader =
    isBuyerRole(user?.role) || user?.role === 'supplier' || user?.role === 'admin';

  const isAdminSidebar = user?.role === 'admin';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside
        className={`relative flex-shrink-0 border-r border-[#1C4D8D] bg-[#0F2854] text-white ${
          isAdminSidebar ? 'w-[250px]' : 'w-72'
        }`}
      >
        <div className="flex h-full flex-col">
          {isAdminSidebar ? (
            <>
              <div className="border-b border-[#1C4D8D] px-5 py-4">
                <Link to="/" className="inline-flex items-center">
                  <img
                    src={PLATFORM_LOGO}
                    alt="Steel Platform"
                    className="h-10 w-auto object-contain"
                  />
                </Link>
              </div>

              <div className="px-4 pb-4 pt-5">
                <div className="text-[14px] text-[#B9D7F1]">Welcome back,</div>
                <div className="mt-1 text-[26px] font-bold leading-tight text-white">
                  {getDisplayName(user)}
                </div>
                <div className="mt-1 text-[15px] text-[#B9D7F1]">Steel Platform</div>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-[#1C4D8D] px-6 py-6">
                <Link to="/" className="flex items-center">
                  <img
                    src={PLATFORM_LOGO}
                    alt="Steel Platform"
                    className="h-14 w-auto object-contain"
                  />
                </Link>
              </div>

              <div className="border-b border-[#1C4D8D] px-6 py-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#BDE8F5]/80">
                      Account
                    </div>
                    <div className="mt-2 text-base font-semibold">
                      {getDisplayName(user)}
                    </div>
                  </div>
                  <Badge className="border-0 bg-[#BDE8F5] text-[#0F2854] hover:bg-[#BDE8F5]">
                    {getRoleLabel(user?.role)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-[#BDE8F5]">
                  <div>{user?.email || '-'}</div>
                  {user?.company ? <div>{user.company}</div> : null}
                </div>
              </div>
            </>
          )}

          <div className={`flex-1 overflow-y-auto ${isAdminSidebar ? 'px-3 py-3' : 'px-4 py-5'}`}>
            {!isAdminSidebar && (
              <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#BDE8F5]/70">
                Navigation
              </div>
            )}

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.path === '/marketplace'
                    ? location.pathname === '/marketplace' ||
                      location.pathname.startsWith('/marketplace/')
                    : location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`);

                const showBadge =
                  item.path === '/buyer/messages' && totalUnreadMessages > 0;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all ${
                      isActive
                        ? 'bg-[#1C4D8D] text-white'
                        : 'text-[#D7ECF9] hover:bg-[#163766] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="text-[15px] font-medium">{item.label}</span>
                    </div>

                    {showBadge ? (
                      <Badge className="border-0 bg-[#BDE8F5] text-[#0F2854] hover:bg-[#BDE8F5]">
                        {totalUnreadMessages}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t border-[#1C4D8D] p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="h-12 w-full justify-start rounded-xl px-3 text-[#D7ECF9] hover:bg-[#163766] hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {showTopHeader && (
          <div className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 px-8 py-5 backdrop-blur">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
                  {getPageTitle()}
                </h2>
                <p className="mt-1 text-sm text-[#6B7280]">{getPageSubtitle()}</p>
              </div>

              <div className="flex items-center gap-4">
                {isBuyerRole(user?.role) && <CartDropdown />}
                <div className="hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 md:block">
                  <div className="text-xs text-[#6B7280]">Signed in as</div>
                  <div className="text-sm font-semibold text-[#111827]">
                    {getDisplayName(user)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-[1600px] px-8 py-8">{children}</div>
      </main>
    </div>
  );
}