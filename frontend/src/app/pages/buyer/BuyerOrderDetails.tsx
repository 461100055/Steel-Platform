import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  Package,
  ArrowLeft,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Download,
  MessageSquare,
  Building2,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { getOrderById } from '../../lib/api';

export default function BuyerOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError('');

        if (!orderId) {
          setError('Order ID is missing');
          setOrder(null);
          return;
        }

        const response = await getOrderById(orderId);
        setOrder(response);
      } catch (err: any) {
        console.error('Failed to load order:', err);
        setError(err?.message || 'Failed to load order');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const normalizedOrder = useMemo(() => {
    if (!order) return null;

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

    const id =
      order.order_number ||
      order.orderNumber ||
      order.id ||
      orderId ||
      'N/A';

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

    const subtotal =
      Number(order.subtotal || order.sub_total || order.total_amount || order.total || 0) || 0;

    const vat =
      Number(order.vat || order.tax || 0) || 0;

    const shipping =
      Number(order.shipping || order.shipping_fee || 0) || 0;

    const total =
      Number(order.total || order.total_amount || 0) || 0;

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

    const deliveryAddress =
      order.delivery_address ||
      order.shipping_address ||
      '';

    const deliveryInfo = order.delivery_info || {};
    const billingInfo = order.billing_info || {};
    const orderInfo = order.order_info || {};

    const preferredDeliveryDate =
      order.preferred_delivery_date ||
      orderInfo.deliveryDate ||
      null;

    const supplierEmail =
      order.supplier?.email ||
      `contact@${String(supplierName).toLowerCase().replace(/\s+/g, '')}.com`;

    const supplierPhone =
      order.supplier?.phone ||
      '+966 XX XXX XXXX';

    const supplierLocation =
      order.supplier?.city
        ? `${order.supplier.city}${order.supplier?.country ? `, ${order.supplier.country}` : ''}`
        : 'Riyadh, Saudi Arabia';

    return {
      raw: order,
      id,
      status,
      productName,
      quantity,
      unit,
      subtotal,
      vat,
      shipping,
      total,
      supplierName,
      supplierEmail,
      supplierPhone,
      supplierLocation,
      dateValue,
      deliveryAddress,
      deliveryInfo,
      billingInfo,
      orderInfo,
      preferredDeliveryDate,
      items,
    };
  }, [order, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'processing':
        return <Clock className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-56 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !normalizedOrder) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-[#6B7280] mb-4" />
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Order Not Found</h2>
          <p className="text-[#6B7280] mb-6">
            {error || "The order you're looking for doesn't exist."}
          </p>
          <Button
            onClick={() => navigate('/buyer/orders')}
            className="bg-[#0F2854] hover:bg-[#1C4D8D]"
          >
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const orderDate = new Date(normalizedOrder.dateValue);
  const formattedOrderDate = Number.isNaN(orderDate.getTime())
    ? '-'
    : orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const formattedOrderDateTime = Number.isNaN(orderDate.getTime())
    ? '-'
    : orderDate.toLocaleString();

  const trackingNumber =
    normalizedOrder.raw?.tracking_number ||
    normalizedOrder.raw?.trackingNumber ||
    `TRK${String(normalizedOrder.id).slice(-8)}`;

  const shippingAddressText =
    normalizedOrder.deliveryAddress ||
    [
      normalizedOrder.deliveryInfo.company,
      normalizedOrder.deliveryInfo.address,
      normalizedOrder.deliveryInfo.city,
      normalizedOrder.deliveryInfo.postalCode,
      normalizedOrder.deliveryInfo.country,
    ]
      .filter(Boolean)
      .join('\n');

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/buyer/orders')}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-[#0F2854] mb-2">Order Details</h1>
            <p className="text-[#6B7280]">Order ID: {normalizedOrder.id}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/buyer/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Supplier
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <Badge className={`${getStatusColor(normalizedOrder.status)} px-4 py-2 text-base`}>
                    <span className="mr-2">{getStatusIcon(normalizedOrder.status)}</span>
                    {normalizedOrder.status.charAt(0).toUpperCase() + normalizedOrder.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-[#6B7280]">
                    Order Date: {formattedOrderDate}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#111827]">Order Placed</div>
                      <div className="text-sm text-[#6B7280]">{formattedOrderDateTime}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['processing', 'shipped', 'delivered'].includes(normalizedOrder.status)
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Clock
                        className={`h-4 w-4 ${
                          ['processing', 'shipped', 'delivered'].includes(normalizedOrder.status)
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#111827]">Processing</div>
                      <div className="text-sm text-[#6B7280]">
                        {['processing', 'shipped', 'delivered'].includes(normalizedOrder.status)
                          ? 'Order is being prepared'
                          : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['shipped', 'delivered'].includes(normalizedOrder.status)
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Truck
                        className={`h-4 w-4 ${
                          ['shipped', 'delivered'].includes(normalizedOrder.status)
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#111827]">Shipped</div>
                      <div className="text-sm text-[#6B7280]">
                        {['shipped', 'delivered'].includes(normalizedOrder.status)
                          ? 'Order is on the way'
                          : 'Not shipped yet'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        normalizedOrder.status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <CheckCircle
                        className={`h-4 w-4 ${
                          normalizedOrder.status === 'delivered'
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#111827]">Delivered</div>
                      <div className="text-sm text-[#6B7280]">
                        {normalizedOrder.status === 'delivered'
                          ? 'Order delivered successfully'
                          : 'Pending delivery'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {normalizedOrder.items.length > 0 ? (
                    normalizedOrder.items.map((item: any, index: number) => {
                      const itemName =
                        item?.name ||
                        item?.product_name ||
                        item?.product?.name ||
                        normalizedOrder.productName;

                      const itemQuantity = Number(item?.quantity || 0);
                      const itemUnit = item?.unit || normalizedOrder.unit;
                      const itemPrice = Number(item?.price || 0);

                      return (
                        <div
                          key={`${item?.product || item?.id || index}`}
                          className="flex items-start gap-4"
                        >
                          <div className="w-20 h-20 bg-[#BDE8F5] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-10 w-10 text-[#0F2854]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-[#111827] mb-1">
                              {itemName}
                            </h3>
                            <p className="text-[#6B7280] mb-2">Order ID: {normalizedOrder.id}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-[#6B7280]">Quantity:</span>
                                <span className="ml-2 font-medium text-[#111827]">
                                  {itemQuantity} {itemUnit}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#6B7280]">Unit Price:</span>
                                <span className="ml-2 font-medium text-[#111827]">
                                  {itemPrice.toLocaleString()} SAR/{itemUnit}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 bg-[#BDE8F5] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-10 w-10 text-[#0F2854]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#111827] mb-1">
                          {normalizedOrder.productName}
                        </h3>
                        <p className="text-[#6B7280] mb-2">Order ID: {normalizedOrder.id}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-[#6B7280]">Quantity:</span>
                            <span className="ml-2 font-medium text-[#111827]">
                              {normalizedOrder.quantity} {normalizedOrder.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6B7280]">Unit Price:</span>
                            <span className="ml-2 font-medium text-[#111827]">
                              {normalizedOrder.quantity > 0
                                ? (normalizedOrder.subtotal / normalizedOrder.quantity).toLocaleString()
                                : '0'}{' '}
                              SAR/{normalizedOrder.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="text-[#111827]">
                      {normalizedOrder.subtotal.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">VAT (15%)</span>
                    <span className="text-[#111827]">
                      {normalizedOrder.vat.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Shipping</span>
                    <span className={normalizedOrder.shipping > 0 ? 'text-[#111827]' : 'text-green-600 font-medium'}>
                      {normalizedOrder.shipping > 0
                        ? `${normalizedOrder.shipping.toLocaleString()} SAR`
                        : 'Free'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-[#111827]">Total</span>
                    <span className="text-[#0F2854]">
                      {normalizedOrder.total.toLocaleString()} SAR
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#BDE8F5] rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-[#0F2854]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#111827]">{normalizedOrder.supplierName}</div>
                      <div className="text-sm text-[#6B7280]">Verified Supplier</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-[#6B7280] mt-0.5" />
                      <div>
                        <div className="text-[#6B7280]">Email</div>
                        <div className="text-[#111827]">{normalizedOrder.supplierEmail}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-[#6B7280] mt-0.5" />
                      <div>
                        <div className="text-[#6B7280]">Phone</div>
                        <div className="text-[#111827]">{normalizedOrder.supplierPhone}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[#6B7280] mt-0.5" />
                      <div>
                        <div className="text-[#6B7280]">Location</div>
                        <div className="text-[#111827]">{normalizedOrder.supplierLocation}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/buyer/messages">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Supplier
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#6B7280] mt-0.5" />
                    <div>
                      <div className="text-[#6B7280] mb-1">Shipping Address</div>
                      <div className="text-[#111827] whitespace-pre-line">
                        {shippingAddressText || 'No delivery address available'}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-[#6B7280] mt-0.5" />
                    <div>
                      <div className="text-[#6B7280] mb-1">Shipping Method</div>
                      <div className="text-[#111827]">
                        {normalizedOrder.raw?.shipping_method ||
                          'Standard Delivery (5-7 business days)'}
                      </div>
                    </div>
                  </div>

                  {normalizedOrder.preferredDeliveryDate && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <div className="text-[#6B7280] mb-1">Preferred Delivery Date</div>
                          <div className="text-[#111827]">
                            {new Date(normalizedOrder.preferredDeliveryDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {normalizedOrder.status === 'shipped' && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <div className="text-[#6B7280] mb-1">Tracking Number</div>
                          <div className="text-[#111827] font-mono">{trackingNumber}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}