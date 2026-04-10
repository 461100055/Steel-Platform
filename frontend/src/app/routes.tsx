import { createBrowserRouter, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/dashboard/ProtectedRoute';

// Marketplace pages
import Landing from './pages/marketplace/Landing';
import ProductListing from './pages/marketplace/ProductListing';
import ProductDetails from './pages/marketplace/ProductDetails';
import SupplierProfile from './pages/marketplace/SupplierProfile';

// Auth pages
import Login from './pages/auth/Login';
import RegisterSelect from './pages/auth/RegisterSelect';
import RegisterBuyer from './pages/auth/RegisterBuyer';
import RegisterSupplier from './pages/auth/RegisterSupplier';
import RegisterIndividual from './pages/auth/RegisterIndividual';
import RegisterBuyerCompany from './pages/auth/RegisterBuyerCompany';
import RegisterBuyerEstablishment from './pages/auth/RegisterBuyerEstablishment';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Cart from './pages/buyer/Cart';
import Orders from './pages/buyer/Orders';
import BuyerOrderDetails from './pages/buyer/BuyerOrderDetails';
import BuyerRFQ from './pages/buyer/BuyerRFQ';
import Checkout from './pages/buyer/Checkout';
import Payment from './pages/buyer/Payment';
import PaymentOTP from './pages/buyer/PaymentOTP';
import PaymentSuccess from './pages/buyer/PaymentSuccess';
import OrderConfirmation from './pages/buyer/OrderConfirmation';
import Messages from './pages/buyer/Messages';
import BuyerSettings from './pages/buyer/BuyerSettings';

// Supplier pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProducts from './pages/supplier/SupplierProducts';
import SupplierProductForm from './pages/supplier/SupplierProductForm';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierOrderDetails from './pages/supplier/SupplierOrderDetails';
import SupplierRFQ from './pages/supplier/SupplierRFQ';
import SupplierAnalytics from './pages/supplier/SupplierAnalytics';
import SupplierSettings from './pages/supplier/SupplierSettings';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminRFQs from './pages/admin/AdminRFQs';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Static pages
import About from './pages/static/About';
import Contact from './pages/static/Contact';
import Terms from './pages/static/Terms';
import Privacy from './pages/static/Privacy';

const buyerRoles = [
  'buyer',
  'buyer_individual',
  'buyer_company',
  'buyer_establishment',
] as const;

export const router = createBrowserRouter([
  // =========================
  // Public / Landing
  // =========================
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/marketplace',
    element: <ProductListing />,
  },
  {
    path: '/marketplace/product/:id',
    element: <ProductDetails />,
  },
  {
    path: '/marketplace/supplier/:id',
    element: <SupplierProfile />,
  },

  // =========================
  // Static Pages
  // =========================
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },

  // =========================
  // Auth Pages
  // =========================
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Navigate to="/register/select" replace />,
  },
  {
    path: '/register/select',
    element: <RegisterSelect />,
  },
  {
    path: '/register/buyer',
    element: <RegisterBuyer />,
  },
  {
    path: '/register/individual',
    element: <RegisterIndividual />,
  },
  {
    path: '/register/buyer-company',
    element: <RegisterBuyerCompany />,
  },
  {
    path: '/register/buyer-establishment',
    element: <RegisterBuyerEstablishment />,
  },
  {
    path: '/register/supplier',
    element: <RegisterSupplier />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },

  // =========================
  // Buyer Pages
  // =========================
  {
    path: '/buyer',
    element: <Navigate to="/buyer/dashboard" replace />,
  },
  {
    path: '/buyer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <BuyerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/cart',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <Cart />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/orders',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <Orders />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/orders/:orderId',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <BuyerOrderDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/rfq',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <BuyerRFQ />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/rfq/new',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <BuyerRFQ />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/checkout',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <Checkout />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/payment',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <Payment />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/payment/otp',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <PaymentOTP />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/payment/success',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <PaymentSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/order-confirmation',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <OrderConfirmation />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/messages',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buyer/settings',
    element: (
      <ProtectedRoute allowedRoles={[...buyerRoles]}>
        <BuyerSettings />
      </ProtectedRoute>
    ),
  },

  // =========================
  // Supplier Pages
  // =========================
  {
    path: '/supplier',
    element: <Navigate to="/supplier/dashboard" replace />,
  },
  {
    path: '/supplier/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/products',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierProducts />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/products/new',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierProductForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/products/edit/:id',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierProductForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/orders',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/orders/:orderId',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierOrderDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/rfq',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierRFQ />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/analytics',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierAnalytics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supplier/settings',
    element: (
      <ProtectedRoute allowedRoles={['supplier']}>
        <SupplierSettings />
      </ProtectedRoute>
    ),
  },

  // =========================
  // Admin Pages
  // =========================
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/suppliers',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSuppliers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminProducts />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/rfqs',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminRFQs />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminAnalytics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  // =========================
  // Fallback
  // =========================
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);