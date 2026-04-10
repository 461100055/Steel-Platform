import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ProductCard } from '../../components/ProductCard';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { mockSuppliers, mockProducts } from '../../lib/mock-data';
import { 
  Package, 
  Star, 
  Award, 
  MapPin,
  ShoppingBag
} from 'lucide-react';

export default function SupplierProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const supplier = mockSuppliers.find(s => s.id === id) || mockSuppliers[0];
  const supplierProducts = mockProducts.filter(p => p.supplierId === supplier.id);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <MarketplaceHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Supplier Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex gap-6">
              <img
                src={supplier.image}
                alt={supplier.name}
                className="w-32 h-32 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[#111827] mb-2">{supplier.name}</h1>
                    <div className="flex items-center gap-4 text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{supplier.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-[#111827]">{supplier.rating}</span>
                        <span>(256 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                    Contact Supplier
                  </Button>
                </div>
                
                <p className="text-[#6B7280] mb-4">{supplier.description}</p>

                <div className="flex flex-wrap gap-2">
                  {supplier.categories.map(cat => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Supplier Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-[#E5E7EB]">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShoppingBag className="h-5 w-5 text-[#4988C4]" />
                  <span className="text-2xl font-bold text-[#111827]">{supplier.totalOrders}+</span>
                </div>
                <div className="text-[#6B7280]">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-[#4988C4]" />
                  <span className="text-2xl font-bold text-[#111827]">{supplierProducts.length}</span>
                </div>
                <div className="text-[#6B7280]">Active Products</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-[#4988C4]" />
                  <span className="text-2xl font-bold text-[#111827]">30+</span>
                </div>
                <div className="text-[#6B7280]">Years Experience</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F2854] mb-2">Products</h2>
              <p className="text-[#6B7280]">{supplierProducts.length} products available</p>
            </div>
          </div>

          {supplierProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#111827] mb-2">No products available</h3>
                <p className="text-[#6B7280]">This supplier hasn't listed any products yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supplierProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}