import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import {
  CheckCircle,
  CreditCard,
  Building2,
  Truck,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Shield,
  Clock,
  PackageCheck,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  X,
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
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import { getProducts } from '../../lib/api';

export default function Checkout() {
  const { items } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [syncedItems, setSyncedItems] = useState<any[]>([]);

  const [deliveryInfo, setDeliveryInfo] = useState({
    contactPerson: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Saudi Arabia',
  });

  const [billingInfo, setBillingInfo] = useState({
    sameAsDelivery: true,
    company: '',
    address: '',
    city: '',
    postalCode: '',
    vatNumber: '',
  });

  const [orderInfo, setOrderInfo] = useState({
    paymentMethod: 'bank_transfer',
    deliveryDate: '',
    notes: '',
    poNumber: '',
  });

  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    const syncCheckoutItems = async () => {
      try {
        setLoading(true);
        setSyncError('');

        if (!items || items.length === 0) {
          setSyncedItems([]);
          return;
        }

        const response = await getProducts();
        const backendProducts = Array.isArray(response) ? response : response?.results || [];

        const mergedItems = items.map((item: any) => {
          const matched = backendProducts.find(
            (product: any) => String(product.id) === String(item.product.id)
          );

          const inventory = Number(
            matched?.inventory ??
              matched?.stock ??
              item.product.inventory ??
              item.product.stock ??
              0
          );

          const moq = Number(
            matched?.moq ??
              matched?.min_order_quantity ??
              item.product.moq ??
              item.product.min_order_quantity ??
              1
          );

          let stockStatus = item.product.stockStatus || 'In Stock';

          if (inventory <= 0) {
            stockStatus = 'Out of Stock';
          } else if (inventory <= moq * 2) {
            stockStatus = 'Low Stock';
          } else {
            stockStatus = 'In Stock';
          }

          return {
            ...item,
            product: {
              ...item.product,
              id: matched?.id ?? item.product.id,
              name: matched?.name ?? item.product.name,
              image: matched?.image || matched?.images?.[0] || item.product.image,
              price: Number(matched?.price ?? item.product.price ?? 0),
              unit: matched?.unit ?? item.product.unit ?? 'piece',
              moq,
              inventory,
              deliveryTime:
                matched?.deliveryTime ??
                matched?.delivery_time ??
                item.product.deliveryTime ??
                item.product.delivery_time ??
                '3-7 business days',
              supplierName:
                matched?.supplierName ??
                matched?.supplier_name ??
                matched?.supplier?.company ??
                matched?.supplier?.name ??
                matched?.supplier?.username ??
                item.product.supplierName ??
                'Steel Supplier',
              badge: matched?.badge ?? item.product.badge,
              stockStatus,
            },
            quantity: Number(item.quantity ?? moq),
          };
        });

        setSyncedItems(mergedItems);
      } catch (error: any) {
        console.error('Failed to sync checkout items with backend:', error);
        setSyncError(error?.message || 'Failed to sync checkout with server');
        setSyncedItems(items || []);
      } finally {
        setLoading(false);
      }
    };

    syncCheckoutItems();
  }, [items]);

  const subtotal = useMemo(() => {
    return syncedItems.reduce((sum: number, item: any) => {
      return sum + Number(item.product.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [syncedItems]);

  const shipping = syncedItems.length > 0 ? 500 : 0;
  const vat = (subtotal + shipping) * 0.15;
  const total = subtotal + shipping + vat;

  const handleDeliveryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDeliveryInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOrderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setOrderInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateItemsBeforePayment = () => {
    if (!syncedItems.length) {
      toast.error('Your cart is empty');
      return false;
    }

    const invalidItem = syncedItems.find((item: any) => {
      const moq = Number(item.product.moq || 1);
      const inventory = Number(item.product.inventory || 0);
      const quantity = Number(item.quantity || 0);

      if (quantity < moq) return true;
      if (inventory <= 0) return true;
      if (inventory > 0 && quantity > inventory) return true;

      return false;
    });

    if (invalidItem) {
      const inventory = Number(invalidItem.product.inventory || 0);

      if (inventory <= 0) {
        toast.error(`"${invalidItem.product.name}" is out of stock`);
      } else if (invalidItem.quantity < invalidItem.product.moq) {
        toast.error(
          `"${invalidItem.product.name}" requires minimum order quantity of ${invalidItem.product.moq}`
        );
      } else {
        toast.error(
          `"${invalidItem.product.name}" only has ${inventory} units available`
        );
      }

      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (
      !deliveryInfo.contactPerson ||
      !deliveryInfo.phone ||
      !deliveryInfo.address ||
      !deliveryInfo.city
    ) {
      toast.error('Please fill in all required delivery information');
      return;
    }

    if (!orderInfo.deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    if (!validateItemsBeforePayment()) {
      return;
    }

    const normalizedBillingInfo = billingInfo.sameAsDelivery
      ? {
          sameAsDelivery: true,
          company: deliveryInfo.company,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          postalCode: deliveryInfo.postalCode,
          vatNumber: billingInfo.vatNumber,
        }
      : billingInfo;

    const deliveryAddress = `${deliveryInfo.address}, ${deliveryInfo.city}${
      deliveryInfo.postalCode ? `, ${deliveryInfo.postalCode}` : ''
    }, ${deliveryInfo.country}`;

    navigate('/buyer/payment', {
      state: {
        fromCheckout: true,
        deliveryInfo,
        billingInfo: normalizedBillingInfo,
        orderInfo,
        deliveryAddress,
        items: syncedItems,
        orderSummary: {
          subtotal,
          shipping,
          vat,
          total,
        },
      },
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F2854]">Checkout</h1>
            <p className="text-[#6B7280] mt-2">Loading checkout details...</p>
          </div>

          <Card>
            <CardContent className="p-10">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (syncedItems.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <PackageCheck className="h-16 w-16 text-[#6B7280] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Your cart is empty</h2>
          <p className="text-[#6B7280] mb-6">
            Add some products to your cart before proceeding to checkout
          </p>
          <Button
            onClick={() => navigate('/marketplace')}
            className="bg-[#0F2854] hover:bg-[#1C4D8D]"
          >
            Browse Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/buyer/cart')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>

          <h1 className="text-3xl font-bold text-[#0F2854]">Checkout</h1>
          <p className="text-[#6B7280] mt-2">
            Complete your order by providing delivery and payment details
          </p>
        </div>

        {syncError && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 mb-1">Server sync warning</p>
                  <p className="text-orange-700">{syncError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#0F2854] text-white flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <CardTitle>Delivery Information</CardTitle>
                      <p className="text-sm text-[#6B7280]">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">
                        Contact Person <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          value={deliveryInfo.contactPerson}
                          onChange={handleDeliveryChange}
                          required
                          className="pl-10 bg-white border-[#E5E7EB]"
                          placeholder="Full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={deliveryInfo.phone}
                          onChange={handleDeliveryChange}
                          required
                          className="pl-10 bg-white border-[#E5E7EB]"
                          placeholder="+966 5X XXX XXXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={deliveryInfo.email}
                          onChange={handleDeliveryChange}
                          className="pl-10 bg-white border-[#E5E7EB]"
                          placeholder="email@company.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        <Input
                          id="company"
                          name="company"
                          value={deliveryInfo.company}
                          onChange={handleDeliveryChange}
                          className="pl-10 bg-white border-[#E5E7EB]"
                          placeholder="Your company"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Delivery Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                      <Textarea
                        id="address"
                        name="address"
                        value={deliveryInfo.address}
                        onChange={handleDeliveryChange}
                        required
                        rows={3}
                        className="pl-10 bg-white border-[#E5E7EB]"
                        placeholder="Street address, building number, floor"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={deliveryInfo.city}
                        onValueChange={(value) =>
                          setDeliveryInfo((prev) => ({ ...prev, city: value }))
                        }
                      >
                        <SelectTrigger className="bg-white border-[#E5E7EB]">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Riyadh">Riyadh</SelectItem>
                          <SelectItem value="Jeddah">Jeddah</SelectItem>
                          <SelectItem value="Dammam">Dammam</SelectItem>
                          <SelectItem value="Khobar">Khobar</SelectItem>
                          <SelectItem value="Mecca">Mecca</SelectItem>
                          <SelectItem value="Medina">Medina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={deliveryInfo.postalCode}
                        onChange={handleDeliveryChange}
                        className="bg-white border-[#E5E7EB]"
                        placeholder="12345"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={deliveryInfo.country}
                        onChange={handleDeliveryChange}
                        disabled
                        className="bg-[#F9FAFB] border-[#E5E7EB]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#0F2854] text-white flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <CardTitle>Billing Information</CardTitle>
                      <p className="text-sm text-[#6B7280]">
                        Invoice and payment details
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsDelivery"
                      checked={billingInfo.sameAsDelivery}
                      onCheckedChange={(checked) =>
                        setBillingInfo((prev) => ({
                          ...prev,
                          sameAsDelivery: checked as boolean,
                        }))
                      }
                    />
                    <label
                      htmlFor="sameAsDelivery"
                      className="text-sm font-medium leading-none"
                    >
                      Same as delivery address
                    </label>
                  </div>

                  {!billingInfo.sameAsDelivery && (
                    <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                      <div className="space-y-2">
                        <Label htmlFor="billingCompany">Company Name</Label>
                        <Input
                          id="billingCompany"
                          name="company"
                          value={billingInfo.company}
                          onChange={handleBillingChange}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">Billing Address</Label>
                        <Input
                          id="billingAddress"
                          name="address"
                          value={billingInfo.address}
                          onChange={handleBillingChange}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">City</Label>
                          <Input
                            id="billingCity"
                            name="city"
                            value={billingInfo.city}
                            onChange={handleBillingChange}
                            className="bg-white border-[#E5E7EB]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingPostalCode">Postal Code</Label>
                          <Input
                            id="billingPostalCode"
                            name="postalCode"
                            value={billingInfo.postalCode}
                            onChange={handleBillingChange}
                            className="bg-white border-[#E5E7EB]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                      <Input
                        id="vatNumber"
                        name="vatNumber"
                        value={billingInfo.vatNumber}
                        onChange={handleBillingChange}
                        className="pl-10 bg-white border-[#E5E7EB]"
                        placeholder="VAT-XXXXXXXXXXXXXX"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#0F2854] text-white flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <CardTitle>Payment & Delivery</CardTitle>
                      <p className="text-sm text-[#6B7280]">
                        Choose your payment method and delivery date
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>
                      Payment Method <span className="text-red-500">*</span>
                    </Label>

                    <RadioGroup
                      value={orderInfo.paymentMethod}
                      onValueChange={(value) =>
                        setOrderInfo((prev) => ({ ...prev, paymentMethod: value }))
                      }
                    >
                      <div className="flex items-center space-x-3 p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer">
                        <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                        <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-[#0F2854]" />
                            <div>
                              <div className="font-medium text-[#111827]">Bank Transfer</div>
                              <div className="text-sm text-[#6B7280]">
                                Direct bank transfer (Recommended)
                              </div>
                            </div>
                          </div>
                        </Label>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Popular
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-[#0F2854]" />
                            <div>
                              <div className="font-medium text-[#111827]">
                                Credit/Debit Card
                              </div>
                              <div className="text-sm text-[#6B7280]">
                                Visa, Mastercard, Mada
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer">
                        <RadioGroupItem value="credit_terms" id="credit_terms" />
                        <Label htmlFor="credit_terms" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-[#0F2854]" />
                            <div>
                              <div className="font-medium text-[#111827]">
                                Credit Terms (Net 30)
                              </div>
                              <div className="text-sm text-[#6B7280]">
                                Pay within 30 days of delivery
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {orderInfo.paymentMethod === 'bank_transfer' && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">
                              Bank transfer instructions will be sent after order confirmation
                            </p>
                            <p className="text-blue-700">
                              You will receive bank details and payment reference number via
                              email.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">
                        Preferred Delivery Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        <Input
                          id="deliveryDate"
                          name="deliveryDate"
                          type="date"
                          value={orderInfo.deliveryDate}
                          onChange={handleOrderChange}
                          required
                          min={
                            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split('T')[0]
                          }
                          className="pl-10 bg-white border-[#E5E7EB]"
                        />
                      </div>
                      <p className="text-xs text-[#6B7280]">Minimum 3 business days</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="poNumber">PO Number (Optional)</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                        <Input
                          id="poNumber"
                          name="poNumber"
                          value={orderInfo.poNumber}
                          onChange={handleOrderChange}
                          className="pl-10 bg-white border-[#E5E7EB]"
                          placeholder="PO-2026-XXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={orderInfo.notes}
                      onChange={handleOrderChange}
                      rows={3}
                      className="bg-white border-[#E5E7EB]"
                      placeholder="Any special instructions for delivery or packaging..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Items ({syncedItems.length})</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {syncedItems.map((item: any) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-4 pb-4 border-b border-[#E5E7EB] last:border-0"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <div className="font-semibold text-[#111827]">
                            {item.product.name}
                          </div>
                          <div className="text-sm text-[#6B7280] mt-1">
                            Quantity: {item.quantity} {item.product.unit}
                          </div>
                          <div className="text-sm text-[#6B7280]">
                            Unit Price: {Number(item.product.price).toLocaleString()} SAR
                          </div>
                          <div className="text-sm text-[#6B7280]">
                            MOQ: {item.product.moq} {item.product.unit}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-[#111827]">
                            {(Number(item.product.price) * Number(item.quantity)).toLocaleString()} SAR
                          </div>
                          <div className="text-sm text-[#6B7280]">
                            {item.quantity} × {Number(item.product.price).toLocaleString()}
                          </div>

                          {item.product.stockStatus === 'Low Stock' && (
                            <div className="text-xs text-orange-600 mt-1">Low Stock</div>
                          )}

                          {item.product.stockStatus === 'Out of Stock' && (
                            <div className="flex items-center justify-end gap-1 text-xs text-red-600 mt-1">
                              <X className="h-3 w-3" />
                              <span>Out of Stock</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Subtotal ({syncedItems.length} items)</span>
                      <span>{subtotal.toLocaleString()} SAR</span>
                    </div>

                    <div className="flex justify-between text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Shipping
                      </span>
                      <span>{shipping.toLocaleString()} SAR</span>
                    </div>

                    <div className="flex justify-between text-[#6B7280]">
                      <span>VAT (15%)</span>
                      <span>{vat.toLocaleString()} SAR</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-[#111827] text-lg">
                      <span>Total</span>
                      <span className="text-[#0F2854]">{total.toLocaleString()} SAR</span>
                    </div>
                  </div>

                  <Separator />

                  {deliveryInfo.city && (
                    <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-[#0F2854]" />
                        <span className="font-medium text-[#111827]">Delivering to:</span>
                      </div>

                      <div className="text-sm text-[#6B7280] ml-6">
                        {deliveryInfo.city}, Saudi Arabia
                      </div>

                      {orderInfo.deliveryDate && (
                        <div className="flex items-center gap-2 text-sm text-[#6B7280] ml-6">
                          <Clock className="h-3 w-3" />
                          <span>
                            Expected:{' '}
                            {new Date(orderInfo.deliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-[#0F2854] hover:underline">
                        terms and conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-[#0F2854] hover:underline">
                        privacy policy
                      </a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0F2854] hover:bg-[#1C4D8D] h-12 text-base"
                    disabled={!acceptTerms}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Continue to Payment
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Shield className="h-4 w-4" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Clock className="h-4 w-4" />
                      <span>Process time: 1-2 business days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <PackageCheck className="h-4 w-4" />
                      <span>Quality guaranteed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}