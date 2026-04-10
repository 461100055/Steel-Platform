import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Shield,
  Lock,
  CheckCircle,
  ArrowLeft,
  Smartphone,
  Mail,
  Clock,
  AlertCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../lib/api';

export default function PaymentOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const paymentData = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!paymentData.paymentMethod || !paymentData.items || !paymentData.items.length) {
      navigate('/buyer/cart');
    }
  }, [paymentData, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    setCanResend(true);
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      toast.error('Invalid OTP format', {
        description: 'Please paste a valid 6-digit code',
      });
      return;
    }

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    setError('');

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const getPaymentMethodLabel = () => {
    switch (paymentData.paymentMethod) {
      case 'visa':
        return 'Credit/Debit Card';
      case 'tabby':
        return 'Tabby';
      case 'tamara':
        return 'Tamara';
      default:
        return 'Payment';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const buildOrderPayload = () => {
    const items = Array.isArray(paymentData.items) ? paymentData.items : [];
    const orderInfo = paymentData.orderInfo || {};
    const deliveryInfo = paymentData.deliveryInfo || {};
    const billingInfo = paymentData.billingInfo || {};

    return {
      items: items.map((item: any) => ({
        product: item.product.id,
        quantity: Number(item.quantity),
        price: Number(item.product.price),
        name: item.product.name,
        unit: item.product.unit,
        moq: Number(item.product.moq || 1),
      })),
      subtotal: Number(paymentData.subtotal || 0),
      shipping: Number(paymentData.shipping || 0),
      tax: Number(paymentData.vat || 0),
      vat: Number(paymentData.vat || 0),
      total: Number(paymentData.total || 0),
      notes: orderInfo.notes || '',
      payment_method: paymentData.paymentMethod,
      installment_plan: paymentData.installments || null,
      installment_amount: paymentData.installmentAmount
        ? Number(paymentData.installmentAmount)
        : null,
      po_number: orderInfo.poNumber || '',
      preferred_delivery_date: orderInfo.deliveryDate || null,
      delivery_address: paymentData.deliveryAddress || '',
      delivery_info: deliveryInfo,
      billing_info: billingInfo,
      order_info: orderInfo,
    };
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    if (attempts >= maxAttempts) {
      setError('Maximum verification attempts exceeded. Please request a new code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Demo rule for now
      if (!otpCode.startsWith('1')) {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        const remainingAttempts = maxAttempts - nextAttempts;

        if (remainingAttempts > 0) {
          setError(
            `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
          );
          toast.error('Verification Failed', {
            description: `Invalid code. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} left.`,
          });
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } else {
          setError('Maximum attempts exceeded. Please request a new verification code.');
          toast.error('Verification Failed', {
            description: 'Please request a new code to continue.',
          });
        }

        return;
      }

      const orderPayload = buildOrderPayload();
      const createdOrder = await createOrder(orderPayload);

      clearCart();

      toast.success('Payment Verified Successfully', {
        description: 'Your order has been created successfully',
      });

      const orderId =
        createdOrder?.order_number ||
        createdOrder?.orderId ||
        createdOrder?.id ||
        `ORD-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

      navigate('/buyer/payment/success', {
        state: {
          fromOtp: true,
          orderId,
          orderData: createdOrder,
          paymentMethod: paymentData.paymentMethod,
          total: paymentData.total,
          subtotal: paymentData.subtotal,
          shipping: paymentData.shipping,
          vat: paymentData.vat,
          installments: paymentData.installments,
          installmentAmount: paymentData.installmentAmount,
          deliveryAddress: paymentData.deliveryAddress,
          deliveryInfo: paymentData.deliveryInfo,
        },
      });
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err?.message || 'Failed to complete payment and create order');
      toast.error('Order creation failed', {
        description: err?.message || 'Please try again',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;

    setOtp(['', '', '', '', '', '']);
    setCountdown(120);
    setCanResend(false);
    setError('');
    setAttempts(0);
    inputRefs.current[0]?.focus();

    toast.success('New Code Sent', {
      description: 'A new verification code has been sent to your phone and email',
    });
  };

  if (!paymentData.paymentMethod) {
    return null;
  }

  const isOtpComplete = otp.every((digit) => digit !== '');
  const isBlocked = attempts >= maxAttempts && !canResend;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payment
        </Button>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-6 pt-12 px-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 mx-auto mb-6">
              <Shield className="h-10 w-10 text-[#0F2854]" />
            </div>

            <CardTitle className="text-3xl font-bold text-[#0F2854] mb-3">
              Payment Verification
            </CardTitle>

            <CardDescription className="text-base text-[#6B7280] max-w-md mx-auto leading-relaxed">
              To secure your transaction, please enter the 6-digit verification code we've sent to your registered contact details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-blue-300">
                  <Smartphone className="h-5 w-5 text-[#0F2854]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">SMS Sent To</div>
                  <div className="text-base font-semibold text-[#111827]">+966 *** *** **45</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-blue-300">
                  <Mail className="h-5 w-5 text-[#0F2854]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Email Sent To</div>
                  <div className="text-base font-semibold text-[#111827]">user@*****.com</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <label className="block text-sm font-semibold text-[#111827] mb-4 uppercase tracking-wide">
                  Enter Verification Code
                </label>
              </div>

              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-14 h-16 text-center text-2xl font-bold border-2 transition-all duration-200 ${
                      digit
                        ? 'border-[#0F2854] bg-blue-50 text-[#0F2854]'
                        : 'border-[#D1D5DB] bg-white hover:border-[#9CA3AF] focus:border-[#0F2854]'
                    } ${error && !digit ? 'border-red-300 bg-red-50' : ''}`}
                    disabled={isVerifying || isBlocked}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                <Info className="h-4 w-4" />
                <span>Code valid for {formatTime(countdown)}</span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-2">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between bg-[#F9FAFB] rounded-lg p-4 border">
              <div className="flex items-center gap-3">
                <Clock className={`h-5 w-5 ${countdown <= 30 ? 'text-red-600 animate-pulse' : 'text-[#6B7280]'}`} />
                <div>
                  <div className="text-xs text-[#6B7280] font-medium">Time Remaining</div>
                  <div className={`text-lg font-bold ${countdown <= 30 ? 'text-red-600' : 'text-[#111827]'}`}>
                    {countdown > 0 ? formatTime(countdown) : 'Expired'}
                  </div>
                </div>
              </div>

              <Button
                variant={canResend ? 'default' : 'outline'}
                onClick={handleResendOtp}
                disabled={!canResend || isVerifying}
                className={canResend ? 'bg-[#0F2854] hover:bg-[#1C4D8D]' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${!canResend ? 'opacity-50' : ''}`} />
                Resend Code
              </Button>
            </div>

            <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border-2 border-blue-300 rounded-xl p-6 space-y-4">
              <div className="text-sm font-semibold text-[#0F2854] uppercase tracking-wide mb-3">
                Transaction Summary
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                  <span className="text-sm font-medium text-[#6B7280]">Payment Method</span>
                  <span className="font-semibold text-[#111827]">{getPaymentMethodLabel()}</span>
                </div>

                {paymentData.installments && (
                  <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                    <span className="text-sm font-medium text-[#6B7280]">Installment Plan</span>
                    <span className="font-semibold text-[#111827]">
                      {paymentData.installments} payments • 0% interest
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-semibold text-[#111827]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#0F2854]">
                    {Number(paymentData.total || 0).toLocaleString()} SAR
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifying || !isOtpComplete || isBlocked}
              className="w-full bg-[#0F2854] hover:bg-[#1C4D8D] h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                  Verifying Code...
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Verify & Complete Payment
                </>
              )}
            </Button>

            <Alert className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <Lock className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-900 text-sm font-medium ml-2">
                <span className="font-bold">Secure Transaction:</span> Your payment is protected with industry-standard encryption and two-factor authentication
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-3 pt-4 border-t">
              <p className="text-sm text-[#6B7280] font-medium">
                Didn't receive the verification code?
              </p>

              <div className="flex items-center justify-center gap-4 text-sm">
                <button
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className="text-[#0F2854] hover:text-[#1C4D8D] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend Code
                </button>
                <span className="text-[#D1D5DB]">•</span>
                <button className="text-[#0F2854] hover:text-[#1C4D8D] font-medium">
                  Contact Support
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-900 font-medium">
                <span className="font-bold">Demo Mode:</span> Use any code starting with "1" (e.g., 123456) to verify payment
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-[#6B7280]">
            Need assistance with payment verification?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="link" className="text-[#0F2854] font-semibold">
              View Help Guide
            </Button>
            <span className="text-[#D1D5DB]">•</span>
            <Button variant="link" className="text-[#0F2854] font-semibold">
              Call Support: +966 800 123 4567
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}