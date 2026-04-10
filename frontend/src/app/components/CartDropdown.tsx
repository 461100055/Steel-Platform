import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  ShoppingCart,
  X,
  ArrowRight,
  Package,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export function CartDropdown() {
  const { items, removeFromCart, totalItems, subtotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 transition-colors hover:bg-[#F3F4F6]"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-6 w-6 text-[#111827]" />
        {totalItems > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-[#0F2854] p-0 hover:bg-[#0F2854]">
            {totalItems > 9 ? '9+' : totalItems}
          </Badge>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96">
          <Card className="border-[#E5E7EB] shadow-xl">
            <div className="border-b border-[#E5E7EB] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#111827]">
                  Shopping Cart {totalItems > 0 && `(${totalItems})`}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 hover:bg-[#F3F4F6]"
                >
                  <X className="h-5 w-5 text-[#6B7280]" />
                </button>
              </div>
            </div>

            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6]">
                    <Package className="h-8 w-8 text-[#6B7280]" />
                  </div>
                  <p className="mb-4 text-[#6B7280]">Your cart is empty</p>
                  <Button
                    size="sm"
                    className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/marketplace');
                    }}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <>
                  <div className="max-h-80 overflow-y-auto">
                    {items.slice(0, 4).map((item, index) => (
                      <div key={item.product.id}>
                        <div className="p-4 transition-colors hover:bg-[#F9FAFB]">
                          <div className="flex gap-3">
                            <Link
                              to={`/marketplace/product/${item.product.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex-shrink-0"
                            >
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="h-16 w-16 rounded-lg object-cover transition-opacity hover:opacity-80"
                              />
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/marketplace/product/${item.product.id}`}
                                onClick={() => setIsOpen(false)}
                                className="line-clamp-2 text-sm font-medium text-[#111827] transition-colors hover:text-[#0F2854]"
                              >
                                {item.product.name}
                              </Link>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-[#6B7280]">
                                    {item.quantity} {item.product.unit}
                                  </span>
                                  <span className="ml-2 font-medium text-[#111827]">
                                    {(
                                      item.product.price * item.quantity
                                    ).toLocaleString()}{' '}
                                    SAR
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveItem(
                                      item.product.id,
                                      item.product.name
                                    )
                                  }
                                  className="rounded p-1 text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < Math.min(items.length - 1, 3) && <Separator />}
                      </div>
                    ))}

                    {items.length > 4 && (
                      <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-3 text-center">
                        <Link
                          to="/buyer/cart"
                          onClick={() => setIsOpen(false)}
                          className="text-sm font-medium text-[#0F2854] hover:text-[#1C4D8D]"
                        >
                          View {items.length - 4} more{' '}
                          {items.length - 4 === 1 ? 'item' : 'items'}
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Subtotal:</span>
                      <span className="font-bold text-[#111827]">
                        {subtotal.toLocaleString()} SAR
                      </span>
                    </div>
                    <div className="mb-3 text-xs text-[#6B7280]">
                      Shipping and taxes calculated at checkout
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/buyer/cart');
                        }}
                      >
                        View Cart
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-[#0F2854] hover:bg-[#1C4D8D]"
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/buyer/checkout');
                        }}
                      >
                        Checkout
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}