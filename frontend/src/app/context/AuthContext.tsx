import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser as apiLogoutUser,
} from '../lib/api';

export type UserRole =
  | 'buyer'
  | 'buyer_individual'
  | 'buyer_company'
  | 'buyer_establishment'
  | 'supplier'
  | 'admin'
  | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
  city?: string;
  buyer_type?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  permissions?: string[];
  status?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  isBuyer: boolean;
  isSupplier: boolean;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): User | null {
  try {
    const raw =
      localStorage.getItem('user') ||
      localStorage.getItem('steel_platform_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeBuyerType(buyerType: any): string {
  const value = String(buyerType || '').trim().toLowerCase();

  if (value === 'individual') return 'individual';
  if (value === 'company') return 'company';
  if (value === 'establishment') return 'establishment';
  if (value === 'commercial') return 'establishment';

  return value;
}

function normalizeRole(role: any, buyerType?: any): UserRole {
  const value = String(role || '').trim().toLowerCase();
  const normalizedBuyerType = normalizeBuyerType(buyerType);

  if (value === 'buyer') {
    if (normalizedBuyerType === 'individual') return 'buyer_individual';
    if (normalizedBuyerType === 'company') return 'buyer_company';
    if (normalizedBuyerType === 'establishment') return 'buyer_establishment';
    return 'buyer';
  }

  if (
    value === 'buyer_individual' ||
    value === 'buyer_company' ||
    value === 'buyer_establishment' ||
    value === 'supplier' ||
    value === 'admin'
  ) {
    return value as UserRole;
  }

  return null;
}

function normalizePermissions(permissions: any): string[] {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

function normalizeUser(apiUser: any): User {
  const firstName = String(apiUser?.first_name || '').trim();
  const lastName = String(apiUser?.last_name || '').trim();
  const username = String(apiUser?.username || '').trim();
  const email = String(apiUser?.email || '').trim();

  const fullName = `${firstName} ${lastName}`.trim();
  const name = fullName || username || email || 'User';

  const normalizedBuyerType = normalizeBuyerType(apiUser?.buyer_type);
  const normalizedRole = normalizeRole(apiUser?.role, normalizedBuyerType);
  const normalizedPermissions = normalizePermissions(apiUser?.permissions);

  return {
    id: String(apiUser?.id ?? ''),
    email,
    name,
    role: normalizedRole,
    company: apiUser?.company || '',
    phone: apiUser?.phone || '',
    city: apiUser?.city || '',
    buyer_type: normalizedBuyerType,
    first_name: firstName,
    last_name: lastName,
    username,
    permissions: normalizedPermissions,
    status: String(apiUser?.status || '').trim(),
  };
}

function persistUser(user: User | null) {
  if (user) {
    localStorage.setItem('steel_platform_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('steel_platform_user');
    localStorage.removeItem('user');
  }
}

function persistTokens(data: any) {
  const tokens = data?.tokens || data;

  if (tokens?.access) {
    localStorage.setItem('access', tokens.access);
  }

  if (tokens?.refresh) {
    localStorage.setItem('refresh', tokens.refresh);
  }
}

function isBuyerRole(role: UserRole) {
  return (
    role === 'buyer' ||
    role === 'buyer_individual' ||
    role === 'buyer_company' ||
    role === 'buyer_establishment'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    persistUser(user);
  }, [user]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const access = localStorage.getItem('access');

      if (!access) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const apiUser = await getCurrentUser();
        const normalized = normalizeUser(apiUser);
        setUser(normalized);
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        apiLogoutUser();
        localStorage.removeItem('steel_platform_cart');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const refreshUser = async (): Promise<User | null> => {
    try {
      const access = localStorage.getItem('access');

      if (!access) {
        setUser(null);
        return null;
      }

      const apiUser = await getCurrentUser();
      const normalized = normalizeUser(apiUser);
      setUser(normalized);
      return normalized;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      apiLogoutUser();
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setUser(null);
      return null;
    }
  };

  const login = async (
    email: string,
    password: string,
    role?: UserRole
  ): Promise<User> => {
    setLoading(true);

    try {
      const loginResponse = await loginUser({
        usernameOrEmail: email,
        password,
        role,
      });

      persistTokens(loginResponse);

      let apiUser = loginResponse?.user;

      if (!apiUser) {
        apiUser = await getCurrentUser();
      }

      const normalized = normalizeUser(apiUser);
      setUser(normalized);
      return normalized;
    } catch (error) {
      setUser(null);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogoutUser();
    localStorage.removeItem('steel_platform_cart');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  const role = normalizeRole(user?.role, user?.buyer_type);

  const hasPermission = (permission: string) => {
    if (!user || role !== 'admin') {
      return false;
    }

    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]) => {
    if (!user || role !== 'admin') {
      return false;
    }

    return permissions.some((permission) => hasPermission(permission));
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('access'),
    login,
    logout,
    refreshUser,
    isBuyer: isBuyerRole(role),
    isSupplier: role === 'supplier',
    isAdmin: role === 'admin',
    hasPermission,
    hasAnyPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}