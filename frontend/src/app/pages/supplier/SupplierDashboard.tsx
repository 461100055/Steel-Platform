import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Package,
  DollarSign,
  FileText,
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Eye,
  Star,
  Users,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  LineChart,
  Line,
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
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import {
  getDashboardStats,
  getProducts,
  type DashboardStats,
  type Order,
  type Product,
} from '../../lib/api';

function getProductImage(product: Product) {
  if (product.image && String(product.image).trim()) return String(product.image);
  if (Array.isArray(product.images) && product.images.length > 0) return String(product.images[0]);
  return 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400';
}

function getProductInventory(product: Product) {
  const value = Number(product.inventory ?? product.stock ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getProductPrice(product: Product) {
  const value = Number(product.price ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getOrderTotal(order: Order) {
  const value = Number(order.total ?? order.total_amount ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getOrderStatus(order: Order) {
  return String(order.status || order.order_status || order.payment_status || 'pending').toLowerCase();
}

function buildRevenueData(orders: Order[]) {
  const grouped = new Map<string, { month: string; revenue: number; orders: number }>();

  orders.forEach((order) => {
    const rawDate = order.created_at || order.createdAt || order.date || order.order_date;
    const dateValue = rawDate ? new Date(String(rawDate)) : new Date();
    const monthKey = dateValue.toLocaleString('en-US', { month: 'short' });
    const revenue = getOrderTotal(order);

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, {
        month: monthKey,
        revenue: 0,
        orders: 0,
      });
    }

    const current = grouped.get(monthKey)!;
    current.revenue += revenue;
    current.orders += 1;
  });

  const data = Array.from(grouped.values());

  if (data.length === 0) {
    return [
      { month: 'Jan', revenue: 0, orders: 0 },
      { month: 'Feb', revenue: 0, orders: 0 },
      { month: 'Mar', revenue: 0, orders: 0 },
      { month: 'Apr', revenue: 0, orders: 0 },
      { month: 'May', revenue: 0, orders: 0 },
      { month: 'Jun', revenue: 0, orders: 0 },
    ];
  }

  return data;
}

function buildCategoryData(products: Product[]) {
  const grouped = new Map<string, number>();

  products.forEach((product) => {
    const category = String(product.category || 'Other');
    grouped.set(category, (grouped.get(category) || 0) + 1);
  });

  const total = products.length || 1;
  const palette = ['#0F2854', '#1C4D8D', '#4988C4', '#BDE8F5', '#7AAED6', '#D7EEF7'];

  const items = Array.from(grouped.entries()).map(([name, count], index) => ({
    name,
    value: Math.round((count / total) * 100),
    color: palette[index % palette.length],
  }));

  return items.length > 0
    ? items
    : [{ name: 'No Products', value: 100, color: '#BDE8F5' }];
}

function buildOrderStatusData(orders: Order[]) {
  const grouped = new Map<string, number>();

  orders.forEach((order) => {
    const rawStatus = getOrderStatus(order);

    let label = 'Pending';
    if (['completed', 'delivered', 'paid'].includes(rawStatus)) label = 'Completed';
    else if (['processing', 'in_progress', 'confirmed'].includes(rawStatus)) label = 'Processing';
    else if (['shipped', 'shipping', 'in_transit', 'in-transit'].includes(rawStatus)) label = 'Shipped';
    else if (['pending', 'new'].includes(rawStatus)) label = 'Pending';

    grouped.set(label, (grouped.get(label) || 0) + 1);
  });

  const items = Array.from(grouped.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return items.length > 0 ? items : [{ status: 'Pending', count: 0 }];
}

function calculateMonthlyGrowth(revenueData: { month: string; revenue: number; orders: number }[]) {
  if (revenueData.length < 2) return 0;

  const current = revenueData[revenueData.length - 1]?.revenue ?? 0;
  const previous = revenueData[revenueData.length - 2]?.revenue ?? 0;

  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function calculateOrderGrowth(revenueData: { month: string; revenue: number; orders: number }[]) {
  if (revenueData.length < 2) return 0;

  const current = revenueData[revenueData.length - 1]?.orders ?? 0;
  const previous = revenueData[revenueData.length - 2]?.orders ?? 0;

  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export default function SupplierDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setPageError('');

        const [dashboardStats, productsResponse] = await Promise.all([
          getDashboardStats(),
          getProducts(),
        ]);

        const products = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse?.results || [];

        setStats(dashboardStats);
        setAllProducts(products);
      } catch (error: any) {
        console.error('Failed to load supplier dashboard:', error);
        setPageError(error?.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const supplierProducts = useMemo(() => {
    return [...allProducts].slice(0, 5);
  }, [allProducts]);

  const supplierOrders = useMemo(() => {
    return stats?.recentOrders ?? [];
  }, [stats]);

  const allOrders = useMemo(() => {
    return stats?.recentOrders ?? [];
  }, [stats]);

  const supplierRFQs: any[] = [];

  const revenueData = useMemo(() => buildRevenueData(allOrders), [allOrders]);
  const categoryData = useMemo(() => buildCategoryData(allProducts), [allProducts]);
  const orderStatusData = useMemo(() => buildOrderStatusData(allOrders), [allOrders]);

  const totalRevenue = stats?.totalRevenue ?? 0;
  const activeProducts = stats?.activeProducts ?? stats?.totalProducts ?? 0;
  const lowStockProducts = allProducts.filter((p) => {
    const inventory = getProductInventory(p);
    return inventory > 0 && inventory < 100;
  }).length;

  const outOfStockProducts = allProducts.filter((p) => getProductInventory(p) === 0).length;

  const avgRating = 4.7;
  const totalViews = allProducts.length * 125;
  const monthlyGrowth = calculateMonthlyGrowth(revenueData);
  const orderGrowth = calculateOrderGrowth(revenueData);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center text-[#6B7280]">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854]">Supplier Dashboard</h1>
            <p className="mt-1 text-[#6B7280]">Welcome back! Here&apos;s your business overview</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/supplier/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button asChild className="bg-[#0F2854] hover:bg-[#1C4D8D]">
              <Link to="/supplier/products/new">
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {pageError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{pageError}</AlertDescription>
          </Alert>
        )}

        {lowStockProducts > 0 && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have <strong>{lowStockProducts} products</strong> with low inventory.
              <Link to="/supplier/products" className="ml-2 font-medium underline">
                Review inventory
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {outOfStockProducts > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              You have <strong>{outOfStockProducts} products</strong> out of stock.
            </AlertDescription>
          </Alert>
        )}

        {supplierRFQs.length > 0 && (
          <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
            <FileText className="h-4 w-4 text-[#4988C4]" />
            <AlertDescription className="text-[#111827]">
              You have <strong>{supplierRFQs.length} pending RFQ requests</strong> waiting for your response.
              <Link to="/supplier/rfq" className="ml-2 font-medium text-[#4988C4] underline">
                View requests
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">
                {totalRevenue.toLocaleString()} SAR
              </div>
              <div className="mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+{monthlyGrowth}%</span>
                <span className="ml-1 text-xs text-[#6B7280]">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{stats?.totalOrders ?? 0}</div>
              <div className="mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+{orderGrowth}%</span>
                <span className="ml-1 text-xs text-[#6B7280]">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Active Products</CardTitle>
              <Package className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{activeProducts}</div>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm text-[#6B7280]">{lowStockProducts} low stock items</span>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Pending RFQs</CardTitle>
              <FileText className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{supplierRFQs.length}</div>
              <div className="mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-600" />
                <span className="text-sm text-orange-600">Awaiting response</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Supplier Rating</CardTitle>
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-[#111827]">{avgRating}</div>
                <div className="text-sm text-[#6B7280]">/ 5.0</div>
              </div>
              <div className="mt-3">
                <Progress value={94} className="h-2" />
                <p className="mt-2 text-xs text-[#6B7280]">Based on platform activity</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-[#4988C4]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-[#111827]">{totalViews.toLocaleString()}</div>
                <div className="text-sm font-medium text-green-600">+15%</div>
              </div>
              <div className="mt-3">
                <Progress value={65} className="h-2" />
                <p className="mt-2 text-xs text-[#6B7280]">Estimated monthly traffic</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Response Rate</CardTitle>
                <Users className="h-4 w-4 text-[#4988C4]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-[#111827]">98%</div>
                <div className="text-sm font-medium text-green-600">Excellent</div>
              </div>
              <div className="mt-3">
                <Progress value={98} className="h-2" />
                <p className="mt-2 text-xs text-[#6B7280]">Avg. response time: 2.3 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} SAR`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0F2854"
                    strokeWidth={2}
                    dot={{ fill: '#0F2854', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Product Distribution</CardTitle>
              <CardDescription>Products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderStatusData}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="status" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value} orders`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#0F2854" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent RFQ Requests</CardTitle>
                  <CardDescription>Buyer inquiries and quotations</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/supplier/rfq">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {supplierRFQs.length === 0 ? (
                <div className="py-10 text-center text-[#6B7280]">
                  No RFQ data connected yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {supplierRFQs.slice(0, 4).map((rfq: any) => (
                    <div
                      key={rfq.id}
                      className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-4 transition-colors hover:border-[#4988C4]"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-[#111827]">{rfq.productName}</div>
                        <div className="mt-1 text-sm text-[#6B7280]">
                          Quantity: {rfq.quantity} {rfq.unit}
                        </div>
                        <div className="mt-1 text-xs text-[#6B7280]">
                          Required by: {rfq.requiredDate}
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                        Respond
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/supplier/orders">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {supplierOrders.length === 0 ? (
                <div className="py-10 text-center text-[#6B7280]">No orders found.</div>
              ) : (
                <div className="space-y-4">
                  {supplierOrders.slice(0, 5).map((order) => (
                    <div
                      key={String(order.id)}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-[#E5E7EB] p-4 transition-colors hover:border-[#4988C4]"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#BDE8F5]/20">
                          <ShoppingBag className="h-6 w-6 text-[#0F2854]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-[#111827]">
                            {String(order.order_number || order.id)}
                          </div>
                          <div className="truncate text-sm text-[#6B7280]">
                            {String(order.notes || 'Order details')}
                          </div>
                          <div className="mt-1 text-xs text-[#6B7280]">
                            {order.created_at
                              ? new Date(String(order.created_at)).toLocaleDateString()
                              : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="whitespace-nowrap font-semibold text-[#111827]">
                          {getOrderTotal(order).toLocaleString()} SAR
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {String(order.status || order.order_status || 'pending')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Your latest active items</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/supplier/products">Manage</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {supplierProducts.length === 0 ? (
                <div className="py-10 text-center text-[#6B7280]">No products found.</div>
              ) : (
                <div className="space-y-4">
                  {supplierProducts.slice(0, 5).map((product, index) => (
                    <div
                      key={String(product.id)}
                      className="flex cursor-pointer items-center gap-4 rounded-lg border border-[#E5E7EB] p-4 transition-colors hover:border-[#4988C4]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2854] text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <img
                        src={getProductImage(product)}
                        alt={String(product.name)}
                        className="h-16 w-16 rounded-lg object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-[#111827]">{String(product.name)}</div>
                        <div className="mt-1 text-sm text-[#6B7280]">
                          Stock: {getProductInventory(product)} {String(product.unit || 'unit')}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs text-[#6B7280]">4.8 (estimated)</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="whitespace-nowrap font-semibold text-[#111827]">
                          {getProductPrice(product).toLocaleString()} SAR
                        </div>
                        <div className="text-sm text-[#6B7280]">per {String(product.unit || 'unit')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-auto bg-[#0F2854] py-6 hover:bg-[#1C4D8D]">
                <Link to="/supplier/products/new" className="flex flex-col items-center gap-2">
                  <Package className="h-6 w-6" />
                  <span className="font-semibold">Add New Product</span>
                  <span className="text-xs opacity-90">List a new item</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto border-[#4988C4] py-6 text-[#4988C4] hover:bg-[#4988C4] hover:text-white"
              >
                <Link to="/supplier/rfq" className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="font-semibold">Review RFQs</span>
                  <span className="text-xs">{supplierRFQs.length} pending</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto py-6">
                <Link to="/supplier/orders" className="flex flex-col items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  <span className="font-semibold">Manage Orders</span>
                  <span className="text-xs">Process orders</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto py-6">
                <Link to="/supplier/analytics" className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="font-semibold">View Analytics</span>
                  <span className="text-xs">Detailed insights</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}