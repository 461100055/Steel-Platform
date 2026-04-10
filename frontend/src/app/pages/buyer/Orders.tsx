import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Package, Eye, Download, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../components/ui/dropdown-menu';
import { getOrders } from '../../lib/api';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getOrders();
        const ordersData = Array.isArray(response) ? response : response?.results || [];

        setOrders(ordersData);
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        setError(err?.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const normalizedOrders = useMemo(() => {
    return orders.map((order: any) => {
      const rawStatus = (
        order.status ||
        order.order_status ||
        order.payment_status ||
        'processing'
      )
        .toString()
        .toLowerCase();

      let status = 'processing';

      if (['delivered', 'completed', 'complete'].includes(rawStatus)) {
        status = 'delivered';
      } else if (['shipped', 'shipping', 'in_transit', 'in-transit'].includes(rawStatus)) {
        status = 'shipped';
      } else if (['processing', 'pending', 'confirmed', 'paid'].includes(rawStatus)) {
        status = 'processing';
      } else if (['cancelled', 'canceled', 'failed'].includes(rawStatus)) {
        status = 'cancelled';
      }

      const items = Array.isArray(order.items) ? order.items : [];
      const firstItem = items[0] || {};

      const productName =
        firstItem?.name ||
        firstItem?.product_name ||
        firstItem?.product?.name ||
        order.productName ||
        order.product_name ||
        order.product?.name ||
        'Order Items';

      const quantity =
        Number(
          firstItem?.quantity ||
            order.quantity ||
            0
        ) || 0;

      const unit =
        firstItem?.unit ||
        order.unit ||
        'units';

      const supplierName =
        order.supplierName ||
        order.supplier_name ||
        order.supplier?.company ||
        order.supplier?.name ||
        firstItem?.supplierName ||
        firstItem?.supplier_name ||
        'Steel Supplier';

      const dateValue =
        order.created_at ||
        order.createdAt ||
        order.date ||
        order.order_date ||
        new Date().toISOString();

      const total =
        Number(order.total || order.total_amount || 0) || 0;

      const id =
        order.order_number ||
        order.orderNumber ||
        order.id ||
        `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      return {
        ...order,
        normalizedId: id,
        normalizedStatus: status,
        normalizedProductName: productName,
        normalizedSupplierName: supplierName,
        normalizedQuantity: quantity,
        normalizedUnit: unit,
        normalizedDate: dateValue,
        normalizedTotal: total,
      };
    });
  }, [orders]);

  const stats = useMemo(() => {
    return {
      total: normalizedOrders.length,
      processing: normalizedOrders.filter((o) => o.normalizedStatus === 'processing').length,
      shipped: normalizedOrders.filter((o) => o.normalizedStatus === 'shipped').length,
      delivered: normalizedOrders.filter((o) => o.normalizedStatus === 'delivered').length,
    };
  }, [normalizedOrders]);

  const getBadgeVariant = (status: string) => {
    if (status === 'delivered') return 'default';
    if (status === 'shipped') return 'secondary';
    return 'outline';
  };

  const getBadgeLabel = (status: string) => {
    if (status === 'delivered') return 'Delivered';
    if (status === 'shipped') return 'Shipped';
    if (status === 'cancelled') return 'Cancelled';
    return 'Processing';
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854] mb-2">Orders</h1>
            <p className="text-[#6B7280]">Track and manage your orders</p>
          </div>
          <Button asChild className="bg-[#0F2854] hover:bg-[#1C4D8D]">
            <Link to="/marketplace">Continue Shopping</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#BDE8F5] rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#0F2854]" />
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">Total Orders</div>
                  <div className="text-2xl font-bold text-[#111827]">{stats.total}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">Processing</div>
                  <div className="text-2xl font-bold text-[#111827]">{stats.processing}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">Shipped</div>
                  <div className="text-2xl font-bold text-[#111827]">{stats.shipped}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">Delivered</div>
                  <div className="text-2xl font-bold text-[#111827]">{stats.delivered}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="p-6 border border-[#E5E7EB] rounded-lg animate-pulse"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-40" />
                          <div className="h-4 bg-gray-200 rounded w-56" />
                          <div className="h-3 bg-gray-200 rounded w-64" />
                        </div>
                      </div>
                      <div className="w-24 h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : normalizedOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3F4F6] mb-4">
                  <Package className="h-8 w-8 text-[#6B7280]" />
                </div>
                <h3 className="text-xl font-semibold text-[#111827] mb-2">No orders yet</h3>
                <p className="text-[#6B7280] mb-6">
                  You haven&apos;t placed any orders yet.
                </p>
                <Button asChild className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                  <Link to="/marketplace">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {normalizedOrders.map((order) => (
                  <div
                    key={order.normalizedId}
                    className="flex items-center justify-between p-6 border border-[#E5E7EB] rounded-lg hover:border-[#4988C4] transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#BDE8F5] rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-[#0F2854]" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-semibold text-[#111827]">
                            {order.normalizedId}
                          </span>
                          <Badge variant={getBadgeVariant(order.normalizedStatus)}>
                            {getBadgeLabel(order.normalizedStatus)}
                          </Badge>
                        </div>

                        <div className="text-[#111827] mb-1">
                          {order.normalizedProductName}
                        </div>

                        <div className="text-sm text-[#6B7280]">
                          {order.normalizedSupplierName} • {order.normalizedQuantity}{' '}
                          {order.normalizedUnit} •{' '}
                          {new Date(order.normalizedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right mr-6">
                      <div className="font-bold text-[#111827] mb-1">
                        {order.normalizedTotal.toLocaleString()} SAR
                      </div>
                      <div className="text-sm text-[#6B7280]">Total</div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/buyer/orders/${order.id || order.normalizedId}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download as Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}