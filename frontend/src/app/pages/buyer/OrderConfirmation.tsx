import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { 
  CheckCircle2, 
  Download,
  Mail,
  ArrowRight,
  Home,
  Package
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/dropdown-menu';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state || {};

  useEffect(() => {
    // If no order data, redirect to dashboard
    if (!orderData.orderId) {
      navigate('/buyer/dashboard');
    }
  }, [orderData, navigate]);

  if (!orderData.orderId) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-12">
        {/* Success Card */}
        <Card className="border-2 border-green-500">
          <CardContent className="p-12 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-[#111827] mb-3">
              Payment Successful!
            </h1>
            <p className="text-lg text-[#6B7280] mb-8">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            <Separator className="my-8" />

            {/* Order Reference */}
            <div className="bg-[#F9FAFB] rounded-lg p-6 mb-8">
              <div className="text-sm text-[#6B7280] mb-2">Order Reference Number</div>
              <div className="text-3xl font-bold text-[#0F2854] tracking-wide mb-4">
                {orderData.orderId}
              </div>
              <div className="text-sm text-[#6B7280]">
                Please save this reference number for your records
              </div>
            </div>

            {/* Order Amount */}
            <div className="flex items-center justify-between mb-8 px-6 py-4 bg-blue-50 rounded-lg">
              <span className="text-[#6B7280] font-medium">Total Amount Paid</span>
              <span className="text-2xl font-bold text-[#0F2854]">
                {orderData.total?.toLocaleString() || '0'} SAR
              </span>
            </div>

            {/* Email Notification */}
            <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280] mb-8">
              <Mail className="h-4 w-4" />
              <span>A confirmation email has been sent to your registered email address</span>
            </div>

            <Separator className="my-8" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 bg-[#0F2854] hover:bg-[#1C4D8D] h-12"
                onClick={() => navigate('/buyer/orders')}
              >
                <Package className="h-5 w-5 mr-2" />
                View My Orders
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-12"
                onClick={() => navigate('/buyer/dashboard')}
              >
                <Home className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {/* Download Invoice */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="link" 
                  className="text-[#4988C4] hover:text-[#0F2854]"
                >
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
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6B7280] mb-2">
            Need help with your order?
          </p>
          <Button variant="link" className="text-[#0F2854]">
            Contact Support
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}