import { Link } from 'react-router-dom';
import { Supplier } from '../lib/mock-data';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin, ShoppingBag } from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <Link to={`/marketplace/supplier/${supplier.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={supplier.image}
            alt={supplier.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 font-semibold text-[#111827] hover:text-[#4988C4]">
            {supplier.name}
          </h3>

          <div className="mb-3 flex items-center gap-4 text-sm text-[#6B7280]">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{supplier.rating}</span>
            </div>

            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span>{supplier.totalOrders} orders</span>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-1 text-sm text-[#6B7280]">
            <MapPin className="h-4 w-4" />
            <span>{supplier.city}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {supplier.categories.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}

            {supplier.categories.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{supplier.categories.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}