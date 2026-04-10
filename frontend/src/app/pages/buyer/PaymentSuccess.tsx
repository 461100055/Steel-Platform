import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  CheckCircle,
  Download,
  Mail,
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  Truck,
  FileText,
  Home,
  MapPin,
  Receipt,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../components/ui/dropdown-menu';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state || {};

  useEffect(() => {
    if (!orderData.orderId) {
      navigate('/buyer/dashboard');
    }
  }, [orderData, navigate]);

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'visa':
        return 'Credit/Debit Card';
      case 'tabby':
        return 'Tabby';
      case 'tamara':
        return 'Tamara';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'credit_card':
        return 'Credit / Debit Card';
      case 'credit_terms':
        return 'Credit Terms';
      default:
        return 'Payment';
    }
  };

  const estimatedDelivery = () => {
    const preferredDate =
      orderData?.deliveryInfo?.deliveryDate ||
      orderData?.orderInfo?.deliveryDate ||
      orderData?.orderData?.preferred_delivery_date;

    if (preferredDate) {
      const d = new Date(preferredDate);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    }

    const today = new Date();
    const deliveryDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const orderDateValue =
    orderData?.orderData?.created_at ||
    orderData?.orderData?.createdAt ||
    new Date().toISOString();

  const formattedOrderDate = new Date(orderDateValue).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalAmount = Number(
    orderData?.total ??
      orderData?.orderData?.total ??
      0
  );

  const subtotalAmount = Number(
    orderData?.subtotal ??
      orderData?.orderData?.subtotal ??
      0
  );

  const shippingAmount = Number(
    orderData?.shipping ??
      orderData?.orderData?.shipping ??
      0
  );

  const vatAmount = Number(
    orderData?.vat ??
      orderData?.orderData?.vat ??
      orderData?.orderData?.tax ??
      0
  );

  const deliveryAddress =
    orderData?.deliveryAddress ||
    orderData?.orderData?.delivery_address ||
    '';

  const installmentAmount = orderData?.installmentAmount
    ? Number(orderData.installmentAmount)
    : null;

  if (!orderData.orderId) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Payment Successful!</h1>
          <p className="text-[#6B7280] text-lg">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm text-[#6B7280] mb-1">Order Number</div>
                  <div className="text-2xl font-bold text-[#0F2854]">{orderData.orderId}</div>
                </div>

                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmed
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-[#0F2854]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#6B7280]">Order Date</div>
                      <div className="font-medium text-[#111827]">
                        {formattedOrderDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-[#0F2854]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#6B7280]">Payment Method</div>
                      <div className="font-medium text-[#111827]">
                        {getPaymentMethodLabel(orderData.paymentMethod)}
                        {orderData.installments && (
                          <span className="text-[#6B7280] ml-2">
                            ({orderData.installments} installments)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {deliveryAddress && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-[#0F2854]" />
                      </div>
                      <div>
                        <div className="text-sm text-[#6B7280]">Delivery Address</div>
                        <div className="font-medium text-[#111827] break-words">
                          {deliveryAddress}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 text-[#0F2854]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#6B7280]">Estimated Delivery</div>
                      <div className="font-medium text-[#111827]">
                        {estimatedDelivery()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-[#0F2854]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#6B7280]">Total Amount</div>
                      <div className="font-bold text-[#0F2854] text-xl">
                        {totalAmount.toLocaleString()} SAR
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Receipt className="h-5 w-5 text-[#0F2854]" />
                    </div>
                    <div className="w-full">
                      <div className="text-sm text-[#6B7280]">Payment Breakdown</div>
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex justify-between text-[#6B7280]">
                          <span>Subtotal</span>
                          <span>{subtotalAmount.toLocaleString()} SAR</span>
                        </div>
                        <div className="flex justify-between text-[#6B7280]">
                          <span>Shipping</span>
                          <span>{shippingAmount.toLocaleString()} SAR</span>
                        </div>
                        <div className="flex justify-between text-[#6B7280]">
                          <span>VAT</span>
                          <span>{vatAmount.toLocaleString()} SAR</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
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

                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Confirmation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#0F2854]" />
              What happens next?
            </h3>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0F2854] text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium text-[#111827]">Order Confirmation</div>
                  <div className="text-sm text-[#6B7280]">
                    You'll receive an email confirmation with your order details
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0F2854] text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium text-[#111827]">Order Processing</div>
                  <div className="text-sm text-[#6B7280]">
                    The supplier will prepare your order for shipment
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0F2854] text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium text-[#111827]">Shipping Updates</div>
                  <div className="text-sm text-[#6B7280]">
                    Track your order status and receive shipping notifications
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0F2854] text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium text-[#111827]">Delivery</div>
                  <div className="text-sm text-[#6B7280]">
                    Your order will be delivered to your specified address
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {orderData.installments && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-700" />
                Payment Schedule
              </h3>

              <p className="text-sm text-green-800 mb-4">
                Your payment will be split into {orderData.installments} installments.
                The first payment has been processed today.
                Remaining payments will be automatically charged according to your selected schedule.
              </p>

              {installmentAmount && (
                <div className="text-sm text-green-800 mb-3">
                  Each installment: <span className="font-bold">{installmentAmount.toLocaleString()} SAR</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">0% interest • No hidden fees</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-[#0F2854] hover:bg-[#1C4D8D] h-12">
            <Link to="/buyer/orders">
              <FileText className="h-5 w-5 mr-2" />
              View My Orders
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="flex-1 h-12">
            <Link to="/marketplace">
              <Package className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-12">
            <Link to="/buyer/dashboard">
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#6B7280] mb-2">Need help with your order?</p>
          <Button variant="link" className="text-[#0F2854]">
            Contact Customer Support
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}