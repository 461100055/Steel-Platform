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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { 
  FileText, 
  Search,
  Filter,
  Eye,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Calendar,
  Package,
  User,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

interface RFQRequest {
  id: string;
  rfqNumber: string;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  specifications: Record<string, string>;
  deadline: string;
  status: 'new' | 'quoted' | 'accepted' | 'rejected';
  createdAt: string;
  budget?: number;
}

interface QuoteForm {
  price: number;
  quantity: number;
  unit: string;
  deliveryTime: string;
  validUntil: string;
  notes: string;
  termsAndConditions: string;
}

// Mock data for RFQ requests
const mockRFQs: RFQRequest[] = [
  {
    id: '1',
    rfqNumber: 'RFQ-2024-001',
    buyerName: 'Ahmed Al-Mansour',
    buyerCompany: 'Al-Mansour Construction Co.',
    buyerEmail: 'ahmed@almansour.com',
    buyerPhone: '+966 50 123 4567',
    productName: 'Hot Rolled Steel Sheets',
    category: 'Steel Sheets',
    quantity: 100,
    unit: 'ton',
    description: 'We need high-quality hot rolled steel sheets for a large construction project in Riyadh.',
    specifications: {
      'Grade': 'ASTM A36',
      'Thickness': '10mm',
      'Width': '2000mm',
      'Length': '6000mm',
      'Surface': 'Mill finish'
    },
    deadline: '2024-03-20',
    status: 'new',
    createdAt: '2024-03-10',
    budget: 350000
  },
  {
    id: '2',
    rfqNumber: 'RFQ-2024-002',
    buyerName: 'Fatima Al-Zahrani',
    buyerCompany: 'Modern Industries Ltd.',
    buyerEmail: 'fatima@modernindustries.sa',
    buyerPhone: '+966 55 987 6543',
    productName: 'Galvanized Steel Coils',
    category: 'Steel Coils',
    quantity: 50,
    unit: 'ton',
    description: 'Looking for galvanized steel coils for manufacturing purposes.',
    specifications: {
      'Grade': 'DX51D',
      'Thickness': '0.5mm',
      'Width': '1250mm',
      'Coating': 'Z275'
    },
    deadline: '2024-03-18',
    status: 'quoted',
    createdAt: '2024-03-08'
  },
  {
    id: '3',
    rfqNumber: 'RFQ-2024-003',
    buyerName: 'Mohammed Al-Qahtani',
    buyerCompany: 'Saudi Infrastructure Projects',
    buyerEmail: 'mohammed@sipsa.com',
    buyerPhone: '+966 54 456 7890',
    productName: 'Steel Rebars',
    category: 'Rebar',
    quantity: 200,
    unit: 'ton',
    description: 'Need steel rebars for infrastructure development project.',
    specifications: {
      'Grade': 'Grade 60',
      'Diameter': '16mm',
      'Length': '12m',
      'Standard': 'ASTM A615'
    },
    deadline: '2024-03-25',
    status: 'accepted',
    createdAt: '2024-03-05'
  },
  {
    id: '4',
    rfqNumber: 'RFQ-2024-004',
    buyerName: 'Sara Al-Mutairi',
    buyerCompany: 'Al-Mutairi Trading',
    buyerEmail: 'sara@almutairi.com',
    buyerPhone: '+966 56 234 5678',
    productName: 'Stainless Steel Pipes',
    category: 'Steel Pipes',
    quantity: 30,
    unit: 'ton',
    description: 'Required for oil and gas pipeline project.',
    specifications: {
      'Grade': '304L',
      'Diameter': '100mm',
      'Thickness': '5mm',
      'Length': '6m'
    },
    deadline: '2024-03-15',
    status: 'rejected',
    createdAt: '2024-03-03'
  },
  {
    id: '5',
    rfqNumber: 'RFQ-2024-005',
    buyerName: 'Khalid Al-Dosari',
    buyerCompany: 'National Steel Fabricators',
    buyerEmail: 'khalid@nsf.sa',
    buyerPhone: '+966 53 345 6789',
    productName: 'Steel Beams',
    category: 'Steel Beams',
    quantity: 75,
    unit: 'ton',
    description: 'I-beams needed for warehouse construction.',
    specifications: {
      'Type': 'I-Beam',
      'Size': 'IPE 300',
      'Length': '12m',
      'Grade': 'S275'
    },
    deadline: '2024-03-22',
    status: 'new',
    createdAt: '2024-03-09'
  }
];

export default function SupplierRFQ() {
  const [rfqs, setRfqs] = useState<RFQRequest[]>(mockRFQs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    price: 0,
    quantity: 0,
    unit: 'ton',
    deliveryTime: '',
    validUntil: '',
    notes: '',
    termsAndConditions: ''
  });

  // Filter RFQs
  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = 
      rfq.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    new: rfqs.filter(r => r.status === 'new').length,
    quoted: rfqs.filter(r => r.status === 'quoted').length,
    accepted: rfqs.filter(r => r.status === 'accepted').length,
    rejected: rfqs.filter(r => r.status === 'rejected').length
  };

  const handleViewRFQ = (rfq: RFQRequest) => {
    setSelectedRFQ(rfq);
    setIsViewDialogOpen(true);
  };

  const handleOpenQuoteDialog = (rfq: RFQRequest) => {
    setSelectedRFQ(rfq);
    setQuoteForm({
      price: 0,
      quantity: rfq.quantity,
      unit: rfq.unit,
      deliveryTime: '',
      validUntil: '',
      notes: '',
      termsAndConditions: 'Standard terms and conditions apply. Payment: 30 days net. Delivery: FOB.'
    });
    setIsQuoteDialogOpen(true);
  };

  const handleSubmitQuote = () => {
    if (!selectedRFQ) return;

    // Update RFQ status
    setRfqs(rfqs.map(r => 
      r.id === selectedRFQ.id 
        ? { ...r, status: 'quoted' as const }
        : r
    ));

    setIsQuoteDialogOpen(false);
    toast.success(`Quote sent successfully for ${selectedRFQ.rfqNumber}!`);
  };

  const handleAcceptRFQ = (rfqId: string) => {
    setRfqs(rfqs.map(r => 
      r.id === rfqId 
        ? { ...r, status: 'accepted' as const }
        : r
    ));
    toast.success('RFQ marked as accepted!');
  };

  const handleRejectRFQ = (rfqId: string) => {
    setRfqs(rfqs.map(r => 
      r.id === rfqId 
        ? { ...r, status: 'rejected' as const }
        : r
    ));
    toast.info('RFQ marked as rejected');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-600">New</Badge>;
      case 'quoted':
        return <Badge className="bg-yellow-600">Quoted</Badge>;
      case 'accepted':
        return <Badge className="bg-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854]">RFQ Requests</h1>
            <p className="text-[#6B7280] mt-1">Manage quote requests from buyers</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export RFQs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">New Requests</CardTitle>
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <p className="text-xs text-[#6B7280] mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Quoted</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.quoted}</div>
              <p className="text-xs text-[#6B7280] mt-1">Quote submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Accepted</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <p className="text-xs text-[#6B7280] mt-1">Quote accepted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Rejected</CardTitle>
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-[#6B7280] mt-1">Not proceeded</p>
            </CardContent>
          </Card>
        </div>

        {/* RFQ List */}
        <Card>
          <CardHeader>
            <CardTitle>All RFQ Requests</CardTitle>
            <CardDescription>View and respond to quote requests from buyers</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search RFQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-[#E5E7EB]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white border-[#E5E7EB]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RFQ Cards */}
            <div className="space-y-4">
              {filteredRFQs.map((rfq) => (
                <Card key={rfq.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#111827]">
                            {rfq.rfqNumber}
                          </h3>
                          {getStatusBadge(rfq.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#6B7280]">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{rfq.buyerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{rfq.buyerCompany}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>{rfq.productName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {formatDate(rfq.deadline)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F9FAFB] p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Quantity</p>
                          <p className="font-semibold text-[#111827]">
                            {rfq.quantity.toLocaleString()} {rfq.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Category</p>
                          <p className="font-semibold text-[#111827]">{rfq.category}</p>
                        </div>
                        {rfq.budget && (
                          <div>
                            <p className="text-xs text-[#6B7280] mb-1">Budget</p>
                            <p className="font-semibold text-[#111827]">
                              {rfq.budget.toLocaleString()} SAR
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRFQ(rfq)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      
                      {rfq.status === 'new' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                            onClick={() => handleOpenQuoteDialog(rfq)}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send Quote
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleRejectRFQ(rfq.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {rfq.status === 'quoted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleAcceptRFQ(rfq.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark as Accepted
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRFQs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#111827] mb-2">No RFQs found</h3>
                <p className="text-[#6B7280]">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View RFQ Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>RFQ Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the quote request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRFQ && (
            <div className="space-y-6">
              {/* RFQ Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-lg font-semibold text-[#111827]">
                    {selectedRFQ.rfqNumber}
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    Created on {formatDate(selectedRFQ.createdAt)}
                  </p>
                </div>
                {getStatusBadge(selectedRFQ.status)}
              </div>

              {/* Buyer Information */}
              <div>
                <h4 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Buyer Information
                </h4>
                <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#6B7280]">Name</p>
                      <p className="font-medium text-[#111827]">{selectedRFQ.buyerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Company</p>
                      <p className="font-medium text-[#111827]">{selectedRFQ.buyerCompany}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Email</p>
                      <p className="font-medium text-[#111827] flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedRFQ.buyerEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Phone</p>
                      <p className="font-medium text-[#111827] flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedRFQ.buyerPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h4 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product Requirements
                </h4>
                <div className="space-y-3">
                  <div className="bg-[#F9FAFB] p-4 rounded-lg">
                    <p className="text-sm font-medium text-[#111827] mb-1">Product Name</p>
                    <p className="text-[#6B7280]">{selectedRFQ.productName}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F9FAFB] p-3 rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Quantity</p>
                      <p className="font-semibold text-[#111827]">
                        {selectedRFQ.quantity.toLocaleString()} {selectedRFQ.unit}
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] p-3 rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Category</p>
                      <p className="font-semibold text-[#111827]">{selectedRFQ.category}</p>
                    </div>
                    <div className="bg-[#F9FAFB] p-3 rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Deadline</p>
                      <p className="font-semibold text-[#111827]">
                        {formatDate(selectedRFQ.deadline)}
                      </p>
                    </div>
                  </div>
                  {selectedRFQ.budget && (
                    <div className="bg-[#F9FAFB] p-4 rounded-lg">
                      <p className="text-sm font-medium text-[#111827] mb-1">Budget Range</p>
                      <p className="text-lg font-semibold text-[#0F2854]">
                        {selectedRFQ.budget.toLocaleString()} SAR
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-[#111827] mb-3">Description</h4>
                <div className="bg-[#F9FAFB] p-4 rounded-lg">
                  <p className="text-[#6B7280]">{selectedRFQ.description}</p>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="font-semibold text-[#111827] mb-3">Technical Specifications</h4>
                <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-2">
                  {Object.entries(selectedRFQ.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                      <span className="text-sm font-medium text-[#374151]">{key}</span>
                      <span className="text-sm text-[#6B7280]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedRFQ?.status === 'new' && (
              <Button
                className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleOpenQuoteDialog(selectedRFQ);
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Quote
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Quote Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Quote</DialogTitle>
            <DialogDescription>
              Submit your quote for {selectedRFQ?.rfqNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quote Summary */}
            {selectedRFQ && (
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <p className="text-sm font-medium text-[#111827] mb-2">Request Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Product:</span>
                    <span className="ml-2 font-medium">{selectedRFQ.productName}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Quantity:</span>
                    <span className="ml-2 font-medium">{selectedRFQ.quantity} {selectedRFQ.unit}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Unit Price (SAR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={quoteForm.price}
                  onChange={(e) => setQuoteForm({ ...quoteForm, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Available *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quoteForm.quantity}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quantity: parseInt(e.target.value) })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time *</Label>
                <Input
                  id="deliveryTime"
                  value={quoteForm.deliveryTime}
                  onChange={(e) => setQuoteForm({ ...quoteForm, deliveryTime: e.target.value })}
                  placeholder="e.g., 7-10 days"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Quote Valid Until *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={quoteForm.validUntil}
                  onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                />
              </div>
            </div>

            {/* Total Calculation */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0F2854]">Total Quote Amount</span>
                <span className="text-2xl font-bold text-[#0F2854]">
                  {(quoteForm.price * quoteForm.quantity).toLocaleString()} SAR
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                placeholder="Any special notes or conditions..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms and Conditions *</Label>
              <Textarea
                id="terms"
                value={quoteForm.termsAndConditions}
                onChange={(e) => setQuoteForm({ ...quoteForm, termsAndConditions: e.target.value })}
                placeholder="Payment terms, delivery conditions, etc."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0F2854] hover:bg-[#1C4D8D]"
              onClick={handleSubmitQuote}
              disabled={!quoteForm.price || !quoteForm.quantity || !quoteForm.deliveryTime || !quoteForm.validUntil}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
