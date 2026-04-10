import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';

type RFQStatusFilter =
  | 'all'
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'rejected';

type RFQStatus =
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'rejected';

type AdminRFQ = {
  id: string;
  buyerName: string;
  supplierName: string;
  productName: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  status: RFQStatus;
  requiredDate: string;
  createdAt: string;
};

const API_BASE_URL =
  ((import.meta as any)?.env?.VITE_API_URL as string) || 'http://127.0.0.1:8000/api';

function getAccessToken() {
  return localStorage.getItem('access') || '';
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
    const message = data?.detail || data?.message || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

function normalizeRFQ(apiRFQ: any): AdminRFQ {
  const quantity = Number(apiRFQ?.quantity ?? 0);
  const targetPrice = Number(apiRFQ?.target_price ?? 0);

  return {
    id: String(apiRFQ?.id ?? ''),
    buyerName: String(apiRFQ?.buyer_name || 'Buyer'),
    supplierName: String(apiRFQ?.supplier_name || 'Supplier'),
    productName: String(apiRFQ?.product_name || 'Product'),
    quantity: Number.isFinite(quantity) ? quantity : 0,
    unit: String(apiRFQ?.unit || 'unit'),
    targetPrice: Number.isFinite(targetPrice) ? targetPrice : 0,
    status: String(apiRFQ?.status || 'pending').toLowerCase() as RFQStatus,
    requiredDate: String(apiRFQ?.required_date || ''),
    createdAt: String(apiRFQ?.created_at || ''),
  };
}

async function getAdminRFQs() {
  const data = await apiRequest('/admin/rfqs/');
  return Array.isArray(data) ? data.map(normalizeRFQ) : [];
}

async function updateAdminRFQ(
  rfqId: string,
  payload: {
    status?: string;
    supplier?: string | null;
    target_price?: number;
    required_date?: string | null;
  }
) {
  const data = await apiRequest(`/admin/rfqs/${rfqId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeRFQ(data);
}

export default function AdminRFQs() {
  const [rfqs, setRfqs] = useState<AdminRFQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RFQStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadRFQs = async () => {
      try {
        setIsLoading(true);
        setPageError('');
        const data = await getAdminRFQs();
        setRfqs(data);
      } catch (error: any) {
        console.error('Failed to load RFQs:', error);
        setPageError(error?.message || 'Failed to load RFQs.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRFQs();
  }, []);

  const handleStatusChange = async (rfqId: string, newStatus: RFQStatus) => {
    const rfq = rfqs.find((item) => item.id === rfqId);

    try {
      setProcessingId(rfqId);
      const updatedRFQ = await updateAdminRFQ(rfqId, { status: newStatus });

      setRfqs((prev) =>
        prev.map((item) => (item.id === rfqId ? updatedRFQ : item))
      );

      toast.success(`RFQ "${rfq?.productName}" updated to "${newStatus}"`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update RFQ');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRFQs = useMemo(() => {
    return rfqs.filter((rfq) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        rfq.productName.toLowerCase().includes(query) ||
        rfq.buyerName.toLowerCase().includes(query) ||
        rfq.supplierName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || rfq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rfqs, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: rfqs.length,
      pending: rfqs.filter((item) => item.status === 'pending').length,
      quoted: rfqs.filter((item) => item.status === 'quoted').length,
      accepted: rfqs.filter((item) => item.status === 'accepted').length,
      rejected: rfqs.filter((item) => item.status === 'rejected').length,
    };
  }, [rfqs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case 'quoted':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Quoted
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <div className="h-10 w-56 animate-pulse rounded bg-gray-200" />
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
          <h1 className="mb-2 text-3xl font-bold text-[#0F2854]">RFQ Management</h1>
          <p className="text-[#6B7280]">
            Review and manage all request-for-quotation records
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
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <FileText className="h-4 w-4" />
                Total RFQs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <CheckCircle className="h-4 w-4" />
                Accepted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <XCircle className="h-4 w-4" />
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
                  placeholder="Search by product, buyer, or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as RFQStatusFilter)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RFQs ({filteredRFQs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Target Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Required Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRFQs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-[#6B7280]">
                        No RFQs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRFQs.map((rfq) => {
                      const isProcessing = processingId === rfq.id;

                      return (
                        <TableRow key={rfq.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-[#111827]">
                                {rfq.productName}
                              </div>
                              <div className="text-xs text-[#9CA3AF]">
                                Created: {formatDate(rfq.createdAt)}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {rfq.buyerName}
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {rfq.supplierName}
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {rfq.quantity} {rfq.unit}
                          </TableCell>

                          <TableCell className="font-medium text-[#111827]">
                            {rfq.targetPrice.toLocaleString()} SAR
                          </TableCell>

                          <TableCell>{getStatusBadge(rfq.status)}</TableCell>

                          <TableCell className="text-[#6B7280]">
                            {formatDate(rfq.requiredDate)}
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end">
                              <Select
                                value={rfq.status}
                                onValueChange={(value) =>
                                  handleStatusChange(rfq.id, value as RFQStatus)
                                }
                                disabled={isProcessing}
                              >
                                <SelectTrigger className="h-9 w-[150px]">
                                  {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Updating...</span>
                                    </div>
                                  ) : (
                                    <SelectValue />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="quoted">Quoted</SelectItem>
                                  <SelectItem value="accepted">Accepted</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
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
            <CardTitle>RFQ Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.quoted}</div>
                <div className="text-[#6B7280]">Quoted RFQs</div>
                <Badge variant="secondary" className="mt-2">
                  In Progress
                </Badge>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.accepted}</div>
                <div className="text-[#6B7280]">Accepted RFQs</div>
                <Badge variant="secondary" className="mt-2">
                  Approved
                </Badge>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.rejected}</div>
                <div className="text-[#6B7280]">Rejected RFQs</div>
                <Badge variant="secondary" className="mt-2">
                  Closed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}