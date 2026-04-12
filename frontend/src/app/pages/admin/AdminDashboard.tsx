import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Users,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
  Loader2,
  Package,
  FileText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';
import {
  API_BASE_URL,
  getAdminAnalytics,
  getAdminProducts,
  getAdminSuppliers,
} from '../../lib/api';

type AdminAnalytics = {
  summary: {
    total_users: number;
    total_buyers: number;
    total_suppliers: number;
    total_admins: number;
    total_products: number;
    approved_products: number;
    pending_products: number;
    rejected_products: number;
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    shipped_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_rfqs: number;
    pending_rfqs: number;
    quoted_rfqs: number;
    accepted_rfqs: number;
    rejected_rfqs: number;
    total_sales: string;
  };
  orders_by_status: Array<{
    status?: string;
    count: number;
  }>;
  rfqs_by_status: Array<{
    status?: string;
    count: number;
  }>;
  products_by_category: Array<{
    category?: string;
    count: number;
  }>;
  latest_orders: Array<{
    id: number;
    buyer: string;
    total: string;
    status: string;
    date: string;
  }>;
  latest_rfqs: Array<{
    id: number;
    product_name: string;
    buyer: string;
    supplier: string;
    quantity: number;
    status: string;
    date: string;
  }>;
};

type AdminSupplier = {
  id: string;
  name: string;
  city: string;
  company: string;
  image: string;
  status: string;
};

type AdminProduct = {
  id: string;
  name: string;
  supplierName: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
};

function getAccessToken() {
  return localStorage.getItem('access') || '';
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
    const message = data?.detail || data?.message || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

function normalizeSupplier(apiUser: any): AdminSupplier {
  const firstName = String(apiUser?.first_name || '').trim();
  const lastName = String(apiUser?.last_name || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: String(apiUser?.id ?? ''),
    name: fullName || String(apiUser?.company || apiUser?.username || 'Supplier'),
    city: String(apiUser?.city || '-'),
    company: String(apiUser?.company || ''),
    image: '',
    status: String(apiUser?.status || 'pending'),
  };
}

function normalizeProduct(apiProduct: any): AdminProduct {
  return {
    id: String(apiProduct?.id ?? ''),
    name: String(apiProduct?.name || 'Product'),
    supplierName: String(apiProduct?.supplier_name || apiProduct?.supplierName || 'Supplier'),
    image: String(apiProduct?.image || ''),
    status: String(apiProduct?.status || 'pending') as 'pending' | 'approved' | 'rejected',
  };
}

function formatCurrency(value: string | number) {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

function formatStatusLabel(value?: string) {
  if (!value) return 'Unknown';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

async function approveSupplier(supplierId: string) {
  const data = await apiRequest(`/admin/suppliers/${supplierId}/approve/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeSupplier(data?.user || {});
}

async function rejectSupplier(supplierId: string) {
  const data = await apiRequest(`/admin/suppliers/${supplierId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeSupplier(data?.user || {});
}

async function approveProduct(productId: string) {
  const data = await apiRequest(`/admin/products/${productId}/approve/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeProduct(data?.product || {});
}

async function rejectProduct(productId: string) {
  const data = await apiRequest(`/admin/products/${productId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeProduct(data?.product || {});
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setPageError('');

        const [analyticsData, suppliersData, productsData] = await Promise.all([
          getAdminAnalytics(),
          getAdminSuppliers(),
          getAdminProducts(),
        ]);

        setAnalytics(analyticsData as AdminAnalytics);
        setSuppliers((suppliersData || []).map(normalizeSupplier));
        setProducts((productsData || []).map(normalizeProduct));
      } catch (error: any) {
        console.error('Failed to load admin dashboard:', error);
        setPageError(error?.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const pendingSuppliers = useMemo(() => {
    return suppliers
      .filter((supplier) => {
        const status = supplier.status.toLowerCase();
        return status !== 'approved' && status !== 'active';
      })
      .slice(0, 3);
  }, [suppliers]);

  const pendingProducts = useMemo(() => {
    return products.filter((product) => product.status === 'pending').slice(0, 3);
  }, [products]);

  const summary = analytics?.summary;
  const totalUsers = summary?.total_users ?? 0;
  const totalSuppliers = summary?.total_suppliers ?? 0;
  const totalSales = Number(summary?.total_sales ?? 0);
  const totalProducts = summary?.total_products ?? 0;
  const totalOrders = summary?.total_orders ?? 0;
  const totalRFQs = summary?.total_rfqs ?? 0;
  const pendingApprovals =
    (summary?.pending_products ?? 0) + pendingSuppliers.length;

  const quickStats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered accounts across the platform',
    },
    {
      title: 'Total Suppliers',
      value: totalSuppliers.toLocaleString(),
      icon: Award,
      description: 'Approved and pending supplier accounts',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.toLocaleString(),
      icon: Clock,
      description: 'Suppliers and products awaiting review',
    },
    {
      title: 'Total Sales',
      value: formatCurrency(totalSales),
      icon: TrendingUp,
      description: 'Non-cancelled order volume',
    },
  ];

  const overviewStats = [
    {
      title: 'Products',
      value: totalProducts.toLocaleString(),
      sub: `${summary?.approved_products ?? 0} approved`,
      icon: Package,
    },
    {
      title: 'Orders',
      value: totalOrders.toLocaleString(),
      sub: `${summary?.completed_orders ?? 0} completed`,
      icon: ShieldCheck,
    },
    {
      title: 'RFQs',
      value: totalRFQs.toLocaleString(),
      sub: `${summary?.pending_rfqs ?? 0} pending`,
      icon: FileText,
    },
  ];

  const handleApproveSupplier = async (supplierId: string) => {
    const supplier = suppliers.find((item) => item.id === supplierId);

    try {
      setProcessingId(`supplier-${supplierId}`);
      const updatedSupplier = await approveSupplier(supplierId);

      setSuppliers((prev) =>
        prev.map((item) => (item.id === supplierId ? updatedSupplier : item))
      );

      toast.success(`"${supplier?.name}" has been approved successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve supplier');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSupplier = async (supplierId: string) => {
    const supplier = suppliers.find((item) => item.id === supplierId);

    try {
      setProcessingId(`supplier-${supplierId}`);
      const updatedSupplier = await rejectSupplier(supplierId);

      setSuppliers((prev) =>
        prev.map((item) => (item.id === supplierId ? updatedSupplier : item))
      );

      toast.error(`"${supplier?.name}" has been rejected`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject supplier');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    const product = products.find((item) => item.id === productId);

    try {
      setProcessingId(`product-${productId}`);
      const updatedProduct = await approveProduct(productId);

      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? updatedProduct : item))
      );

      toast.success(`"${product?.name}" has been approved successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve product');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    const product = products.find((item) => item.id === productId);

    try {
      setProcessingId(`product-${productId}`);
      const updatedProduct = await rejectProduct(productId);

      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? updatedProduct : item))
      );

      toast.error(`"${product?.name}" has been rejected`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject product');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-56 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-8 w-20 rounded bg-gray-200" />
                    <div className="h-3 w-32 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <Card key={item} className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-5 w-40 rounded bg-gray-200" />
                    <div className="h-16 rounded bg-gray-200" />
                    <div className="h-16 rounded bg-gray-200" />
                    <div className="h-16 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0F2854] via-[#1C4D8D] to-[#4988C4] p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#D9ECF7]">
                Steel Platform
              </div>
              <h1 className="text-3xl font-bold">Admin Command Center</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#EAF4FB]">
                Review platform activity, approve marketplace submissions, and monitor
                operational performance from one unified control panel.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate('/admin/analytics')}
                className="border-0 bg-white text-[#0F2854] hover:bg-[#EAF4FB]"
              >
                View Analytics
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Manage Users
              </Button>
            </div>
          </div>
        </div>

        {pageError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {pageError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.title} className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium text-[#6B7280]">
                      {stat.title}
                    </CardTitle>
                  </div>
                  <div className="rounded-xl bg-[#EAF4FB] p-2.5">
                    <Icon className="h-5 w-5 text-[#1C4D8D]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#111827]">{stat.value}</div>
                  <p className="mt-2 text-sm text-[#6B7280]">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {overviewStats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <div className="text-sm font-medium text-[#6B7280]">{item.title}</div>
                    <div className="mt-2 text-3xl font-bold text-[#0F2854]">{item.value}</div>
                    <div className="mt-1 text-sm text-[#6B7280]">{item.sub}</div>
                  </div>
                  <div className="rounded-2xl bg-[#F0F7FC] p-4">
                    <Icon className="h-7 w-7 text-[#1C4D8D]" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#111827]">Pending Supplier Approvals</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => navigate('/admin/suppliers')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {pendingSuppliers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D1D9E6] bg-[#FAFCFE] py-10 text-center text-[#6B7280]">
                  No pending supplier approvals.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSuppliers.map((supplier) => {
                    const isProcessing = processingId === `supplier-${supplier.id}`;

                    return (
                      <div
                        key={supplier.id}
                        className="rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:shadow-sm"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FB] font-semibold text-[#0F2854]">
                              SUP
                            </div>

                            <div>
                              <div className="font-semibold text-[#111827]">
                                {supplier.company || supplier.name}
                              </div>
                              <div className="mt-1 text-sm text-[#6B7280]">
                                {supplier.city}
                              </div>
                              <Badge className="mt-2 border-0 bg-[#FFF4E5] text-[#9A6700] hover:bg-[#FFF4E5]">
                                {formatStatusLabel(supplier.status)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="rounded-xl bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveSupplier(supplier.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectSupplier(supplier.id)}
                              disabled={isProcessing}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#111827]">Product Review Queue</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => navigate('/admin/products')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {pendingProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D1D9E6] bg-[#FAFCFE] py-10 text-center text-[#6B7280]">
                  No pending products in review queue.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProducts.map((product) => {
                    const isProcessing = processingId === `product-${product.id}`;

                    return (
                      <div
                        key={product.id}
                        className="rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:shadow-sm"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-center gap-4">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-14 w-14 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FB] font-semibold text-[#0F2854]">
                                IMG
                              </div>
                            )}

                            <div>
                              <div className="font-semibold text-[#111827]">
                                {product.name}
                              </div>
                              <div className="mt-1 text-sm text-[#6B7280]">
                                {product.supplierName}
                              </div>
                              <Badge className="mt-2 border-0 bg-[#EEF4FF] text-[#1C4D8D] hover:bg-[#EEF4FF]">
                                {formatStatusLabel(product.status)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="rounded-xl bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveProduct(product.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectProduct(product.id)}
                              disabled={isProcessing}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#111827]">Latest Orders</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-[#1C4D8D]"
                  onClick={() => navigate('/admin/orders')}
                >
                  Open Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {analytics?.latest_orders?.length ? (
                <div className="space-y-3">
                  {analytics.latest_orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-2xl border border-[#EEF2F7] p-4"
                    >
                      <div>
                        <div className="font-semibold text-[#111827]">Order #{order.id}</div>
                        <div className="mt-1 text-sm text-[#6B7280]">{order.buyer}</div>
                        <div className="mt-1 text-xs text-[#94A3B8]">{order.date}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-[#0F2854]">
                          {formatCurrency(order.total)}
                        </div>
                        <Badge variant="outline" className="mt-2 rounded-full">
                          {formatStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D1D9E6] bg-[#FAFCFE] py-10 text-center text-[#6B7280]">
                  No recent orders found.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#111827]">Latest RFQs</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-[#1C4D8D]"
                  onClick={() => navigate('/admin/rfqs')}
                >
                  Open RFQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {analytics?.latest_rfqs?.length ? (
                <div className="space-y-3">
                  {analytics.latest_rfqs.slice(0, 4).map((rfq) => (
                    <div
                      key={rfq.id}
                      className="rounded-2xl border border-[#EEF2F7] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-[#111827]">RFQ #{rfq.id}</div>
                          <div className="mt-1 text-sm text-[#111827]">{rfq.product_name}</div>
                          <div className="mt-1 text-sm text-[#6B7280]">Buyer: {rfq.buyer}</div>
                          <div className="mt-1 text-xs text-[#94A3B8]">{rfq.date}</div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-[#0F2854]">
                            Qty: {rfq.quantity}
                          </div>
                          <Badge variant="outline" className="mt-2 rounded-full">
                            {formatStatusLabel(rfq.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D1D9E6] bg-[#FAFCFE] py-10 text-center text-[#6B7280]">
                  No recent RFQs found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}