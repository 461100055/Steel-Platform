import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-[#0F2854] mb-4">
          Steel Platform
        </h1>
        <p className="text-[#6B7280] text-lg mb-8">
          B2B marketplace for steel and industrial products
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="bg-[#0F2854] hover:bg-[#1C4D8D]">
            <Link to="/marketplace">Browse Marketplace</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/login">Sign In</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/register-supplier">Register as Supplier</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}