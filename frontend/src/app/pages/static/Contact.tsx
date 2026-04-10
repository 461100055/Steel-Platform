import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-white">
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0F2854] mb-4">Contact Us</h1>
          <p className="text-xl text-[#6B7280] max-w-3xl mx-auto">
            Have questions? We're here to help. Reach out to us anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your.email@company.com" required />
                </div>
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Your company" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..." 
                    rows={6}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full bg-[#0F2854] hover:bg-[#1C4D8D]">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-[#4988C4] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#0F2854] mb-2">Email</h3>
                    <p className="text-[#6B7280]">support@steelplatform.com</p>
                    <p className="text-[#6B7280]">sales@steelplatform.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-[#4988C4] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#0F2854] mb-2">Phone</h3>
                    <p className="text-[#6B7280]">+966 11 123 4567</p>
                    <p className="text-[#6B7280]">+966 50 987 6543 (WhatsApp)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-[#4988C4] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#0F2854] mb-2">Office Address</h3>
                    <p className="text-[#6B7280]">
                      King Fahd Road, Al Olaya District<br />
                      Riyadh 12211, Saudi Arabia
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#4988C4] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#0F2854] mb-2">Business Hours</h3>
                    <p className="text-[#6B7280]">Sunday - Thursday: 8:00 AM - 6:00 PM</p>
                    <p className="text-[#6B7280]">Friday - Saturday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
