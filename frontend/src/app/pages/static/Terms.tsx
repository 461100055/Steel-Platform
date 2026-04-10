import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { Card, CardContent } from '../../components/ui/card';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-[#0F2854] mb-8">Terms and Conditions</h1>
        <p className="text-[#6B7280] mb-8">Last updated: March 15, 2026</p>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#6B7280] leading-relaxed">
                By accessing and using Steel Platform, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">2. User Accounts</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                To use certain features of our platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-[#6B7280] space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly notify us of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">3. Buyer Responsibilities</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                As a buyer on our platform, you agree to:
              </p>
              <ul className="list-disc list-inside text-[#6B7280] space-y-2">
                <li>Provide accurate delivery and payment information</li>
                <li>Complete transactions in good faith</li>
                <li>Pay for all confirmed orders in a timely manner</li>
                <li>Communicate professionally with suppliers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">4. Supplier Responsibilities</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                As a supplier on our platform, you agree to:
              </p>
              <ul className="list-disc list-inside text-[#6B7280] space-y-2">
                <li>Provide accurate product descriptions and pricing</li>
                <li>Fulfill orders as specified and within agreed timeframes</li>
                <li>Maintain required business licenses and certifications</li>
                <li>Deliver products that meet specified quality standards</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">5. Payment Terms</h2>
              <p className="text-[#6B7280] leading-relaxed">
                All transactions are subject to our payment processing terms. Prices are listed in Saudi Riyals (SAR) 
                and include applicable VAT (15%). Payment must be completed before order fulfillment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">6. Intellectual Property</h2>
              <p className="text-[#6B7280] leading-relaxed">
                All content on Steel Platform, including text, graphics, logos, and software, is the property of 
                Steel Platform and is protected by copyright and intellectual property laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">7. Limitation of Liability</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Steel Platform acts as a marketplace facilitator. We are not liable for disputes between buyers 
                and suppliers, product quality issues, or delivery delays beyond our reasonable control.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">8. Changes to Terms</h2>
              <p className="text-[#6B7280] leading-relaxed">
                We reserve the right to modify these terms at any time. Users will be notified of significant 
                changes, and continued use of the platform constitutes acceptance of modified terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">9. Contact Information</h2>
              <p className="text-[#6B7280] leading-relaxed">
                For questions about these Terms and Conditions, please contact us at legal@steelplatform.com
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
