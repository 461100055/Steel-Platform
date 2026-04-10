import { useMemo, useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  Clock,
  Calendar,
  DollarSign,
  User,
  Phone,
  MapPin,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { getSupplierOrders, type Order } from '../../lib/api';
import { toast } from 'sonner';

interface ExtendedOrder {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  supplierName: string;
  buyerName: string;
  buyerContact: string;
  deliveryAddress: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
}

function normalizeOrderStatus(order: Order): ExtendedOrder['status'] {
  const raw = String(
    order.status || order.order_status || order.payment_status || 'pending'
  ).toLowerCase();

  if (['delivered', 'completed'].includes(raw)) return 'delivered';
  if (['shipped', 'shipping', 'in_transit', 'in-transit'].includes(raw)) return 'shipped';
  if (['processing', 'confirmed', 'paid'].includes(raw)) return 'processing';
  return 'pending';
}

function normalizePaymentStatus(order: Order): ExtendedOrder['paymentStatus'] {
  const raw = String(order.payment_status || '').toLowerCase();

  if (['paid', 'completed'].includes(raw)) return 'paid';
  if (['partial', 'partially_paid'].includes(raw)) return 'partial';
  if (normalizeOrderStatus(order) === 'delivered') return 'paid';

  return 'pending';
}

function normalizeOrder(order: Order): ExtendedOrder {
  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0] || {};

  const productName =
    firstItem?.name ||
    firstItem?.product_name ||
    firstItem?.product_details?.name ||
    order.product_name ||
    'Order Items';

  const quantity = Number(
    firstItem?.quantity ||
      order.quantity ||
      0
  ) || 0;

  const total = Number(order.total ?? order.total_amount ?? 0) || 0;

  const date = String(
    order.created_at ||
      order.createdAt ||
      order.date ||
      order.order_date ||
      new Date().toISOString()
  );

  const supplierName =
    order.supplierName ||
    order.supplier_name ||
    order.supplier?.company ||
    order.supplier?.name ||
    'Supplier';

  const deliveryAddress =
    order.delivery_address ||
    order.shipping_address ||
    [
      order.delivery_info?.company,
      order.delivery_info?.address,
      order.delivery_info?.city,
      order.delivery_info?.postalCode,
      order.delivery_info?.country,
    ]
      .filter(Boolean)
      .join(', ') ||
    'No address provided';

  return {
    id: String(order.order_number || order.id || 'Order'),
    productName: String(productName),
    quantity,
    total,
    status: normalizeOrderStatus(order),
    date,
    supplierName: String(supplierName),
    buyerName: 'Buyer Account',
    buyerContact: order.delivery_info?.phone || '+966 XX XXX XXXX',
    deliveryAddress: String(deliveryAddress),
    paymentStatus: normalizePaymentStatus(order),
  };
}

export default function SupplierOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const [allOrders, setAllOrders] = useState<ExtendedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setPageError('');

        const data = await getSupplierOrders();
        const orders = Array.isArray(data) ? data : data?.results || [];

        setAllOrders(orders.map(normalizeOrder));
      } catch (error: any) {
        console.error('Failed to load supplier orders:', error);
        setPageError(error?.message || 'Failed to load supplier orders.');
        setAllOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      let matchesDate = true;
      const orderDate = new Date(order.date);
      const now = new Date();

      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = orderDate >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allOrders, searchQuery, statusFilter, dateFilter]);

  const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;
  const processingOrders = allOrders.filter((o) => o.status === 'processing').length;
  const shippedOrders = allOrders.filter((o) => o.status === 'shipped').length;
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'outline'; className: string }> = {
      pending: { variant: 'outline', className: 'border-orange-500 text-orange-700 bg-orange-50' },
      processing: { variant: 'outline', className: 'border-blue-500 text-blue-700 bg-blue-50' },
      shipped: { variant: 'outline', className: 'border-purple-500 text-purple-700 bg-purple-50' },
      delivered: { variant: 'outline', className: 'border-green-500 text-green-700 bg-green-50' },
    };
    return variants[status] || variants.pending;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { variant: 'outline'; className: string }> = {
      paid: { variant: 'outline', className: 'border-green-500 text-green-700 bg-green-50' },
      partial: { variant: 'outline', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      pending: { variant: 'outline', className: 'border-red-500 text-red-700 bg-red-50' },
    };
    return variants[status] || variants.pending;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854]">Order Management</h1>
            <p className="text-[#6B7280] mt-1">Track and manage all customer orders</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => toast.info('Export feature can be added next.')}>
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>
        </div>

        {pageError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{pageError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{pendingOrders}</div>
              <p className="text-xs text-[#6B7280] mt-1">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Processing</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{processingOrders}</div>
              <p className="text-xs text-[#6B7280] mt-1">Being prepared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Shipped</CardTitle>
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{shippedOrders}</div>
              <p className="text-xs text-[#6B7280] mt-1">In transit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-[#4988C4]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">
                {(totalRevenue / 1000).toFixed(0)}K SAR
              </div>
              <p className="text-xs text-[#6B7280] mt-1">All supplier orders</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Comprehensive order listing with details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search by order ID, product, or buyer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-[#E5E7EB]"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white border-[#E5E7EB]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white border-[#E5E7EB]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-[#6B7280]">Loading orders...</div>
            ) : (
              <Tabs defaultValue="table" className="w-full">
                <TabsList>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="cards">Card View</TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-6">
                  <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F9FAFB]">
                          <TableHead className="font-semibold text-[#111827]">Order ID</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Product</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Buyer</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Quantity</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Amount</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Status</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Payment</TableHead>
                          <TableHead className="font-semibold text-[#111827]">Date</TableHead>
                          <TableHead className="font-semibold text-[#111827] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-[#F9FAFB]">
                            <TableCell className="font-medium text-[#0F2854]">{order.id}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium text-[#111827] truncate">{order.productName}</div>
                                <div className="text-sm text-[#6B7280]">{order.quantity} units</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[180px]">
                                <div className="font-medium text-[#111827] truncate">{order.buyerName}</div>
                                <div className="text-sm text-[#6B7280]">{order.buyerContact}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{order.quantity}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-[#111827]">
                                {order.total.toLocaleString()} SAR
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge {...getStatusBadge(order.status)} className="capitalize">
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge {...getPaymentBadge(order.paymentStatus)} className="capitalize">
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[#6B7280]">
                              {new Date(order.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => toast.info('Supplier order details page can be added next.')}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => toast.info('Invoice download can be added next.')}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="cards" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{order.id}</CardTitle>
                              <p className="text-sm text-[#6B7280] mt-1">{order.productName}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge {...getStatusBadge(order.status)} className="capitalize">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-[#6B7280]" />
                              <span className="font-medium text-[#111827]">{order.buyerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-[#6B7280]" />
                              <span className="text-[#6B7280]">{order.buyerContact}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-[#6B7280]" />
                              <span className="text-[#6B7280] truncate">{order.deliveryAddress}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                              <div>
                                <p className="text-xs text-[#6B7280]">Total Amount</p>
                                <p className="font-semibold text-[#111827]">
                                  {order.total.toLocaleString()} SAR
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#6B7280]">Payment</p>
                                <Badge {...getPaymentBadge(order.paymentStatus)} className="capitalize mt-1">
                                  {order.paymentStatus}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                                onClick={() => toast.info('Supplier order details page can be added next.')}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {!isLoading && filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#111827] mb-2">No orders found</h3>
                <p className="text-[#6B7280]">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}