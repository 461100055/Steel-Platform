import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Bell, 
  Lock, 
  Save, 
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const saudiCities = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
  'Taif', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Hofuf', 'Jubail', 'Yanbu'
];

const industries = [
  'Construction & Infrastructure',
  'Manufacturing',
  'Oil & Gas',
  'Automotive',
  'Energy & Utilities',
  'Mining',
  'Transportation & Logistics',
  'Real Estate Development',
  'Industrial Equipment',
  'Government & Public Sector',
  'Other'
];

const idTypes = [
  'National ID',
  'Iqama (Resident ID)',
  'GCC National ID'
];

export default function BuyerSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([
    'commercial-register.pdf',
    'tax-certificate.pdf'
  ]);

  // Detect buyer type from localStorage or default to company
  const [buyerType, setBuyerType] = useState<'company' | 'individual'>(() => {
    const savedType = localStorage.getItem('buyer_type');
    return (savedType as 'company' | 'individual') || 'company';
  });

  // Company buyer data
  const [companyData, setCompanyData] = useState({
    companyName: 'Al-Khozama Construction',
    commercialRegister: '1234567890',
    taxNumber: '300012345612345',
    yearEstablished: '2005',
    companySize: '201-500 employees',
    industry: 'Construction & Infrastructure',
    contactPerson: 'Ahmed Al-Mansour',
    position: 'Procurement Manager',
    phone: '+966 50 123 4567',
    email: user?.email || 'ahmed@alkhozama.sa',
    website: 'https://www.alkhozama.sa',
    city: 'Riyadh',
    address: 'King Fahd Road, Al Olaya District, 12345',
    shippingAddress: '',
    estimatedMonthlyPurchase: '150000',
    requiresCredit: true,
    specialRequirements: 'Require ISO certified materials for government projects'
  });

  // Individual buyer data
  const [individualData, setIndividualData] = useState({
    firstName: 'Ahmed',
    lastName: 'Al-Mansour',
    idType: 'National ID',
    idNumber: '1234567890',
    dateOfBirth: '1985-03-15',
    phone: '+966 50 123 4567',
    email: user?.email || 'ahmed@example.com',
    city: 'Riyadh',
    district: 'Al Olaya',
    street: 'King Fahd Road',
    buildingNumber: '1234',
    postalCode: '12345',
    additionalDirections: 'Near Al Faisaliah Tower'
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    priceAlerts: true,
    newProducts: false,
    promotions: true,
    newsletter: false,
    rfqResponses: true,
    emailNotifications: true,
    smsNotifications: false
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleCompanyChange = (field: string, value: string | boolean) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleIndividualChange = (field: string, value: string) => {
    setIndividualData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setUploadedDocs(prev => [...prev, ...fileNames]);
    }
  };

  const removeDoc = (docName: string) => {
    setUploadedDocs(prev => prev.filter(d => d !== docName));
  };

  const handleSaveProfile = () => {
    if (buyerType === 'company') {
      localStorage.setItem('buyer_company_data', JSON.stringify(companyData));
    } else {
      localStorage.setItem('buyer_individual_data', JSON.stringify(individualData));
    }
    localStorage.setItem('buyer_type', buyerType);
    
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('buyer_notifications', JSON.stringify(notifications));
    setSuccessMessage('Notification preferences updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    // Mock password change
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Account Settings</h1>
          <p className="text-[#6B7280] mt-1">
            Manage your profile, preferences, and security settings
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Account Type Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Account Type</CardTitle>
                <CardDescription>
                  Select your account type to customize the profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <button
                    onClick={() => setBuyerType('company')}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      buyerType === 'company'
                        ? 'border-[#0F2854] bg-[#0F2854]/5'
                        : 'border-[#E5E7EB] hover:border-[#0F2854]/50'
                    }`}
                  >
                    <Building2 className={`h-6 w-6 mx-auto mb-2 ${
                      buyerType === 'company' ? 'text-[#0F2854]' : 'text-[#6B7280]'
                    }`} />
                    <div className="font-semibold text-[#111827]">Company Account</div>
                    <div className="text-sm text-[#6B7280] mt-1">
                      For businesses and commercial establishments
                    </div>
                  </button>
                  <button
                    onClick={() => setBuyerType('individual')}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      buyerType === 'individual'
                        ? 'border-[#0F2854] bg-[#0F2854]/5'
                        : 'border-[#E5E7EB] hover:border-[#0F2854]/50'
                    }`}
                  >
                    <User className={`h-6 w-6 mx-auto mb-2 ${
                      buyerType === 'individual' ? 'text-[#0F2854]' : 'text-[#6B7280]'
                    }`} />
                    <div className="font-semibold text-[#111827]">Individual Account</div>
                    <div className="text-sm text-[#6B7280] mt-1">
                      For personal purchases
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Company Profile */}
            {buyerType === 'company' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companyData.companyName}
                          onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commercialRegister">Commercial Register</Label>
                        <Input
                          id="commercialRegister"
                          value={companyData.commercialRegister}
                          onChange={(e) => handleCompanyChange('commercialRegister', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxNumber">Tax Number (VAT)</Label>
                        <Input
                          id="taxNumber"
                          value={companyData.taxNumber}
                          onChange={(e) => handleCompanyChange('taxNumber', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearEstablished">Year Established</Label>
                        <Input
                          id="yearEstablished"
                          type="number"
                          value={companyData.yearEstablished}
                          onChange={(e) => handleCompanyChange('yearEstablished', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select 
                          value={companyData.industry} 
                          onValueChange={(value) => handleCompanyChange('industry', value)}
                        >
                          <SelectTrigger className="bg-white border-[#E5E7EB]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map(industry => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <Select 
                          value={companyData.companySize} 
                          onValueChange={(value) => handleCompanyChange('companySize', value)}
                        >
                          <SelectTrigger className="bg-white border-[#E5E7EB]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                            <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                            <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                            <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                            <SelectItem value="500+ employees">500+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">Company Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={companyData.website}
                          onChange={(e) => handleCompanyChange('website', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                          placeholder="https://www.yourcompany.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={companyData.contactPerson}
                          onChange={(e) => handleCompanyChange('contactPerson', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={companyData.position}
                          onChange={(e) => handleCompanyChange('position', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={companyData.phone}
                          onChange={(e) => handleCompanyChange('phone', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={companyData.email}
                          onChange={(e) => handleCompanyChange('email', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Business Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select 
                          value={companyData.city} 
                          onValueChange={(value) => handleCompanyChange('city', value)}
                        >
                          <SelectTrigger className="bg-white border-[#E5E7EB]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {saudiCities.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedMonthlyPurchase">Est. Monthly Purchase (SAR)</Label>
                        <Input
                          id="estimatedMonthlyPurchase"
                          type="number"
                          value={companyData.estimatedMonthlyPurchase}
                          onChange={(e) => handleCompanyChange('estimatedMonthlyPurchase', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Input
                          id="address"
                          value={companyData.address}
                          onChange={(e) => handleCompanyChange('address', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shippingAddress">Shipping Address (if different)</Label>
                        <Input
                          id="shippingAddress"
                          value={companyData.shippingAddress}
                          onChange={(e) => handleCompanyChange('shippingAddress', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                          placeholder="Leave blank if same as business address"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="specialRequirements">Special Requirements</Label>
                        <Textarea
                          id="specialRequirements"
                          value={companyData.specialRequirements}
                          onChange={(e) => handleCompanyChange('specialRequirements', e.target.value)}
                          className="bg-white border-[#E5E7EB] resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center gap-2 md:col-span-2">
                        <Checkbox
                          id="requiresCredit"
                          checked={companyData.requiresCredit}
                          onCheckedChange={(checked) => handleCompanyChange('requiresCredit', checked as boolean)}
                        />
                        <Label htmlFor="requiresCredit" className="cursor-pointer">
                          Interested in credit terms
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Individual Profile */}
            {buyerType === 'individual' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={individualData.firstName}
                          onChange={(e) => handleIndividualChange('firstName', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={individualData.lastName}
                          onChange={(e) => handleIndividualChange('lastName', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="idType">ID Type</Label>
                        <Select 
                          value={individualData.idType} 
                          onValueChange={(value) => handleIndividualChange('idType', value)}
                        >
                          <SelectTrigger className="bg-white border-[#E5E7EB]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {idTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number</Label>
                        <Input
                          id="idNumber"
                          value={individualData.idNumber}
                          onChange={(e) => handleIndividualChange('idNumber', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={individualData.dateOfBirth}
                          onChange={(e) => handleIndividualChange('dateOfBirth', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={individualData.phone}
                          onChange={(e) => handleIndividualChange('phone', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={individualData.email}
                          onChange={(e) => handleIndividualChange('email', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select 
                          value={individualData.city} 
                          onValueChange={(value) => handleIndividualChange('city', value)}
                        >
                          <SelectTrigger className="bg-white border-[#E5E7EB]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {saudiCities.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          value={individualData.district}
                          onChange={(e) => handleIndividualChange('district', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="street">Street</Label>
                        <Input
                          id="street"
                          value={individualData.street}
                          onChange={(e) => handleIndividualChange('street', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buildingNumber">Building Number</Label>
                        <Input
                          id="buildingNumber"
                          value={individualData.buildingNumber}
                          onChange={(e) => handleIndividualChange('buildingNumber', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={individualData.postalCode}
                          onChange={(e) => handleIndividualChange('postalCode', e.target.value)}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="additionalDirections">Additional Directions</Label>
                        <Textarea
                          id="additionalDirections"
                          value={individualData.additionalDirections}
                          onChange={(e) => handleIndividualChange('additionalDirections', e.target.value)}
                          className="bg-white border-[#E5E7EB] resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveProfile}
                className="bg-[#0F2854] hover:bg-[#1C4D8D]"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile Changes
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[#111827]">Order Updates</div>
                      <div className="text-sm text-[#6B7280] mt-1">
                        Notifications about order status, shipping, and delivery
                      </div>
                    </div>
                    <Checkbox
                      checked={notifications.orderUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked as boolean)}
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[#111827]">Price Alerts</div>
                      <div className="text-sm text-[#6B7280] mt-1">
                        Get notified when prices drop on products you're watching
                      </div>
                    </div>
                    <Checkbox
                      checked={notifications.priceAlerts}
                      onCheckedChange={(checked) => handleNotificationChange('priceAlerts', checked as boolean)}
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[#111827]">New Products</div>
                      <div className="text-sm text-[#6B7280] mt-1">
                        Updates about new products matching your interests
                      </div>
                    </div>
                    <Checkbox
                      checked={notifications.newProducts}
                      onCheckedChange={(checked) => handleNotificationChange('newProducts', checked as boolean)}
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[#111827]">RFQ Responses</div>
                      <div className="text-sm text-[#6B7280] mt-1">
                        Notifications when suppliers respond to your RFQ requests
                      </div>
                    </div>
                    <Checkbox
                      checked={notifications.rfqResponses}
                      onCheckedChange={(checked) => handleNotificationChange('rfqResponses', checked as boolean)}
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[#111827]">Promotions & Offers</div>
                      <div className="text-sm text-[#6B7280] mt-1">
                        Special deals, discounts, and promotional offers
                      </div>
                    </div>
                    <Checkbox
                      checked={notifications.promotions}
                      onCheckedChange={(checked) => handleNotificationChange('promotions', checked as boolean)}
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[#111827]">Newsletter</div>
                      <div className="text-sm text-[#6B7280] mt-1">
                        Monthly newsletter with industry news and platform updates
                      </div>
                    </div>
                    <Checkbox
                      checked={notifications.newsletter}
                      onCheckedChange={(checked) => handleNotificationChange('newsletter', checked as boolean)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Communication Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-[#111827]">Email Notifications</div>
                    <div className="text-sm text-[#6B7280] mt-1">
                      Receive notifications via email
                    </div>
                  </div>
                  <Checkbox
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked as boolean)}
                  />
                </div>

                <div className="flex items-start justify-between p-4 border border-[#E5E7EB] rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-[#111827]">SMS Notifications</div>
                    <div className="text-sm text-[#6B7280] mt-1">
                      Receive important updates via SMS
                    </div>
                  </div>
                  <Checkbox
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked as boolean)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveNotifications}
                className="bg-[#0F2854] hover:bg-[#1C4D8D]"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-white border-[#E5E7EB]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-white border-[#E5E7EB]"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-[#6B7280]">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-white border-[#E5E7EB]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-[#E5E7EB] rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-[#111827]">Email Verified</div>
                    <div className="text-sm text-[#6B7280] mt-1">
                      Your email address has been verified
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-[#E5E7EB] rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-[#111827]">Phone Verified</div>
                    <div className="text-sm text-[#6B7280] mt-1">
                      Your phone number has been verified
                    </div>
                  </div>
                </div>

                <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
                  <AlertCircle className="h-4 w-4 text-[#4988C4]" />
                  <AlertDescription className="text-sm text-[#111827]">
                    For additional security, we recommend enabling two-factor authentication. Contact support to enable this feature.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Business Documents
                </CardTitle>
                <CardDescription>
                  Upload and manage your business verification documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center bg-white">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-[#6B7280]" />
                    <p className="text-sm text-[#6B7280]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      PDF, JPG, PNG up to 10MB each
                    </p>
                  </label>
                </div>

                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Documents</Label>
                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded border border-[#E5E7EB]">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#4988C4]" />
                          <div>
                            <div className="text-sm font-medium text-[#111827]">{doc}</div>
                            <div className="text-xs text-[#6B7280]">Uploaded on {new Date().toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          <button
                            type="button"
                            onClick={() => removeDoc(doc)}
                            className="text-[#6B7280] hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Alert className="border-[#4988C4] bg-[#BDE8F5]/10">
                  <AlertCircle className="h-4 w-4 text-[#4988C4]" />
                  <AlertDescription className="text-sm text-[#111827]">
                    Documents help verify your business and may be required for credit terms. All documents are encrypted and stored securely.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
