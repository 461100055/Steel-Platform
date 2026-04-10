import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../../components/ui/alert';

type ApiUserRole =
  | 'buyer'
  | 'buyer_individual'
  | 'buyer_company'
  | 'buyer_establishment'
  | 'supplier'
  | 'admin';

type UserFilterRole = 'all' | 'buyer' | 'supplier' | 'admin';
type UserStatus = 'all' | 'active' | 'inactive' | 'suspended' | 'approved' | 'rejected';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  company: string;
  phone: string;
  city: string;
  status: string;
  joinedDate: string;
  buyerType?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  permissions?: string[];
};

type EditFormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  company: string;
  role: ApiUserRole;
  buyer_type: string;
  status: string;
  permissions: string[];
};

const API_BASE_URL =
  ((import.meta as any)?.env?.VITE_API_URL as string) || 'http://127.0.0.1:8000/api';

const ADMIN_PERMISSION_OPTIONS = [
  'manage_users',
  'manage_suppliers',
  'approve_suppliers',
  'manage_products',
  'approve_products',
  'manage_orders',
  'manage_rfqs',
  'view_analytics',
  'manage_messages',
  'manage_settings',
];

const INITIAL_EDIT_FORM: EditFormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  company: '',
  role: 'buyer_individual',
  buyer_type: 'individual',
  status: 'active',
  permissions: [],
};

function getAccessToken() {
  return localStorage.getItem('access') || '';
}

function getErrorMessage(data: any, fallback = 'Request failed.') {
  if (!data) return fallback;

  if (typeof data === 'string') return data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;

  if (typeof data === 'object') {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
}

function isBuyerRole(role: string) {
  return (
    role === 'buyer' ||
    role === 'buyer_individual' ||
    role === 'buyer_company' ||
    role === 'buyer_establishment'
  );
}

function getBuyerTypeFromRole(role: string) {
  if (role === 'buyer_company') return 'company';
  if (role === 'buyer_establishment') return 'establishment';
  return 'individual';
}

function getNormalizedBuyerRole(role: string, buyerType?: string) {
  if (role === 'buyer') {
    if (buyerType === 'company') return 'buyer_company';
    if (buyerType === 'establishment') return 'buyer_establishment';
    return 'buyer_individual';
  }

  return role as ApiUserRole;
}

function getDisplayRole(role: string) {
  if (role === 'buyer_individual') return 'Buyer Individual';
  if (role === 'buyer_company') return 'Buyer Company';
  if (role === 'buyer_establishment') return 'Buyer Establishment';
  if (role === 'supplier') return 'Supplier';
  if (role === 'admin') return 'Admin';
  return 'Buyer';
}

function mapFilterRole(userRole: string): 'buyer' | 'supplier' | 'admin' {
  if (isBuyerRole(userRole)) return 'buyer';
  if (userRole === 'supplier') return 'supplier';
  return 'admin';
}

function normalizeUser(apiUser: any): AdminUser {
  const profile = apiUser?.profile || {};

  const firstName = String(
    apiUser?.first_name ?? profile?.first_name ?? apiUser?.firstName ?? ''
  ).trim();

  const lastName = String(
    apiUser?.last_name ?? profile?.last_name ?? apiUser?.lastName ?? ''
  ).trim();

  const fullName = `${firstName} ${lastName}`.trim();

  const buyerType = String(
    apiUser?.buyer_type ?? profile?.buyer_type ?? apiUser?.buyerType ?? ''
  ).trim();

  const rawRole = String(apiUser?.role ?? profile?.role ?? 'buyer').trim();
  const normalizedRole = getNormalizedBuyerRole(rawRole, buyerType);

  return {
    id: String(apiUser?.id ?? ''),
    name:
      fullName ||
      String(apiUser?.name || apiUser?.username || apiUser?.email || 'User'),
    email: String(apiUser?.email || ''),
    role: normalizedRole,
    company: String(apiUser?.company ?? profile?.company ?? ''),
    phone: String(apiUser?.phone ?? profile?.phone ?? ''),
    city: String(apiUser?.city ?? profile?.city ?? ''),
    status: String(apiUser?.status ?? profile?.status ?? 'active'),
    joinedDate: String(
      apiUser?.joined_date ??
        apiUser?.date_joined ??
        profile?.joined_date ??
        profile?.date_joined ??
        ''
    ),
    buyerType: buyerType || getBuyerTypeFromRole(normalizedRole),
    firstName,
    lastName,
    username: String(apiUser?.username || ''),
    permissions: Array.isArray(apiUser?.permissions)
      ? apiUser.permissions
      : Array.isArray(profile?.permissions)
      ? profile.permissions
      : [],
  };
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Request failed.'));
  }

  return data;
}

async function getAdminUsers() {
  const data = await apiRequest('/admin/users/');
  const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  return list.map(normalizeUser);
}

async function updateAdminUser(userId: string, payload: Partial<EditFormState>) {
  const data = await apiRequest(`/admin/users/${userId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeUser(data);
}

async function deleteAdminUser(userId: string) {
  await apiRequest(`/admin/users/${userId}/`, {
    method: 'DELETE',
  });
}

async function toggleAdminUserStatus(userId: string) {
  const data = await apiRequest(`/admin/users/${userId}/toggle-status/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  return normalizeUser(data?.user ?? data);
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserFilterRole>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageError, setPageError] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(INITIAL_EDIT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const resetEditState = () => {
    setSelectedUser(null);
    setEditForm(INITIAL_EDIT_FORM);
  };

  const loadUsers = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      if (mode === 'initial') {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setPageError('');
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load admin users:', error);
      setPageError(error?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers('initial');
  }, [loadUsers]);

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      company: user.company || '',
      role: user.role,
      buyer_type: user.buyerType || getBuyerTypeFromRole(user.role),
      status: user.status || 'active',
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      resetEditState();
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    const trimmedEmail = editForm.email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.error('Email is required');
      return;
    }

    try {
      setIsSaving(true);

      const buyerType = isBuyerRole(editForm.role) ? editForm.buyer_type : '';

      const payload: Partial<EditFormState> = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: trimmedEmail,
        phone: editForm.phone.trim(),
        city: editForm.city.trim(),
        company: editForm.company.trim(),
        role: editForm.role,
        buyer_type: buyerType,
        status: editForm.status,
        permissions: editForm.role === 'admin' ? editForm.permissions : [],
      };

      const updatedUser = await updateAdminUser(selectedUser.id, payload);

      setUsers((prev) =>
        prev.map((user) => (user.id === selectedUser.id ? updatedUser : user))
      );

      toast.success(`User "${updatedUser.name}" has been updated successfully`);
      setIsEditDialogOpen(false);
      resetEditState();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success(`User "${user?.name}" has been deleted successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    }
  };

  const handleStatusToggle = async (userId: string) => {
    const user = users.find((u) => u.id === userId);

    try {
      const updatedUser = await toggleAdminUserStatus(userId);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? updatedUser : u))
      );

      toast.success(`User "${user?.name}" status changed to "${updatedUser.status}"`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.company.toLowerCase().includes(normalizedSearch) ||
        user.phone.toLowerCase().includes(normalizedSearch) ||
        user.city.toLowerCase().includes(normalizedSearch) ||
        getDisplayRole(user.role).toLowerCase().includes(normalizedSearch);

      const logicalRole = mapFilterRole(user.role);
      const matchesRole = roleFilter === 'all' || logicalRole === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const buyers = users.filter((u) => isBuyerRole(u.role)).length;
    const suppliers = users.filter((u) => u.role === 'supplier').length;
    const admins = users.filter((u) => u.role === 'admin').length;

    return {
      total: users.length,
      buyers,
      suppliers,
      admins,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
      suspended: users.filter((u) => u.status === 'suspended').length,
    };
  }, [users]);

  const getRoleBadge = (role: string) => {
    if (role === 'buyer_individual') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Buyer Individual
        </Badge>
      );
    }

    if (role === 'buyer_company') {
      return (
        <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
          Buyer Company
        </Badge>
      );
    }

    if (role === 'buyer_establishment') {
      return (
        <Badge variant="secondary" className="bg-sky-100 text-sky-800">
          Buyer Establishment
        </Badge>
      );
    }

    if (role === 'supplier') {
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Supplier
        </Badge>
      );
    }

    if (role === 'admin') {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Admin
        </Badge>
      );
    }

    return <Badge variant="outline">{getDisplayRole(role)}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inactive
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Suspended
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const buyerPercentage =
    stats.total > 0 ? Math.round((stats.buyers / stats.total) * 100) : 0;

  const supplierPercentage =
    stats.total > 0 ? Math.round((stats.suppliers / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-56 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-8 w-16 rounded bg-gray-200" />
                    <div className="h-3 w-32 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 rounded bg-gray-200" />
                <div className="h-64 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-[#0F2854]">User Management</h1>
            <p className="text-[#6B7280]">
              Manage all users with full administrative privileges
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => loadUsers('refresh')}
            disabled={isRefreshing}
            className="w-full md:w-auto"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {pageError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{pageError}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{stats.total}</div>
              <p className="mt-1 text-xs text-[#6B7280]">
                {stats.active} active • {stats.inactive} inactive • {stats.suspended} suspended
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <Building2 className="h-4 w-4" />
                Buyers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.buyers}</div>
              <p className="mt-1 text-xs text-[#6B7280]">{buyerPercentage}% of total users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <Building2 className="h-4 w-4" />
                Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.suppliers}</div>
              <p className="mt-1 text-xs text-[#6B7280]">{supplierPercentage}% of total users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <ShieldCheck className="h-4 w-4" />
                Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
              <p className="mt-1 text-xs text-[#6B7280]">Platform administrators</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search by name, email, company, phone, city, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserFilterRole)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as UserStatus)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-[#6B7280]">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-[#111827]">{user.name}</div>
                            <div className="text-sm text-[#6B7280]">{user.email}</div>
                            <div className="text-xs text-[#9CA3AF]">{user.phone || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-[#6B7280]">{user.company || '-'}</TableCell>
                        <TableCell className="text-[#6B7280]">{user.city || '-'}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-sm text-[#6B7280]">
                          {formatDate(user.joinedDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusToggle(user.id)}
                              title="Toggle user status"
                            >
                              Toggle Status
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and administrative settings
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={editForm.company}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, company: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => {
                      const nextRole = value as ApiUserRole;

                      setEditForm((prev) => ({
                        ...prev,
                        role: nextRole,
                        buyer_type: isBuyerRole(nextRole)
                          ? getBuyerTypeFromRole(nextRole)
                          : '',
                        permissions: nextRole === 'admin' ? prev.permissions : [],
                      }));
                    }}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer_individual">Buyer Individual</SelectItem>
                      <SelectItem value="buyer_company">Buyer Company</SelectItem>
                      <SelectItem value="buyer_establishment">Buyer Establishment</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isBuyerRole(editForm.role) && (
                  <div className="space-y-2">
                    <Label htmlFor="buyer_type">Buyer Type</Label>
                    <Select
                      value={editForm.buyer_type}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({ ...prev, buyer_type: value }))
                      }
                    >
                      <SelectTrigger id="buyer_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="establishment">Establishment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editForm.role === 'admin' && (
                <div className="space-y-3">
                  <Label>Admin Permissions</Label>
                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] p-4 md:grid-cols-2">
                    {ADMIN_PERMISSION_OPTIONS.map((permission) => {
                      const checked = editForm.permissions.includes(permission);

                      return (
                        <label
                          key={permission}
                          className="flex items-center gap-2 text-sm text-[#111827]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setEditForm((prev) => ({
                                ...prev,
                                permissions: e.target.checked
                                  ? [...prev.permissions, permission]
                                  : prev.permissions.filter((item) => item !== permission),
                              }));
                            }}
                          />
                          <span>{permission}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}