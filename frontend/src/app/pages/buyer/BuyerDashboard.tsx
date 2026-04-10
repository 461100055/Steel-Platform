import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  ShoppingBag,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { getCurrentUser, getOrders } from '../../lib/api';

function getOrderStatus(order: any) {
  return String(
    order.status ||
      order.order_status ||
      order.payment_status ||
      'pending'
  ).toLowerCase();
}

function getOrderTotal(order: any) {
  const value = Number(order.total ?? order.total_amount ?? order.total_price ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getOrderTitle(order: any) {
  return String(order.order_number || order.orderNumber || order.id || 'Order');
}

function getOrderSubtitle(order: any) {
  if (typeof order.notes === 'string' && order.notes.trim()) {
    return order.notes;
  }

  const firstItem = Array.isArray(order.items) ? order.items[0] : null;

  if (firstItem?.name) return String(firstItem.name);
  if (firstItem?.product_name) return String(firstItem.product_name);
  if (firstItem?.product?.name) return String(firstItem.product.name);

  return 'Order details';
}

function getOrderCreatedAt(order: any) {
  return String(
    order.created_at ||
      order.createdAt ||
      order.date ||
      order.order_date ||
      ''
  );
}

function normalizeUserRole(user: any) {
  return String(
    user?.role ||
      user?.user_type ||
      user?.account_type ||
      ''
  ).toLowerCase();
}

function normalizeBuyerType(user: any) {
  return String(
    user?.buyer_type ||
      user?.buyerType ||
      ''
  ).toLowerCase();
}

function isAllowedBuyer(user: any) {
  const role = normalizeUserRole(user);
  const buyerType = normalizeBuyerType(user);

  if (
    role === 'buyer_individual' ||
    role === 'buyer_company' ||
    role === 'buyer_establishment' ||
    role === 'buyer'
  ) {
    return true;
  }

  if (role === 'buyer' && ['individual', 'company', 'establishment', 'commercial'].includes(buyerType)) {
    return true;
  }

  return false;
}

function getBuyerDashboardLabel(user: any) {
  const role = normalizeUserRole(user);
  const buyerType = normalizeBuyerType(user);

  if (role === 'buyer_individual' || buyerType === 'individual') {
    return 'Individual Buyer';
  }

  if (role === 'buyer_company' || buyerType === 'company') {
    return 'Company Buyer';
  }

  if (
    role === 'buyer_establishment' ||
    buyerType === 'establishment' ||
    buyerType === 'commercial'
  ) {
    return 'Commercial Establishment Buyer';
  }

  return 'Buyer';
}

export default function BuyerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setPageError('');

        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!isAllowedBuyer(currentUser)) {
          setPageError('This dashboard is available for buyer accounts only.');
          setOrders([]);
          return;
        }

        const response = await getOrders();
        const ordersData = Array.isArray(response) ? response : response?.results || [];

        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        setPageError(error?.message || 'Failed to load dashboard data.');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const aTime = new Date(getOrderCreatedAt(a)).getTime() || 0;
        const bTime = new Date(getOrderCreatedAt(b)).getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 3);
  }, [orders]);

  const pendingRFQs = 0;

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getOrderStatus(order);
      return !['delivered', 'completed', 'paid'].includes(status);
    }).length;
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getOrderStatus(order);
      return ['delivered', 'completed', 'paid'].includes(status);
    }).length;
  }, [orders]);

  const buyerLabel = useMemo(() => getBuyerDashboardLabel(user), [user]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                    <div className="h-16 bg-gray-200 rounded" />
                    <div className="h-16 bg-gray-200 rounded" />
                    <div className="h-16 bg-gray-200 rounded" />
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
      <div>
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-[#0F2854]">Dashboard</h1>
          <Badge variant="outline" className="w-fit">
            {buyerLabel}
          </Badge>
        </div>

        {pageError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{pageError}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{orders.length}</div>
              <p className="mt-1 text-xs text-[#6B7280]">All recorded orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">
                {totalSpent.toLocaleString()} SAR
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">Based on all orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Pending RFQs</CardTitle>
              <FileText className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{pendingRFQs}</div>
              <p className="mt-1 text-xs text-[#6B7280]">RFQ API not connected yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-[#4988C4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{activeOrders}</div>
              <p className="mt-1 text-xs text-[#6B7280]">
                {deliveredOrders} completed or delivered
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/buyer/orders')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="py-10 text-center text-[#6B7280]">
                  No orders found yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => {
                    const status = getOrderStatus(order);

                    return (
                      <div
                        key={String(order.id || order.order_number)}
                        className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-10 w-10 rounded bg-[#BDE8F5] p-2 text-[#0F2854]" />
                          <div>
                            <div className="font-medium text-[#111827]">{getOrderTitle(order)}</div>
                            <div className="text-sm text-[#6B7280]">{getOrderSubtitle(order)}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-[#111827]">
                            {getOrderTotal(order).toLocaleString()} SAR
                          </div>
                          <Badge
                            variant={
                              ['delivered', 'completed', 'paid'].includes(status)
                                ? 'default'
                                : status === 'shipped'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="mt-1"
                          >
                            {String(order.status || order.order_status || 'pending')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Saved Suppliers</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
                  Browse
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-[#E5E7EB] p-8 text-center">
                <div className="text-sm text-[#6B7280]">
                  Saved suppliers are not connected yet.
                </div>
                <p className="mt-2 text-xs text-[#9CA3AF]">
                  This section will show favorite or frequently used suppliers after supplier/favorites API is added.
                </p>
                <Button
                  className="mt-4 bg-[#0F2854] hover:bg-[#1C4D8D]"
                  onClick={() => navigate('/marketplace')}
                >
                  Browse Suppliers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button
                onClick={() => navigate('/marketplace')}
                className="flex h-auto flex-col items-center gap-2 bg-[#0F2854] py-6 hover:bg-[#1C4D8D]"
              >
                <ShoppingBag className="h-6 w-6" />
                <span>Browse Products</span>
              </Button>

              <Button
                onClick={() => navigate('/buyer/rfq/new')}
                variant="outline"
                className="flex h-auto flex-col items-center gap-2 border-[#4988C4] py-6 text-[#4988C4] hover:bg-[#4988C4] hover:text-white"
              >
                <FileText className="h-6 w-6" />
                <span>Request Quote</span>
              </Button>

              <Button
                onClick={() => navigate('/buyer/orders')}
                variant="outline"
                className="flex h-auto flex-col items-center gap-2 py-6"
              >
                <CheckCircle className="h-6 w-6" />
                <span>Track Orders</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}