import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  User,
  Building,
  Lock,
  Bell,
  CreditCard,
  Truck,
  Shield,
  Globe,
  Save,
  Upload,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  newOrders: boolean;
  orderUpdates: boolean;
  rfqRequests: boolean;
  lowStock: boolean;
  paymentReceived: boolean;
  reviewsRatings: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export default function SupplierSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: 'Ahmed',
    lastName: 'Al-Dosari',
    email: 'ahmed@saudisteel.com',
    phone: '+966 50 123 4567',
    position: 'Sales Manager',
    profileImage: ''
  });

  // Company state
  const [companyData, setCompanyData] = useState({
    companyName: 'Saudi Steel Industries',
    commercialRegister: 'CR-1234567890',
    taxNumber: 'VAT-300123456789003',
    industry: 'Steel Manufacturing',
    established: '1995',
    employees: '500-1000',
    website: 'www.saudisteel.com',
    description: 'Leading supplier of high-quality steel products in Saudi Arabia with over 25 years of experience.',
    address: 'Industrial City, Second Phase',
    city: 'Riyadh',
    postalCode: '11564',
    country: 'Saudi Arabia'
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newOrders: true,
    orderUpdates: true,
    rfqRequests: true,
    lowStock: true,
    paymentReceived: true,
    reviewsRatings: false,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false
  });

  // Payment settings
  const [paymentData, setPaymentData] = useState({
    bankName: 'Al Rajhi Bank',
    accountName: 'Saudi Steel Industries',
    accountNumber: '****7890',
    iban: 'SA**********************3456',
    swiftCode: 'RJHISARI',
    currency: 'SAR',
    paymentTerms: '30'
  });

  // Shipping settings
  const [shippingData, setShippingData] = useState({
    defaultShippingMethod: 'standard',
    processingTime: '2-3',
    minOrderAmount: '5000',
    freeShippingThreshold: '50000',
    internationalShipping: false,
    shippingRegions: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina']
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveCompany = () => {
    toast.success('Company information updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const handleSavePayment = () => {
    toast.success('Payment settings updated successfully!');
  };

  const handleSaveShipping = () => {
    toast.success('Shipping settings updated successfully!');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }
    toast.success('Password changed successfully!');
    setIsChangePasswordOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F2854]">Settings</h1>
          <p className="text-[#6B7280] mt-1">Manage your account and business preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Shipping</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-[#0F2854] flex items-center justify-center text-white text-2xl font-bold">
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </div>
                    <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#4988C4] flex items-center justify-center text-white hover:bg-[#1C4D8D] transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#111827]">Profile Picture</h3>
                    <p className="text-sm text-[#6B7280] mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="h-3 w-3 mr-2" />
                      Upload New Photo
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="pl-10 bg-white border-[#E5E7EB]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="pl-10 bg-white border-[#E5E7EB]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position/Title</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    className="bg-white border-[#E5E7EB]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Manage your business details and legal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={companyData.industry} onValueChange={(value) => setCompanyData({ ...companyData, industry: value })}>
                      <SelectTrigger className="bg-white border-[#E5E7EB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Steel Manufacturing">Steel Manufacturing</SelectItem>
                        <SelectItem value="Construction Materials">Construction Materials</SelectItem>
                        <SelectItem value="Metal Trading">Metal Trading</SelectItem>
                        <SelectItem value="Industrial Supplies">Industrial Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cr">Commercial Registration *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                      <Input
                        id="cr"
                        value={companyData.commercialRegister}
                        onChange={(e) => setCompanyData({ ...companyData, commercialRegister: e.target.value })}
                        className="pl-10 bg-white border-[#E5E7EB]"
                      />
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">VAT Number *</Label>
                    <Input
                      id="taxNumber"
                      value={companyData.taxNumber}
                      onChange={(e) => setCompanyData({ ...companyData, taxNumber: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="established">Year Established</Label>
                    <Input
                      id="established"
                      value={companyData.established}
                      onChange={(e) => setCompanyData({ ...companyData, established: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employees">Number of Employees</Label>
                    <Select value={companyData.employees} onValueChange={(value) => setCompanyData({ ...companyData, employees: value })}>
                      <SelectTrigger className="bg-white border-[#E5E7EB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500-1000">500-1000</SelectItem>
                        <SelectItem value="1000+">1000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <Input
                      id="website"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      className="pl-10 bg-white border-[#E5E7EB]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={companyData.description}
                    onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                    rows={4}
                    className="bg-white border-[#E5E7EB]"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Business Address</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                      <Textarea
                        id="address"
                        value={companyData.address}
                        onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                        rows={2}
                        className="pl-10 bg-white border-[#E5E7EB]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={companyData.city}
                        onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                        className="bg-white border-[#E5E7EB]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={companyData.postalCode}
                        onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
                        className="bg-white border-[#E5E7EB]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={companyData.country}
                        onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                        className="bg-white border-[#E5E7EB]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your login credentials and account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div>
                      <h4 className="font-medium text-[#111827]">Password</h4>
                      <p className="text-sm text-[#6B7280] mt-1">Last changed 45 days ago</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsChangePasswordOpen(true)}>
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div>
                      <h4 className="font-medium text-[#111827]">Two-Factor Authentication</h4>
                      <p className="text-sm text-[#6B7280] mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div>
                      <h4 className="font-medium text-[#111827]">Language & Region</h4>
                      <p className="text-sm text-[#6B7280] mt-1">English (United States)</p>
                    </div>
                    <Button variant="outline">
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div>
                      <h4 className="font-medium text-[#111827]">Time Zone</h4>
                      <p className="text-sm text-[#6B7280] mt-1">GMT+3 (Saudi Arabia)</p>
                    </div>
                    <Button variant="outline">
                      Change
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827] text-red-600">Danger Zone</h3>
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">Deactivate Account</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Temporarily disable your account. You can reactivate it at any time.
                        </p>
                        <Button variant="outline" className="mt-3 border-red-600 text-red-600 hover:bg-red-50">
                          Deactivate Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Order Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">New Orders</p>
                        <p className="text-sm text-[#6B7280]">Get notified when you receive a new order</p>
                      </div>
                      <Switch
                        checked={notifications.newOrders}
                        onCheckedChange={() => toggleNotification('newOrders')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Order Updates</p>
                        <p className="text-sm text-[#6B7280]">Notifications about order status changes</p>
                      </div>
                      <Switch
                        checked={notifications.orderUpdates}
                        onCheckedChange={() => toggleNotification('orderUpdates')}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Business Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">RFQ Requests</p>
                        <p className="text-sm text-[#6B7280]">Get notified about new quote requests</p>
                      </div>
                      <Switch
                        checked={notifications.rfqRequests}
                        onCheckedChange={() => toggleNotification('rfqRequests')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Low Stock Alerts</p>
                        <p className="text-sm text-[#6B7280]">Alert when product inventory is low</p>
                      </div>
                      <Switch
                        checked={notifications.lowStock}
                        onCheckedChange={() => toggleNotification('lowStock')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Payment Received</p>
                        <p className="text-sm text-[#6B7280]">Notifications when payments are received</p>
                      </div>
                      <Switch
                        checked={notifications.paymentReceived}
                        onCheckedChange={() => toggleNotification('paymentReceived')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Reviews & Ratings</p>
                        <p className="text-sm text-[#6B7280]">Get notified about new customer reviews</p>
                      </div>
                      <Switch
                        checked={notifications.reviewsRatings}
                        onCheckedChange={() => toggleNotification('reviewsRatings')}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Email Notifications</p>
                        <p className="text-sm text-[#6B7280]">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={() => toggleNotification('emailNotifications')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">SMS Notifications</p>
                        <p className="text-sm text-[#6B7280]">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        checked={notifications.smsNotifications}
                        onCheckedChange={() => toggleNotification('smsNotifications')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Push Notifications</p>
                        <p className="text-sm text-[#6B7280]">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={() => toggleNotification('pushNotifications')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Manage your bank account and payment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={paymentData.bankName}
                      onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name *</Label>
                    <Input
                      id="accountName"
                      value={paymentData.accountName}
                      onChange={(e) => setPaymentData({ ...paymentData, accountName: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={paymentData.accountNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN *</Label>
                    <Input
                      id="iban"
                      value={paymentData.iban}
                      onChange={(e) => setPaymentData({ ...paymentData, iban: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                      type="password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                    <Input
                      id="swiftCode"
                      value={paymentData.swiftCode}
                      onChange={(e) => setPaymentData({ ...paymentData, swiftCode: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select value={paymentData.currency} onValueChange={(value) => setPaymentData({ ...paymentData, currency: value })}>
                      <SelectTrigger className="bg-white border-[#E5E7EB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Payment Terms</h3>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Default Payment Terms (Days)</Label>
                    <Select value={paymentData.paymentTerms} onValueChange={(value) => setPaymentData({ ...paymentData, paymentTerms: value })}>
                      <SelectTrigger className="bg-white border-[#E5E7EB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Immediate</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePayment} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Settings</CardTitle>
                <CardDescription>Configure your shipping and delivery preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingMethod">Default Shipping Method *</Label>
                    <Select value={shippingData.defaultShippingMethod} onValueChange={(value) => setShippingData({ ...shippingData, defaultShippingMethod: value })}>
                      <SelectTrigger className="bg-white border-[#E5E7EB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Shipping</SelectItem>
                        <SelectItem value="express">Express Shipping</SelectItem>
                        <SelectItem value="overnight">Overnight Shipping</SelectItem>
                        <SelectItem value="pickup">Customer Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processingTime">Processing Time (Days) *</Label>
                    <Input
                      id="processingTime"
                      value={shippingData.processingTime}
                      onChange={(e) => setShippingData({ ...shippingData, processingTime: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                      placeholder="e.g., 2-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrder">Minimum Order Amount (SAR)</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      value={shippingData.minOrderAmount}
                      onChange={(e) => setShippingData({ ...shippingData, minOrderAmount: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freeShipping">Free Shipping Threshold (SAR)</Label>
                    <Input
                      id="freeShipping"
                      type="number"
                      value={shippingData.freeShippingThreshold}
                      onChange={(e) => setShippingData({ ...shippingData, freeShippingThreshold: e.target.value })}
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#111827]">International Shipping</h4>
                      <p className="text-sm text-[#6B7280] mt-1">Enable shipping to international destinations</p>
                    </div>
                    <Switch
                      checked={shippingData.internationalShipping}
                      onCheckedChange={(checked) => setShippingData({ ...shippingData, internationalShipping: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Shipping Regions</h3>
                  <p className="text-sm text-[#6B7280]">Cities and regions you ship to</p>
                  <div className="flex flex-wrap gap-2">
                    {shippingData.shippingRegions.map((region) => (
                      <Badge key={region} variant="outline" className="px-3 py-1">
                        {region}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-3 w-3 mr-2" />
                    Manage Regions
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveShipping} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>Manage your security settings and privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Login Activity</h3>
                  <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Last Login</p>
                        <p className="text-sm text-[#6B7280]">March 10, 2026 at 9:45 AM</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Current Session</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">IP Address</p>
                        <p className="text-sm text-[#6B7280]">192.168.1.1</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#111827]">Device</p>
                        <p className="text-sm text-[#6B7280]">Chrome on Windows 11</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">View All Login History</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Active Sessions</h3>
                  <p className="text-sm text-[#6B7280]">Manage devices that are currently logged into your account</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#0F2854] flex items-center justify-center text-white">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#111827]">Current Device</p>
                          <p className="text-sm text-[#6B7280]">Chrome - Riyadh, Saudi Arabia</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Logout All Other Sessions
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#111827]">Data & Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                      <div>
                        <h4 className="font-medium text-[#111827]">Download Your Data</h4>
                        <p className="text-sm text-[#6B7280] mt-1">Request a copy of your account data</p>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Request
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                      <div>
                        <h4 className="font-medium text-[#111827]">Data Retention</h4>
                        <p className="text-sm text-[#6B7280] mt-1">Manage how long we keep your data</p>
                      </div>
                      <Button variant="outline">
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password *</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-[#6B7280]">Must be at least 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}