import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ProductCard } from '../../components/ProductCard';
import { SupplierCard } from '../../components/SupplierCard';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { mockProducts, mockSuppliers, categories } from '../../lib/mock-data';
import { Search } from 'lucide-react';
import { PLATFORM_LOGO } from '../../lib/constants';

export default function Landing() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const featuredProducts = useMemo(() => mockProducts.slice(0, 3), []);
  const topSuppliers = useMemo(() => mockSuppliers.slice(0, 3), []);

  const handleSearch = () => {
    const trimmedValue = searchValue.trim();

    if (trimmedValue) {
      navigate(`/marketplace?search=${encodeURIComponent(trimmedValue)}`);
      return;
    }

    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <MarketplaceHeader />

      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15, 40, 84, 0.58), rgba(15, 40, 84, 0.20)), url('https://i.ibb.co/hx0KHM45/ss002.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center text-white md:py-50">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Saudi Arabia&apos;s Leading Steel Marketplace
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/90 md:text-lg">
              Connect with trusted suppliers, get competitive prices, and
              streamline your steel procurement.
            </p>

            <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for steel products..."
                  className="h-11 border-white bg-white pl-10 text-[#111827] placeholder:text-[#9CA3AF]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleSearch}
                className="h-11 bg-[#4B89C8] px-6 hover:bg-[#2F6FAA]"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="bg backdrop-blur-sm">
          <div className="container mx-auto px-0 py-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#0F2854] md:text-3xl">
              Browse by Category
            </h2>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category}
                  to={`/marketplace?category=${encodeURIComponent(category)}`}
                  className="rounded-xl border border-[#DCE4EE] bg-white/80 px-4 py-4 text-center text-sm font-semibold text-[#1F2937] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#4B89C8] hover:shadow-md md:text-base"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0F2854] md:text-3xl">
            Featured Products
          </h2>

          <Button
            variant="outline"
            onClick={() => navigate('/marketplace')}
            className="border-[#D5DCE5] bg-white text-[#111827] hover:bg-[#F7FAFC]"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0F2854] md:text-3xl">
            Top Suppliers
          </h2>

          <Button
            variant="outline"
            onClick={() => navigate('/marketplace')}
            className="border-[#D5DCE5] bg-white text-[#111827] hover:bg-[#F7FAFC]"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {topSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      </section>

      <footer className="mt-8 bg-[#0F2854] py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <Link to="/" className="inline-flex items-center">
                <img
                  src={PLATFORM_LOGO}
                  alt="Steel Platform"
                  className="h-10 w-auto object-contain"
                />
              </Link>

              <p className="mt-4 text-sm leading-6 text-[#D9E7F7]">
                Saudi Arabia&apos;s trusted digital marketplace for steel
                products, suppliers, and procurement workflows.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-[#D9E7F7]">
                <li>
                  <Link to="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/marketplace" className="hover:text-white">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold">Register</h4>
              <ul className="space-y-2 text-[#D9E7F7]">
                <li>
                  <Link to="/register/buyer" className="hover:text-white">
                    Register as Buyer
                  </Link>
                </li>
                <li>
                  <Link to="/register/supplier" className="hover:text-white">
                    Register as Supplier
                  </Link>
                </li>
                <li>
                  <Link to="/register/individual" className="hover:text-white">
                    Register as Individual
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold">Contact</h4>
              <ul className="space-y-2 text-[#D9E7F7]">
                <li>Email: info@steelplatform.sa</li>
                <li>Phone: +966 11 234 5678</li>
                <li>Riyadh, Saudi Arabia</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-[#24497A] pt-6 text-center text-sm text-[#D9E7F7]">
            <p>© 2026 Steel Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}