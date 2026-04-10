import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockProducts } from '../../lib/mock-data';
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Printer,
  MessageSquare,
  Edit
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Progress } from '../../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

export default function SupplierOrderDetails() {
  const { orderId } = useParams();
  const [orderStatus, setOrderStatus] = useState<'pending' | 'processing' | 'shipped' | 'delivered'>('processing');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Mock order details
  const order = {
    id: orderId || 'ORD001',
    productName: 'Hot Rolled Steel Coil',
    productId: '1',
    quantity: 50,
    unit: 'ton',
    unitPrice: 2500,
    subtotal: 125000,
    vat: 18750,
    total: 143750,
    status: orderStatus,
    paymentStatus: 'paid',
    paymentMethod: 'Bank Transfer',
    orderDate: '2026-02-15',
    expectedDelivery: '2026-03-05',
    buyer: {
      name: 'Ahmad Construction Co.',
      contactPerson: 'Ahmad Al-Mansour',
      email: 'ahmad@ahmadconstruction.sa',
      phone: '+966 50 123 4567',
      companyRegNo: 'CR-1234567890',
      vatNo: 'VAT-300012345600003'
    },
    deliveryAddress: {
      street: 'King Fahd Road, Building 45',
      city: 'Riyadh',
      postalCode: '11564',
      country: 'Saudi Arabia'
    },
    billingAddress: {
      street: 'King Fahd Road, Building 45',
      city: 'Riyadh',
      postalCode: '11564',
      country: 'Saudi Arabia'
    },
    specifications: {
      grade: 'ASTM A36',
      thickness: '2-10mm',
      width: '1000-2000mm',
      coating: 'None'
    },
    timeline: [
      { status: 'Order Placed', date: '2026-02-15 10:30 AM', completed: true },
      { status: 'Payment Confirmed', date: '2026-02-15 02:15 PM', completed: true },
      { status: 'Processing', date: '2026-02-16 09:00 AM', completed: true },
      { status: 'Ready for Shipment', date: '2026-02-20', completed: false },
      { status: 'Shipped', date: 'Pending', completed: false },
      { status: 'Delivered', date: 'Pending', completed: false }
    ]
  };

  const product = mockProducts.find(p => p.id === order.productId);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-orange-600',
      processing: 'text-blue-600',
      shipped: 'text-purple-600',
      delivered: 'text-green-600'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-5 w-5" />;
  };

  const getProgressValue = () => {
    const progress: Record<string, number> = {
      pending: 25,
      processing: 50,
      shipped: 75,
      delivered: 100
    };
    return progress[orderStatus] || 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/supplier/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#0F2854]">Order Details</h1>
              <p className="text-[#6B7280] mt-1">Order #{order.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Invoice
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Order Status</DialogTitle>
                  <DialogDescription>
                    Change the status of order #{order.id}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Order Status</Label>
                    <Select value={orderStatus} onValueChange={(value: any) => setOrderStatus(value)}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {orderStatus === 'shipped' && (
                    <div className="space-y-2">
                      <Label htmlFor="tracking">Tracking Number</Label>
                      <input
                        id="tracking"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                    Update Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Order Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Current order progress and timeline</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 ${getStatusColor(orderStatus)}`}>
                  {getStatusIcon(orderStatus)}
                  <span className="font-semibold capitalize text-lg">{orderStatus}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Progress</span>
                  <span className="text-sm font-medium text-[#111827]">{getProgressValue()}%</span>
                </div>
                <Progress value={getProgressValue()} className="h-3" />
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {order.timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                      item.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-[#F3F4F6] text-[#9CA3AF]'
                    }`}>
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${item.completed ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                          {item.status}
                        </p>
                        <p className="text-sm text-[#6B7280]">{item.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Info */}
              <div>
                <h3 className="font-semibold text-[#111827] mb-4">Product Details</h3>
                <div className="flex gap-4">
                  {product && (
                    <img
                      src={product.image}
                      alt={order.productName}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#111827]">{order.productName}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Quantity:</span>
                        <span className="font-medium text-[#111827]">{order.quantity} {order.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Unit Price:</span>
                        <span className="font-medium text-[#111827]">{order.unitPrice.toLocaleString()} SAR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Specifications */}
              <div>
                <h3 className="font-semibold text-[#111827] mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(order.specifications).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-[#6B7280] capitalize">{key}</p>
                      <p className="font-medium text-[#111827]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-[#111827] mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-medium text-[#111827]">
                      {order.subtotal.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">VAT (15%)</span>
                    <span className="font-medium text-[#111827]">
                      {order.vat.toLocaleString()} SAR
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#111827]">Total Amount</span>
                    <span className="font-bold text-[#0F2854] text-xl">
                      {order.total.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#6B7280]">Payment Status</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Payment Method</span>
                    <span className="font-medium text-[#111827]">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyer & Delivery Info */}
          <div className="space-y-6">
            {/* Buyer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Buyer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#6B7280]">Company Name</p>
                  <p className="font-semibold text-[#111827]">{order.buyer.name}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <p className="text-sm text-[#6B7280]">Contact Person</p>
                      <p className="font-medium text-[#111827]">{order.buyer.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <p className="text-sm text-[#6B7280]">Phone</p>
                      <p className="font-medium text-[#111827]">{order.buyer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <p className="text-sm text-[#6B7280]">Email</p>
                      <p className="font-medium text-[#111827] break-all">{order.buyer.email}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-[#6B7280]">Company Registration</p>
                    <p className="font-medium text-[#111827]">{order.buyer.companyRegNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">VAT Number</p>
                    <p className="font-medium text-[#111827]">{order.buyer.vatNo}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Buyer
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-[#6B7280] mt-1" />
                    <div>
                      <p className="text-sm text-[#6B7280] mb-1">Delivery Address</p>
                      <p className="font-medium text-[#111827]">{order.deliveryAddress.street}</p>
                      <p className="font-medium text-[#111827]">
                        {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                      </p>
                      <p className="font-medium text-[#111827]">{order.deliveryAddress.country}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <p className="text-sm text-[#6B7280]">Order Date</p>
                      <p className="font-medium text-[#111827]">
                        {new Date(order.orderDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <p className="text-sm text-[#6B7280]">Expected Delivery</p>
                      <p className="font-medium text-[#111827]">
                        {new Date(order.expectedDelivery).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Packing List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="h-4 w-4 mr-2" />
                  Arrange Shipment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}