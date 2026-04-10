import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ProductCard } from '../../components/ProductCard';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { Package, AlertTriangle } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { getProducts, type Product } from '../../lib/api';

function getProductPrice(product: Product) {
  const value = Number(product.price ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getProductRating(product: Product) {
  const value = Number((product as any).rating ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getProductName(product: Product) {
  return String(product.name || '').trim();
}

function getProductDescription(product: Product) {
  return String(product.description || '').trim();
}

function getProductCategory(product: Product) {
  return String(product.category || '').trim();
}

export default function ProductListing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setPageError('');

        const response = await getProducts();
        const productsData = Array.isArray(response) ? response : response?.results || [];

        setProducts(productsData);
      } catch (error: any) {
        console.error('Failed to load products:', error);
        setPageError(error?.message || 'Failed to load products.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => getProductCategory(product))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const name = getProductName(product).toLowerCase();
      const description = getProductDescription(product).toLowerCase();
      const category = getProductCategory(product);

      const matchesSearch =
        normalizedSearch === '' ||
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(category);

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered];

    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => getProductRating(b) - getProductRating(a));
    }

    return sorted;
  }, [products, searchQuery, selectedCategories, sortBy]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <MarketplaceHeader
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="container mx-auto px-4 py-8">
        {pageError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{pageError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h3 className="mb-4 font-semibold text-[#111827]">Filters</h3>

              <div className="mb-6">
                <h4 className="mb-3 font-medium text-[#111827]">Categories</h4>

                {categories.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No categories available</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={category} className="ml-2 cursor-pointer text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCategories.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-[#0F2854]">
                  {selectedCategories.length > 0 ? 'Filtered Products' : 'All Products'}
                </h1>
                <p className="text-[#6B7280]">
                  {isLoading ? 'Loading products...' : `${filteredProducts.length} products found`}
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-[#E5E7EB] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-[#6B7280]" />
                <h3 className="mb-2 text-xl font-semibold text-[#111827]">Loading products</h3>
                <p className="text-[#6B7280]">Please wait while we fetch the marketplace catalog.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-[#6B7280]" />
                <h3 className="mb-2 text-xl font-semibold text-[#111827]">No products found</h3>
                <p className="text-[#6B7280]">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={String(product.id)} product={product as any} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}