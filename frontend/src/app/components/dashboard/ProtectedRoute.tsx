import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

function isBuyerRole(role: UserRole) {
  return (
    role === 'buyer' ||
    role === 'buyer_individual' ||
    role === 'buyer_company' ||
    role === 'buyer_establishment'
  );
}

function getDefaultRouteByRole(role: UserRole) {
  if (isBuyerRole(role)) {
    return '/buyer/dashboard';
  }

  if (role === 'supplier') {
    return '/supplier/dashboard';
  }

  if (role === 'admin') {
    return '/admin/dashboard';
  }

  return '/login';
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0F2854]" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to={getDefaultRouteByRole(userRole)} replace />;
    }
  }

  return <>{children}</>;
}