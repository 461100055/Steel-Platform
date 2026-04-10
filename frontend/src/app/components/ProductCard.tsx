import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Star, ShoppingCart, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

function getProductImage(product: Product) {
  if (product.image && String(product.image).trim()) return String(product.image);
  if (Array.isArray(product.images) && product.images.length > 0) return String(product.images[0]);
  return 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400';
}

function getProductPrice(product: Product) {
  const value = Number(product.price ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getProductMoq(product: Product) {
  const value = Number(product.moq ?? product.min_order_quantity ?? 1);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function getProductRating(product: Product) {
  const value = Number((product as any).rating ?? 4.5);
  return Number.isFinite(value) ? value : 4.5;
}

function getSupplierName(product: Product) {
  return String(
    (product as any).supplierName ||
      (product as any).supplier_name ||
      'Verified Supplier'
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const price = getProductPrice(product);
  const moq = getProductMoq(product);
  const rating = getProductRating(product);
  const image = getProductImage(product);
  const supplierName = getSupplierName(product);
  const unit = String(product.unit || 'unit');

  const handleAddToCart = () => {
    addToCart(product, moq);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/marketplace/product/${product.id}`}>
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={String(product.name)}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/marketplace/product/${product.id}`}>
          <h3 className="mb-1 font-semibold text-[#111827] hover:text-[#4988C4]">
            {String(product.name)}
          </h3>
        </Link>

        <p className="mb-2 text-sm text-[#6B7280]">{supplierName}</p>

        <div className="mb-3 flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-bold text-[#0F2854]">
            {price.toLocaleString()} SAR
          </div>
          <div className="text-sm text-[#6B7280]">per {unit}</div>
          <div className="text-sm text-[#6B7280]">
            MOQ: {moq} {unit}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-[#0F2854] hover:bg-[#1C4D8D]"
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            Add to Cart
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/buyer/rfq/new?product=${product.id}`)}
            className="border-[#4988C4] text-[#4988C4] hover:bg-[#4988C4] hover:text-white"
          >
            <FileText className="mr-1 h-4 w-4" />
            RFQ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}