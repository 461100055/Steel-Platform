import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useCart } from '../../context/CartContext';
import {
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  Package,
  Truck,
  Shield,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Store,
  ShoppingCart,
  ChevronRight,
  X,
  Percent,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { toast } from 'sonner';
import { getProducts } from '../../lib/api';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [syncedItems, setSyncedItems] = useState<any[]>([]);

  useEffect(() => {
    const syncCartWithBackend = async () => {
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
              image:
                matched?.image ||
                matched?.images?.[0] ||
                item.product.image,
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
        console.error('Failed to sync cart with backend:', error);
        setSyncError(error?.message || 'Failed to sync cart with server');
        setSyncedItems(items || []);
      } finally {
        setLoading(false);
      }
    };

    syncCartWithBackend();
  }, [items]);

  const subtotal = useMemo(() => {
    return syncedItems.reduce((sum: number, item: any) => {
      return sum + Number(item.product.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [syncedItems]);

  const shipping = syncedItems.length > 0 ? (subtotal >= 5000 ? 0 : 500) : 0;
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const vat = Math.max(0, (subtotal + shipping - discount) * 0.15);
  const total = subtotal + shipping - discount + vat;

  const handleQuantityChange = (
    productId: string | number,
    newQuantity: number,
    moq: number,
    inventory?: number
  ) => {
    if (newQuantity < moq) {
      toast.error(`Minimum order quantity is ${moq}`);
      return;
    }

    if (inventory !== undefined && inventory > 0 && newQuantity > inventory) {
      toast.error(`Only ${inventory} units available in stock`);
      return;
    }

    updateQuantity(productId, newQuantity);
  };

  const handleApplyPromo = () => {
    const validPromoCodes: { [key: string]: number } = {
      STEEL10: 100,
      WELCOME: 200,
      BULK500: 500,
    };

    const code = promoCode.toUpperCase().trim();

    if (validPromoCodes[code]) {
      setAppliedPromo({
        code,
        discount: validPromoCodes[code],
      });

      toast.success(`Promo code "${code}" applied!`, {
        description: `You saved ${validPromoCodes[code]} SAR`,
      });

      setPromoCode('');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success('Promo code removed');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleProceedToCheckout = () => {
    const invalidItem = syncedItems.find((item: any) => {
      const moq = Number(item.product.moq || 1);
      const inventory = Number(item.product.inventory || 0);

      if (item.quantity < moq) return true;
      if (inventory > 0 && item.quantity > inventory) return true;
      if (inventory <= 0) return true;

      return false;
    });

    if (invalidItem) {
      toast.error(`Please review quantity for "${invalidItem.product.name}"`);
      return;
    }

    navigate('/buyer/checkout');
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryStart = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const deliveryEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      start: deliveryStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      end: deliveryEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  };

  const estimatedDelivery = getEstimatedDelivery();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0F2854] mb-8">Shopping Cart</h1>
          <Card>
            <CardContent className="p-10">
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

  if (syncedItems.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0F2854] mb-8">Shopping Cart</h1>
          <Card>
            <CardContent className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F3F4F6] mb-6">
                <ShoppingCart className="h-10 w-10 text-[#6B7280]" />
              </div>
              <h2 className="text-2xl font-bold text-[#111827] mb-2">Your cart is empty</h2>
              <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
                Looks like you haven't added any products to your cart yet. Browse our marketplace to find quality steel products.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate('/marketplace')}
                  className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
                <Button
                  onClick={() => navigate('/buyer/dashboard')}
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854]">Shopping Cart</h1>
            <p className="text-[#6B7280] mt-1">
              {syncedItems.length} {syncedItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        {syncError && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Server sync warning</AlertTitle>
            <AlertDescription className="text-orange-700">
              {syncError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Truck className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Free shipping on orders over 5,000 SAR</AlertTitle>
              <AlertDescription className="text-blue-700">
                {subtotal >= 5000
                  ? 'You\'re eligible for free shipping!'
                  : `${(5000 - subtotal).toLocaleString()} SAR away from free shipping`}
              </AlertDescription>
            </Alert>

            {syncedItems.map((item: any) => {
              const itemTotal = Number(item.product.price) * Number(item.quantity);
              const meetsMinimum = item.quantity >= item.product.moq;
              const stockStatus = item.product.stockStatus || 'In Stock';

              return (
                <Card key={item.product.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative flex-shrink-0">
                        <Link to={`/marketplace/product/${item.product.id}`}>
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-32 h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                          />
                        </Link>
                        {item.product.badge && (
                          <Badge className="absolute top-2 left-2 bg-[#0F2854]">
                            {item.product.badge}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Link
                              to={`/marketplace/product/${item.product.id}`}
                              className="font-semibold text-lg text-[#111827] hover:text-[#0F2854] transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Store className="h-4 w-4 text-[#6B7280]" />
                              <span className="text-sm text-[#6B7280]">
                                {item.product.supplierName}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeFromCart(item.product.id);
                              toast.success('Item removed from cart');
                            }}
                            className="text-[#6B7280] hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {stockStatus === 'In Stock' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">In Stock</span>
                            </>
                          ) : stockStatus === 'Low Stock' ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-700 font-medium">Low Stock</span>
                            </>
                          ) : stockStatus === 'Out of Stock' ? (
                            <>
                              <X className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-700 font-medium">Out of Stock</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-700 font-medium">Made to Order</span>
                            </>
                          )}
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-sm text-[#6B7280]">
                            MOQ: {item.product.moq} {item.product.unit}
                          </span>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className="space-y-2">
                            <div className="text-sm text-[#6B7280]">
                              Price per {item.product.unit}
                            </div>
                            <div className="text-lg font-bold text-[#0F2854]">
                              {Number(item.product.price).toLocaleString()} SAR
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-2">
                              <Label className="text-sm text-[#6B7280]">Quantity</Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.product.id,
                                      item.quantity - 1,
                                      item.product.moq,
                                      item.product.inventory
                                    )
                                  }
                                  disabled={item.quantity <= item.product.moq}
                                  className="h-9 w-9 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>

                                <Input
                                  type="number"
                                  min={item.product.moq}
                                  max={
                                    item.product.inventory && item.product.inventory > 0
                                      ? item.product.inventory
                                      : undefined
                                  }
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.product.id,
                                      parseInt(e.target.value, 10) || item.product.moq,
                                      item.product.moq,
                                      item.product.inventory
                                    )
                                  }
                                  className="w-20 text-center bg-white border-[#E5E7EB] h-9"
                                />

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.product.id,
                                      item.quantity + 1,
                                      item.product.moq,
                                      item.product.inventory
                                    )
                                  }
                                  className="h-9 w-9 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>

                                <span className="text-sm text-[#6B7280] min-w-[60px]">
                                  {item.product.unit}
                                </span>
                              </div>
                            </div>

                            <div className="text-right min-w-[120px]">
                              <div className="text-sm text-[#6B7280] mb-1">Item Total</div>
                              <div className="text-xl font-bold text-[#111827]">
                                {itemTotal.toLocaleString()} SAR
                              </div>
                            </div>
                          </div>
                        </div>

                        {!meetsMinimum && (
                          <Alert className="mt-4 border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                              Minimum order quantity is {item.product.moq} {item.product.unit}
                            </AlertDescription>
                          </Alert>
                        )}

                        {item.product.inventory !== undefined && item.product.inventory <= 0 && (
                          <Alert className="mt-4 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              This product is currently out of stock.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="pt-4">
              <Button
                onClick={() => navigate('/marketplace')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>

          <div>
            <div className="sticky top-8 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="h-5 w-5" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900">{appliedPromo.code}</div>
                          <div className="text-sm text-green-700">-{appliedPromo.discount} SAR</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                        className="text-green-700 hover:text-green-800 hover:bg-green-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                          className="bg-white border-[#E5E7EB]"
                        />
                        <Button
                          onClick={handleApplyPromo}
                          variant="outline"
                          disabled={!promoCode.trim()}
                        >
                          Apply
                        </Button>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        Try: STEEL10, WELCOME, BULK500
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
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
                      <span>
                        {subtotal >= 5000 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `${shipping.toLocaleString()} SAR`
                        )}
                      </span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          Discount ({appliedPromo.code})
                        </span>
                        <span>-{appliedPromo.discount.toLocaleString()} SAR</span>
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
                  </div>

                  <Separator />

                  <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-[#0F2854]" />
                      <span className="font-medium text-[#111827]">Estimated Delivery</span>
                    </div>
                    <div className="text-sm text-[#6B7280] ml-6">
                      {estimatedDelivery.start} - {estimatedDelivery.end}
                    </div>
                  </div>

                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#0F2854] hover:bg-[#1C4D8D] h-12 text-base"
                  >
                    Proceed to Checkout
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>

                  <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Shield className="h-4 w-4 text-[#0F2854]" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <CheckCircle className="h-4 w-4 text-[#0F2854]" />
                      <span>Quality guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Truck className="h-4 w-4 text-[#0F2854]" />
                      <span>Fast delivery</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#F9FAFB] border-[#E5E7EB]">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-[#0F2854] flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-[#111827] mb-1">Need help?</p>
                      <p className="text-[#6B7280]">
                        Contact our support team for assistance with your order.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-[#0F2854]">
                        Contact Support
                      </Button>
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