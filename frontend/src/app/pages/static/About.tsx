import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Building2, Users, Award, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0F2854] mb-4">About Steel Platform</h1>
          <p className="text-xl text-[#6B7280] max-w-3xl mx-auto">
            Your trusted B2B marketplace connecting steel buyers and suppliers across the region
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold text-[#0F2854] mb-6">Our Mission</h2>
            <p className="text-lg text-[#6B7280] leading-relaxed mb-6">
              Steel Platform is dedicated to revolutionizing the steel trading industry by providing a secure, 
              efficient, and transparent marketplace for businesses. We connect verified buyers with trusted 
              suppliers, facilitating seamless transactions and fostering long-term business relationships.
            </p>
            <p className="text-lg text-[#6B7280] leading-relaxed">
              Our platform leverages cutting-edge technology to streamline procurement processes, ensure 
              competitive pricing, and deliver exceptional value to all stakeholders in the steel supply chain.
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-[#4988C4] mx-auto mb-4" />
              <div className="text-4xl font-bold text-[#0F2854] mb-2">500+</div>
              <div className="text-[#6B7280]">Verified Suppliers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-[#4988C4] mx-auto mb-4" />
              <div className="text-4xl font-bold text-[#0F2854] mb-2">1,000+</div>
              <div className="text-[#6B7280]">Active Buyers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-[#4988C4] mx-auto mb-4" />
              <div className="text-4xl font-bold text-[#0F2854] mb-2">10,000+</div>
              <div className="text-[#6B7280]">Products Listed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-[#4988C4] mx-auto mb-4" />
              <div className="text-4xl font-bold text-[#0F2854] mb-2">15+</div>
              <div className="text-[#6B7280]">Countries Served</div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-[#0F2854] mb-4">Trust & Security</h3>
              <p className="text-[#6B7280]">
                We verify all suppliers and implement robust security measures to ensure safe 
                and reliable transactions for all users.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-[#0F2854] mb-4">Transparency</h3>
              <p className="text-[#6B7280]">
                Clear pricing, detailed product information, and honest supplier ratings create 
                an open marketplace environment.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-[#0F2854] mb-4">Innovation</h3>
              <p className="text-[#6B7280]">
                We continuously enhance our platform with the latest technology to improve 
                user experience and business outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0F2854] text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Steel Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
