import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { Card, CardContent } from '../../components/ui/card';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-[#0F2854] mb-8">Privacy Policy</h1>
        <p className="text-[#6B7280] mb-8">Last updated: March 15, 2026</p>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">1. Information We Collect</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-[#6B7280] space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Company details and business information</li>
                <li>Payment and billing information</li>
                <li>Transaction history and order details</li>
                <li>Communications with suppliers and support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">2. How We Use Your Information</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-[#6B7280] space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your account and transactions</li>
                <li>Improve our platform and services</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">3. Information Sharing</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-[#6B7280] space-y-2">
                <li>Suppliers to facilitate transactions and communications</li>
                <li>Payment processors to complete financial transactions</li>
                <li>Service providers who assist in operating our platform</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="text-[#6B7280] leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">4. Data Security</h2>
              <p className="text-[#6B7280] leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                secure servers, and regular security audits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">5. Data Retention</h2>
              <p className="text-[#6B7280] leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with 
                legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, 
                we securely delete or anonymize it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">6. Your Rights</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-[#6B7280] space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your information</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">7. Cookies</h2>
              <p className="text-[#6B7280] leading-relaxed">
                We use cookies and similar tracking technologies to enhance user experience, analyze platform usage, 
                and personalize content. You can control cookie preferences through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">8. Children's Privacy</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Our platform is not intended for individuals under 18 years of age. We do not knowingly collect 
                personal information from children.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">9. Changes to Privacy Policy</h2>
              <p className="text-[#6B7280] leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes via 
                email or platform notification. Your continued use of the platform after changes constitutes 
                acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#0F2854] mb-4">10. Contact Us</h2>
              <p className="text-[#6B7280] leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-[#6B7280] mt-4">
                Email: privacy@steelplatform.com<br />
                Phone: +966 11 123 4567
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
