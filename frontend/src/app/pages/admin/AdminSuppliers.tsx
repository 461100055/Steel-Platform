import { useEffect, useMemo, useState } from 'react';
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
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Building2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';
import { API_BASE_URL, getAdminSuppliers } from '../../lib/api';

type SupplierStatusFilter =
  | 'all'
  | 'active'
  | 'inactive'
  | 'approved'
  | 'rejected'
  | 'suspended';

type SupplierStatus =
  | 'active'
  | 'inactive'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'pending';

type AdminSupplier = {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  phone: string;
  status: SupplierStatus;
  joinedDate: string;
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

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const method = String(options.method || 'GET').toUpperCase();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(method !== 'GET' && method !== 'DELETE' && !isFormData
        ? { 'Content-Type': 'application/json' }
        : {}),
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

function normalizeSupplier(apiUser: any): AdminSupplier {
  const firstName = String(apiUser?.first_name || '').trim();
  const lastName = String(apiUser?.last_name || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const company = String(apiUser?.company || '').trim();
  const username = String(apiUser?.username || '').trim();
  const email = String(apiUser?.email || '').trim();

  return {
    id: String(apiUser?.id ?? ''),
    name: fullName || company || username || email || 'Supplier',
    email,
    company,
    city: String(apiUser?.city || ''),
    phone: String(apiUser?.phone || ''),
    status: String(apiUser?.status || 'pending').toLowerCase() as SupplierStatus,
    joinedDate: String(apiUser?.joined_date || apiUser?.date_joined || ''),
  };
}

async function approveSupplier(supplierId: string) {
  const data = await apiRequest(`/admin/suppliers/${supplierId}/approve/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeSupplier(data?.user || data);
}

async function rejectSupplier(supplierId: string) {
  const data = await apiRequest(`/admin/suppliers/${supplierId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeSupplier(data?.user || data);
}

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupplierStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setIsLoading(true);
        setPageError('');
        const data = await getAdminSuppliers();
        setSuppliers((data || []).map(normalizeSupplier));
      } catch (error: any) {
        console.error('Failed to load suppliers:', error);
        setPageError(error?.message || 'Failed to load suppliers.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  const handleApprove = async (supplierId: string) => {
    const supplier = suppliers.find((item) => item.id === supplierId);

    try {
      setProcessingId(supplierId);
      const updatedSupplier = await approveSupplier(supplierId);

      setSuppliers((prev) =>
        prev.map((item) => (item.id === supplierId ? updatedSupplier : item))
      );

      toast.success(`"${supplier?.company || supplier?.name}" has been approved successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve supplier');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (supplierId: string) => {
    const supplier = suppliers.find((item) => item.id === supplierId);

    try {
      setProcessingId(supplierId);
      const updatedSupplier = await rejectSupplier(supplierId);

      setSuppliers((prev) =>
        prev.map((item) => (item.id === supplierId ? updatedSupplier : item))
      );

      toast.error(`"${supplier?.company || supplier?.name}" has been rejected`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject supplier');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        supplier.name.toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query) ||
        supplier.company.toLowerCase().includes(query) ||
        supplier.city.toLowerCase().includes(query) ||
        supplier.phone.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: suppliers.length,
      approved: suppliers.filter((item) => item.status === 'approved').length,
      active: suppliers.filter((item) => item.status === 'active').length,
      pending: suppliers.filter(
        (item) => !['approved', 'active', 'rejected'].includes(item.status)
      ).length,
      rejected: suppliers.filter((item) => item.status === 'rejected').length,
    };
  }, [suppliers]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inactive
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-60 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-8 w-16 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 animate-pulse">
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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#0F2854]">Supplier Management</h1>
          <p className="text-[#6B7280]">
            Review, approve, and manage supplier accounts on the platform
          </p>
        </div>

        {pageError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {pageError}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">
                Total Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search by supplier name, company, email, city, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as SupplierStatusFilter)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-[#6B7280]">
                        No suppliers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => {
                      const isProcessing = processingId === supplier.id;
                      const isPendingLike = !['approved', 'active', 'rejected'].includes(
                        supplier.status
                      );

                      return (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E5E7EB] text-[#6B7280]">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium text-[#111827]">{supplier.name}</div>
                                <div className="text-sm text-[#6B7280]">{supplier.email}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {supplier.company || '-'}
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {supplier.city || '-'}
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {supplier.phone || '-'}
                          </TableCell>

                          <TableCell>{getStatusBadge(supplier.status)}</TableCell>

                          <TableCell className="text-[#6B7280]">
                            {formatDate(supplier.joinedDate)}
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {isPendingLike && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(supplier.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                    title="Approve supplier"
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(supplier.id)}
                                    className="text-red-600 hover:bg-red-50"
                                    title="Reject supplier"
                                    disabled={isProcessing}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              {!isPendingLike && supplier.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(supplier.id)}
                                  className="text-red-600 hover:bg-red-50"
                                  title="Reject supplier"
                                  disabled={isProcessing}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {supplier.status === 'rejected' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(supplier.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                  title="Approve supplier"
                                  disabled={isProcessing}
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supplier Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.total}</div>
                <div className="text-[#6B7280]">Registered Suppliers</div>
                <Badge variant="secondary" className="mt-2">
                  Marketplace
                </Badge>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.approved}</div>
                <div className="text-[#6B7280]">Approved Suppliers</div>
                <Badge variant="secondary" className="mt-2">
                  Verified
                </Badge>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.pending}</div>
                <div className="text-[#6B7280]">Awaiting Review</div>
                <Badge variant="secondary" className="mt-2">
                  Pending
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}