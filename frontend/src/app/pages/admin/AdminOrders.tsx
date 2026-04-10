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
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';

type OrderStatusFilter =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled';

type AdminOrder = {
  id: string;
  orderNumber: string;
  buyerName: string;
  supplierName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  itemsCount: number;
  notes: string;
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

function normalizeOrder(apiOrder: any): AdminOrder {
  const total = Number(
    apiOrder?.total_price ?? apiOrder?.total ?? apiOrder?.total_amount ?? 0
  );

  const itemsCount = Array.isArray(apiOrder?.items) ? apiOrder.items.length : 0;

  return {
    id: String(apiOrder?.id ?? ''),
    orderNumber: String(
      apiOrder?.order_number || apiOrder?.orderNumber || `ORD-${apiOrder?.id ?? ''}`
    ),
    buyerName: String(
      apiOrder?.buyer_name ||
        apiOrder?.buyerName ||
        apiOrder?.buyer_email ||
        `Buyer #${apiOrder?.buyer ?? '-'}`
    ),
    supplierName: String(apiOrder?.supplier_name || apiOrder?.supplierName || 'Supplier'),
    total: Number.isFinite(total) ? total : 0,
    status: String(apiOrder?.status || 'pending').toLowerCase() as OrderStatus,
    createdAt: String(apiOrder?.created_at || ''),
    itemsCount,
    notes: String(apiOrder?.notes || ''),
  };
}

async function getAdminOrders() {
  const data = await apiRequest('/admin/orders/');
  return Array.isArray(data) ? data.map(normalizeOrder) : [];
}

async function updateAdminOrder(orderId: string, payload: { status?: string; notes?: string }) {
  const data = await apiRequest(`/admin/orders/${orderId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeOrder(data);
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setPageError('');
        const data = await getAdminOrders();
        setOrders(data);
      } catch (error: any) {
        console.error('Failed to load orders:', error);
        setPageError(error?.message || 'Failed to load orders.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((item) => item.id === orderId);

    try {
      setProcessingId(orderId);
      const updatedOrder = await updateAdminOrder(orderId, { status: newStatus });

      setOrders((prev) =>
        prev.map((item) => (item.id === orderId ? updatedOrder : item))
      );

      toast.success(`Order "${order?.orderNumber}" updated to "${newStatus}"`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update order status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        order.orderNumber.toLowerCase().includes(query) ||
        order.buyerName.toLowerCase().includes(query) ||
        order.supplierName.toLowerCase().includes(query) ||
        order.notes.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((item) => item.status === 'pending').length,
      confirmed: orders.filter((item) => item.status === 'confirmed').length,
      shipped: orders.filter((item) => item.status === 'shipped').length,
      completed: orders.filter((item) => item.status === 'completed').length,
      cancelled: orders.filter((item) => item.status === 'cancelled').length,
    };
  }, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Confirmed
          </Badge>
        );
      case 'shipped':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Shipped
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Cancelled
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
          <h1 className="mb-2 text-3xl font-bold text-[#0F2854]">Order Management</h1>
          <p className="text-[#6B7280]">
            Review and update all marketplace orders
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
                <Package className="h-4 w-4" />
                Total Orders
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
                <Truck className="h-4 w-4" />
                Shipped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search by order number, buyer, supplier, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatusFilter)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-[#6B7280]">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const isProcessing = processingId === order.id;

                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-[#111827]">
                                {order.orderNumber}
                              </div>
                              <div className="text-xs text-[#9CA3AF]">
                                {order.notes || 'No notes'}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {order.buyerName}
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {order.supplierName}
                          </TableCell>

                          <TableCell className="font-medium text-[#111827]">
                            {order.total.toLocaleString()} SAR
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {order.itemsCount}
                          </TableCell>

                          <TableCell>{getStatusBadge(order.status)}</TableCell>

                          <TableCell className="text-[#6B7280]">
                            {formatDate(order.createdAt)}
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end">
                              <Select
                                value={order.status}
                                onValueChange={(value) =>
                                  handleStatusChange(order.id, value as OrderStatus)
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
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <CardTitle>Order Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.confirmed}</div>
                <div className="text-[#6B7280]">Confirmed Orders</div>
                <Badge variant="secondary" className="mt-2">
                  Processing
                </Badge>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.shipped}</div>
                <div className="text-[#6B7280]">Shipped Orders</div>
                <Badge variant="secondary" className="mt-2">
                  In Transit
                </Badge>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-[#0F2854]">{stats.cancelled}</div>
                <div className="text-[#6B7280]">Cancelled Orders</div>
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