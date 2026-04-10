import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useCart } from '../../context/CartContext';
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Info,
  Package,
  Truck,
  Clock,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

type PaymentMethod = 'visa' | 'tabby' | 'tamara';
type TabbyInstallment = '4' | '3';
type TamaraInstallment = '3' | '4' | '6';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems } = useCart();

  const checkoutData = location.state || {};

  const checkoutItems = Array.isArray(checkoutData.items) ? checkoutData.items : [];
  const activeItems = checkoutItems.length > 0 ? checkoutItems : cartItems;

  const orderSummary = checkoutData.orderSummary || {};
  const subtotal =
    typeof orderSummary.subtotal === 'number'
      ? orderSummary.subtotal
      : activeItems.reduce((sum: number, item: any) => {
          return sum + Number(item?.product?.price || 0) * Number(item?.quantity || 0);
        }, 0);

  const shipping =
    typeof orderSummary.shipping === 'number'
      ? orderSummary.shipping
      : subtotal >= 5000
      ? 0
      : activeItems.length > 0
      ? 500
      : 0;

  const vat =
    typeof orderSummary.vat === 'number'
      ? orderSummary.vat
      : (subtotal + shipping) * 0.15;

  const total =
    typeof orderSummary.total === 'number'
      ? orderSummary.total
      : subtotal + shipping + vat;

  const discount = typeof checkoutData.discount === 'number' ? checkoutData.discount : 0;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('visa');
  const [tabbyInstallment, setTabbyInstallment] = useState<TabbyInstallment>('4');
  const [tamaraInstallment, setTamaraInstallment] = useState<TamaraInstallment>('3');
  const [processing, setProcessing] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryDateChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);

    if (cleaned.length >= 3) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const calculateInstallment = (installments: number) => {
    return (total / installments).toFixed(2);
  };

  const validateVisaFields = () => {
    const cleanedCard = cardNumber.replace(/\s/g, '');

    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast.error('Please fill in all card details');
      return false;
    }

    if (cleanedCard.length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      toast.error('Please enter a valid expiry date in MM/YY format');
      return false;
    }

    if (cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return false;
    }

    return true;
  };

  const validatePaymentContext = () => {
    if (!activeItems || activeItems.length === 0) {
      toast.error('No items available for payment');
      return false;
    }

    if (!checkoutData.fromCheckout) {
      toast.error('Please complete checkout details first');
      navigate('/buyer/checkout');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePaymentContext()) {
      return;
    }

    if (paymentMethod === 'visa' && !validateVisaFields()) {
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);

      navigate('/buyer/payment/otp', {
        state: {
          fromPayment: true,
          paymentMethod,
          total,
          subtotal,
          shipping,
          vat,
          discount,
          items: activeItems,
          deliveryInfo: checkoutData.deliveryInfo,
          billingInfo: checkoutData.billingInfo,
          orderInfo: checkoutData.orderInfo,
          deliveryAddress: checkoutData.deliveryAddress,
          installments:
            paymentMethod === 'tabby'
              ? tabbyInstallment
              : paymentMethod === 'tamara'
              ? tamaraInstallment
              : null,
          installmentAmount:
            paymentMethod === 'visa'
              ? null
              : paymentMethod === 'tabby'
              ? calculateInstallment(parseInt(tabbyInstallment, 10))
              : calculateInstallment(parseInt(tamaraInstallment, 10)),
          cardPreview:
            paymentMethod === 'visa'
              ? {
                  cardName,
                  last4: cardNumber.replace(/\s/g, '').slice(-4),
                }
              : null,
        },
      });
    }, 1500);
  };

  if (activeItems.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-16 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-[#6B7280]" />
              <h2 className="text-2xl font-bold text-[#111827] mb-2">No items to pay for</h2>
              <p className="text-[#6B7280] mb-6">
                Your cart is empty. Please add items before proceeding to payment.
              </p>
              <Button
                onClick={() => navigate('/marketplace')}
                className="bg-[#0F2854] hover:bg-[#1C4D8D]"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[#0F2854]">Payment</h1>
          <p className="text-[#6B7280] mt-1">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <span className="font-medium">Secure Payment:</span> Your payment information is encrypted and secure
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment option</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                >
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'visa'
                          ? 'border-[#0F2854] bg-blue-50'
                          : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                      }`}
                      onClick={() => setPaymentMethod('visa')}
                    >
                      <RadioGroupItem value="visa" id="visa" />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#0F2854] rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <Label htmlFor="visa" className="font-semibold text-[#111827] cursor-pointer">
                              Credit / Debit Card
                            </Label>
                            <p className="text-sm text-[#6B7280]">Visa, Mastercard, Mada</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                            alt="Visa"
                            className="h-8"
                          />
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                            alt="Mastercard"
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'tabby'
                          ? 'border-[#0F2854] bg-blue-50'
                          : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                      }`}
                      onClick={() => setPaymentMethod('tabby')}
                    >
                      <RadioGroupItem value="tabby" id="tabby" />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#3EFFC6] rounded-lg flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-black" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="tabby" className="font-semibold text-[#111827] cursor-pointer">
                                Tabby
                              </Label>
                              <Badge variant="outline" className="bg-[#3EFFC6] text-black border-[#3EFFC6]">
                                Interest-free
                              </Badge>
                            </div>
                            <p className="text-sm text-[#6B7280]">Split into 4 payments, no interest</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#111827]">
                            {calculateInstallment(4)} SAR × 4
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'tamara'
                          ? 'border-[#0F2854] bg-blue-50'
                          : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                      }`}
                      onClick={() => setPaymentMethod('tamara')}
                    >
                      <RadioGroupItem value="tamara" id="tamara" />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#00C853] rounded-lg flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="tamara" className="font-semibold text-[#111827] cursor-pointer">
                                Tamara
                              </Label>
                              <Badge variant="outline" className="bg-[#00C853] text-white border-[#00C853]">
                                0% Interest
                              </Badge>
                            </div>
                            <p className="text-sm text-[#6B7280]">Pay in 3, 4, or 6 installments</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#111827]">
                            {calculateInstallment(3)} SAR × 3
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {paymentMethod === 'visa' && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Information</CardTitle>
                  <CardDescription>Enter your card details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        maxLength={19}
                        className="bg-white border-[#E5E7EB] pl-10"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <div className="relative">
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => handleExpiryDateChange(e.target.value)}
                          maxLength={5}
                          className="bg-white border-[#E5E7EB] pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <div className="relative">
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                          className="bg-white border-[#E5E7EB] pl-10"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                      </div>
                    </div>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Your card information is encrypted and never stored on our servers
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'tabby' && (
              <Card>
                <CardHeader>
                  <CardTitle>Tabby Payment Plan</CardTitle>
                  <CardDescription>Choose your installment plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={tabbyInstallment}
                    onValueChange={(value) => setTabbyInstallment(value as TabbyInstallment)}
                  >
                    <div className="space-y-3">
                      <div
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                          tabbyInstallment === '4' ? 'border-[#3EFFC6] bg-green-50' : 'border-[#E5E7EB]'
                        }`}
                        onClick={() => setTabbyInstallment('4')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="4" id="tabby-4" />
                          <Label htmlFor="tabby-4" className="cursor-pointer">
                            <div className="font-semibold text-[#111827]">Split in 4</div>
                            <div className="text-sm text-[#6B7280]">Every 2 weeks</div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#111827]">{calculateInstallment(4)} SAR</div>
                          <div className="text-sm text-[#6B7280]">per payment</div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                          tabbyInstallment === '3' ? 'border-[#3EFFC6] bg-green-50' : 'border-[#E5E7EB]'
                        }`}
                        onClick={() => setTabbyInstallment('3')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="3" id="tabby-3" />
                          <Label htmlFor="tabby-3" className="cursor-pointer">
                            <div className="font-semibold text-[#111827]">Split in 3</div>
                            <div className="text-sm text-[#6B7280]">Monthly payments</div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#111827]">{calculateInstallment(3)} SAR</div>
                          <div className="text-sm text-[#6B7280]">per payment</div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      <span className="font-medium">No interest, no fees.</span> First payment today, remaining payments automatically charged.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280]">Payment 1 (Today)</span>
                      <span className="font-medium text-[#111827]">
                        {calculateInstallment(parseInt(tabbyInstallment, 10))} SAR
                      </span>
                    </div>

                    {Array.from({ length: parseInt(tabbyInstallment, 10) - 1 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-[#6B7280]">
                          Payment {i + 2} ({tabbyInstallment === '4' ? `${(i + 1) * 2} weeks` : `${i + 1} month${i > 0 ? 's' : ''}`})
                        </span>
                        <span className="font-medium text-[#111827]">
                          {calculateInstallment(parseInt(tabbyInstallment, 10))} SAR
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'tamara' && (
              <Card>
                <CardHeader>
                  <CardTitle>Tamara Payment Plan</CardTitle>
                  <CardDescription>Select your preferred installment option</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={tamaraInstallment}
                    onValueChange={(value) => setTamaraInstallment(value as TamaraInstallment)}
                  >
                    <div className="space-y-3">
                      <div
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                          tamaraInstallment === '3' ? 'border-[#00C853] bg-green-50' : 'border-[#E5E7EB]'
                        }`}
                        onClick={() => setTamaraInstallment('3')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="3" id="tamara-3" />
                          <Label htmlFor="tamara-3" className="cursor-pointer">
                            <div className="font-semibold text-[#111827]">3 Monthly Payments</div>
                            <div className="text-sm text-[#6B7280]">Most popular</div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#111827]">{calculateInstallment(3)} SAR</div>
                          <div className="text-sm text-[#6B7280]">per month</div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                          tamaraInstallment === '4' ? 'border-[#00C853] bg-green-50' : 'border-[#E5E7EB]'
                        }`}
                        onClick={() => setTamaraInstallment('4')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="4" id="tamara-4" />
                          <Label htmlFor="tamara-4" className="cursor-pointer">
                            <div className="font-semibold text-[#111827]">4 Monthly Payments</div>
                            <div className="text-sm text-[#6B7280]">Lower monthly amount</div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#111827]">{calculateInstallment(4)} SAR</div>
                          <div className="text-sm text-[#6B7280]">per month</div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                          tamaraInstallment === '6' ? 'border-[#00C853] bg-green-50' : 'border-[#E5E7EB]'
                        }`}
                        onClick={() => setTamaraInstallment('6')}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="6" id="tamara-6" />
                          <Label htmlFor="tamara-6" className="cursor-pointer">
                            <div className="font-semibold text-[#111827]">6 Monthly Payments</div>
                            <div className="text-sm text-[#6B7280]">Lowest monthly amount</div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#111827]">{calculateInstallment(6)} SAR</div>
                          <div className="text-sm text-[#6B7280]">per month</div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      <span className="font-medium">0% interest.</span> First payment today, rest split over {tamaraInstallment} months.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-2">
                    {Array.from({ length: parseInt(tamaraInstallment, 10) }, (_, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-[#6B7280]">
                          Payment {i + 1} {i === 0 ? '(Today)' : `(${i} month${i > 1 ? 's' : ''})`}
                        </span>
                        <span className="font-medium text-[#111827]">
                          {calculateInstallment(parseInt(tamaraInstallment, 10))} SAR
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="text-sm text-[#6B7280]">
                      {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'}
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {activeItems.slice(0, 3).map((item: any) => (
                        <div key={item.product.id} className="flex gap-2 text-sm">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#111827] truncate">
                              {item.product.name}
                            </div>
                            <div className="text-[#6B7280]">
                              {item.quantity} × {Number(item.product.price).toLocaleString()} SAR
                            </div>
                          </div>
                        </div>
                      ))}

                      {activeItems.length > 3 && (
                        <div className="text-sm text-[#6B7280]">
                          +{activeItems.length - 3} more {activeItems.length - 3 === 1 ? 'item' : 'items'}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Subtotal</span>
                      <span>{subtotal.toLocaleString()} SAR</span>
                    </div>

                    <div className="flex justify-between text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Shipping
                      </span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `${shipping.toLocaleString()} SAR`
                        )}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{discount.toLocaleString()} SAR</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#6B7280]">
                      <span>VAT (15%)</span>
                      <span>{vat.toLocaleString()} SAR</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-[#111827] text-xl">
                      <span>Total</span>
                      <span className="text-[#0F2854]">{total.toLocaleString()} SAR</span>
                    </div>

                    {paymentMethod !== 'visa' && (
                      <div className="bg-[#F9FAFB] p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-[#0F2854]" />
                          <span className="text-sm font-medium text-[#111827]">Payment Schedule</span>
                        </div>
                        <div className="text-sm text-[#6B7280]">
                          {paymentMethod === 'tabby'
                            ? `${tabbyInstallment} payments of ${calculateInstallment(parseInt(tabbyInstallment, 10))} SAR`
                            : `${tamaraInstallment} payments of ${calculateInstallment(parseInt(tamaraInstallment, 10))} SAR`}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {checkoutData.deliveryAddress && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                        <Truck className="h-4 w-4 text-[#0F2854]" />
                        Delivery Address
                      </div>
                      <div className="text-sm text-[#6B7280] bg-[#F9FAFB] p-3 rounded-lg">
                        {checkoutData.deliveryAddress}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-[#0F2854] hover:bg-[#1C4D8D] h-12 text-base"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Complete Payment
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="pt-4 space-y-2 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Shield className="h-4 w-4 text-[#0F2854]" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <CheckCircle className="h-4 w-4 text-[#0F2854]" />
                      <span>PCI DSS compliant</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Lock className="h-4 w-4 text-[#0F2854]" />
                      <span>Secure payment gateway</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}