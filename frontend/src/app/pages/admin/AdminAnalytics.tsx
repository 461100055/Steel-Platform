import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import {
  Package,
  ShoppingBag,
  FileText,
  Users,
  Building2,
  DollarSign,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAdminAnalytics, AdminAnalyticsResponse } from '../../lib/api';

const STATUS_COLORS = ['#0F2854', '#1C4D8D', '#4988C4', '#76A9D5', '#BDE8F5'];

function formatCurrency(value: string | number) {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(numberValue);
}

function getStatusBadgeVariant(status: string) {
  const normalized = String(status || '').toLowerCase();

  if (
    normalized === 'completed' ||
    normalized === 'approved' ||
    normalized === 'confirmed' ||
    normalized === 'accepted'
  ) {
    return 'default';
  }

  if (normalized === 'pending' || normalized === 'quoted' || normalized === 'shipped') {
    return 'secondary';
  }

  if (normalized === 'cancelled' || normalized === 'rejected') {
    return 'destructive';
  }

  return 'outline';
}

function formatStatusLabel(value?: string) {
  if (!value) return 'Unknown';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminAnalytics();
        setData(response);
      } catch (err: any) {
        setError(err?.message || 'Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) return [];

    return [
      {
        title: 'Total Products',
        value: data.summary.total_products,
        icon: Package,
        description: 'All listed products in the platform',
      },
      {
        title: 'Total Orders',
        value: data.summary.total_orders,
        icon: ShoppingBag,
        description: 'Orders across all buyers and suppliers',
      },
      {
        title: 'Total RFQs',
        value: data.summary.total_rfqs,
        icon: FileText,
        description: 'Quotation requests submitted on the platform',
      },
      {
        title: 'Total Suppliers',
        value: data.summary.total_suppliers,
        icon: Building2,
        description: 'Registered supplier accounts',
      },
      {
        title: 'Total Buyers',
        value: data.summary.total_buyers,
        icon: Users,
        description: 'Registered buyer accounts',
      },
      {
        title: 'Total Sales',
        value: formatCurrency(data.summary.total_sales),
        icon: DollarSign,
        description: 'Sum of non-cancelled orders',
      },
    ];
  }, [data]);

  const overviewItems = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: 'Total Users',
        value: data.summary.total_users,
      },
      {
        label: 'Total Admins',
        value: data.summary.total_admins,
      },
      {
        label: 'Approved Products',
        value: data.summary.approved_products,
      },
      {
        label: 'Pending Products',
        value: data.summary.pending_products,
      },
      {
        label: 'Completed Orders',
        value: data.summary.completed_orders,
      },
      {
        label: 'Pending RFQs',
        value: data.summary.pending_rfqs,
      },
      {
        label: 'Rejected RFQs',
        value: data.summary.rejected_rfqs,
      },
      {
        label: 'Cancelled Orders',
        value: data.summary.cancelled_orders,
      },
    ];
  }, [data]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Analytics</h1>
          <p className="text-muted-foreground">
            Real-time platform insights powered by the backend database.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analytics Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-40 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-24 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Card key={card.title}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{card.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                  <CardDescription>Distribution of order lifecycle states</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.orders_by_status}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" tickFormatter={formatStatusLabel} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [value, 'Count']} labelFormatter={formatStatusLabel} />
                        <Bar dataKey="count" fill="#1C4D8D" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RFQs by Status</CardTitle>
                  <CardDescription>Current RFQ progression across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.rfqs_by_status}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={({ name, value }) => `${formatStatusLabel(String(name))}: ${value}`}
                        >
                          {data.rfqs_by_status.map((_, index) => (
                            <Cell
                              key={`rfq-cell-${index}`}
                              fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Products by Category</CardTitle>
                  <CardDescription>Top product categories in the marketplace</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.products_by_category}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [value, 'Count']} />
                        <Bar dataKey="count" fill="#4988C4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                  <CardDescription>Quick operational snapshot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Revenue</span>
                    </div>
                    <span className="text-lg font-semibold">
                      {formatCurrency(data.summary.total_sales)}
                    </span>
                  </div>

                  {overviewItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-lg font-semibold">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Latest Orders</CardTitle>
                  <CardDescription>Most recent orders submitted to the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.latest_orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent orders found.</p>
                  ) : (
                    data.latest_orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">Buyer: {order.buyer}</p>
                          <p className="text-sm text-muted-foreground">Date: {order.date}</p>
                        </div>

                        <div className="text-right space-y-2">
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                          <Badge variant={getStatusBadgeVariant(order.status) as any}>
                            {formatStatusLabel(order.status)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latest RFQs</CardTitle>
                  <CardDescription>Most recent quotation requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.latest_rfqs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent RFQs found.</p>
                  ) : (
                    data.latest_rfqs.map((rfq) => (
                      <div
                        key={rfq.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">RFQ #{rfq.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Product: {rfq.product_name}
                          </p>
                          <p className="text-sm text-muted-foreground">Buyer: {rfq.buyer}</p>
                          <p className="text-sm text-muted-foreground">
                            Supplier: {rfq.supplier}
                          </p>
                          <p className="text-sm text-muted-foreground">Date: {rfq.date}</p>
                        </div>

                        <div className="text-right space-y-2">
                          <p className="font-semibold">Qty: {rfq.quantity}</p>
                          <Badge variant={getStatusBadgeVariant(rfq.status) as any}>
                            {formatStatusLabel(rfq.status)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}