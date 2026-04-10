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
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Package,
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign,
  Building,
  Download,
  Upload,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface RFQItem {
  productName: string;
  specifications: string;
  quantity: string;
  unit: string;
}

interface Quote {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: string;
  terms: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedDate: string;
}

interface RFQ {
  id: string;
  title: string;
  category: string;
  description: string;
  items: RFQItem[];
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  createdDate: string;
  quotesReceived: number;
  quotes: Quote[];
}

export default function BuyerRFQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isQuotesDialogOpen, setIsQuotesDialogOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);

  // New RFQ form state
  const [newRFQ, setNewRFQ] = useState({
    title: '',
    category: '',
    description: '',
    deadline: '',
  });

  const [rfqItems, setRfqItems] = useState<RFQItem[]>([
    { productName: '', specifications: '', quantity: '', unit: 'tons' }
  ]);

  // Mock data
  const [rfqRequests, setRfqRequests] = useState<RFQ[]>([
    {
      id: 'RFQ-2026-001',
      title: 'Hot Rolled Steel Sheets - Q1 2026',
      category: 'Steel Sheets',
      description: 'Requirement for high-quality hot rolled steel sheets for construction project',
      items: [
        {
          productName: 'Hot Rolled Steel Sheet',
          specifications: 'Grade: ASTM A36, Thickness: 6mm, Width: 1500mm',
          quantity: '50',
          unit: 'tons'
        }
      ],
      deadline: '2026-03-20',
      status: 'published',
      createdDate: '2026-03-05',
      quotesReceived: 5,
      quotes: [
        {
          id: 'Q-001',
          supplierId: 'SUP-001',
          supplierName: 'Saudi Steel Industries',
          supplierRating: 4.8,
          unitPrice: 2850,
          totalPrice: 142500,
          deliveryTime: '14 days',
          terms: 'Payment: 50% advance, 50% on delivery. Free shipping to Riyadh.',
          status: 'pending',
          submittedDate: '2026-03-07'
        },
        {
          id: 'Q-002',
          supplierId: 'SUP-002',
          supplierName: 'Al-Rajhi Metal Trading',
          supplierRating: 4.6,
          unitPrice: 2900,
          totalPrice: 145000,
          deliveryTime: '10 days',
          terms: 'Payment: 30% advance, 70% on delivery. Shipping cost separate.',
          status: 'pending',
          submittedDate: '2026-03-08'
        },
        {
          id: 'Q-003',
          supplierId: 'SUP-003',
          supplierName: 'National Steel Corp',
          supplierRating: 4.9,
          unitPrice: 2750,
          totalPrice: 137500,
          deliveryTime: '21 days',
          terms: 'Payment: Net 30 days. Free shipping within Saudi Arabia.',
          status: 'accepted',
          submittedDate: '2026-03-06'
        }
      ]
    },
    {
      id: 'RFQ-2026-002',
      title: 'Galvanized Steel Coils',
      category: 'Steel Coils',
      description: 'Need galvanized steel coils for manufacturing facility',
      items: [
        {
          productName: 'Galvanized Steel Coil',
          specifications: 'Thickness: 0.8mm, Width: 1200mm, Zinc coating: Z275',
          quantity: '30',
          unit: 'tons'
        }
      ],
      deadline: '2026-03-25',
      status: 'published',
      createdDate: '2026-03-08',
      quotesReceived: 3,
      quotes: []
    },
    {
      id: 'RFQ-2026-003',
      title: 'Steel Rebars for Infrastructure',
      category: 'Rebar',
      description: 'Large quantity steel rebars required for infrastructure development',
      items: [
        {
          productName: 'Deformed Steel Rebar',
          specifications: 'Grade: 60, Diameter: 16mm, Length: 12m',
          quantity: '100',
          unit: 'tons'
        }
      ],
      deadline: '2026-03-15',
      status: 'closed',
      createdDate: '2026-02-20',
      quotesReceived: 8,
      quotes: []
    },
    {
      id: 'RFQ-2026-004',
      title: 'Stainless Steel Pipes',
      category: 'Pipes',
      description: 'Stainless steel pipes for water treatment plant',
      items: [
        {
          productName: 'Stainless Steel Pipe',
          specifications: 'Grade: 304, Diameter: 100mm, Schedule: 40',
          quantity: '500',
          unit: 'meters'
        }
      ],
      deadline: '2026-04-01',
      status: 'draft',
      createdDate: '2026-03-09',
      quotesReceived: 0,
      quotes: []
    }
  ]);

  const stats = [
    { label: 'Total RFQs', value: rfqRequests.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Published', value: rfqRequests.filter(r => r.status === 'published').length, icon: Send, color: 'bg-green-100 text-green-600' },
    { label: 'Quotes Received', value: rfqRequests.reduce((sum, r) => sum + r.quotesReceived, 0), icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Awarded', value: rfqRequests.filter(r => r.status === 'awarded').length, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  ];

  const handleAddItem = () => {
    setRfqItems([...rfqItems, { productName: '', specifications: '', quantity: '', unit: 'tons' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (rfqItems.length > 1) {
      setRfqItems(rfqItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof RFQItem, value: string) => {
    const updatedItems = [...rfqItems];
    updatedItems[index][field] = value;
    setRfqItems(updatedItems);
  };

  const handleCreateRFQ = () => {
    if (!newRFQ.title || !newRFQ.category || !newRFQ.description || !newRFQ.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rfq: RFQ = {
      id: `RFQ-2026-${String(rfqRequests.length + 1).padStart(3, '0')}`,
      ...newRFQ,
      items: rfqItems,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      quotesReceived: 0,
      quotes: []
    };

    setRfqRequests([rfq, ...rfqRequests]);
    setIsCreateDialogOpen(false);
    setNewRFQ({ title: '', category: '', description: '', deadline: '' });
    setRfqItems([{ productName: '', specifications: '', quantity: '', unit: 'tons' }]);
    toast.success('RFQ created successfully!');
  };

  const handlePublishRFQ = (rfqId: string) => {
    setRfqRequests(rfqRequests.map(rfq =>
      rfq.id === rfqId ? { ...rfq, status: 'published' } : rfq
    ));
    toast.success('RFQ published successfully!');
  };

  const handleAcceptQuote = (rfqId: string, quoteId: string) => {
    setRfqRequests(rfqRequests.map(rfq => {
      if (rfq.id === rfqId) {
        return {
          ...rfq,
          status: 'awarded',
          quotes: rfq.quotes.map(q =>
            q.id === quoteId ? { ...q, status: 'accepted' } : { ...q, status: 'rejected' }
          )
        };
      }
      return rfq;
    }));
    toast.success('Quote accepted and RFQ awarded!');
    setIsQuotesDialogOpen(false);
  };

  const handleRejectQuote = (rfqId: string, quoteId: string) => {
    setRfqRequests(rfqRequests.map(rfq => {
      if (rfq.id === rfqId) {
        return {
          ...rfq,
          quotes: rfq.quotes.map(q =>
            q.id === quoteId ? { ...q, status: 'rejected' } : q
          )
        };
      }
      return rfq;
    }));
    toast.success('Quote rejected');
  };

  const handleViewRFQ = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setIsViewDialogOpen(true);
  };

  const handleViewQuotes = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setIsQuotesDialogOpen(true);
  };

  const getStatusBadge = (status: RFQ['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-blue-100 text-blue-800',
      closed: 'bg-orange-100 text-orange-800',
      awarded: 'bg-green-100 text-green-800'
    };
    return <Badge className={styles[status]}>{status.toUpperCase()}</Badge>;
  };

  const filteredRFQs = rfqRequests.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854]">RFQ Requests</h1>
            <p className="text-[#6B7280] mt-1">Request quotes from multiple suppliers and compare offers</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#0F2854] hover:bg-[#1C4D8D]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New RFQ
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#111827] mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search by RFQ ID or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-[#E5E7EB]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-white border-[#E5E7EB]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* RFQ List */}
        <div className="space-y-4">
          {filteredRFQs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-[#D1D5DB] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">No RFQs Found</h3>
                  <p className="text-[#6B7280] mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Create your first RFQ to get started'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                      <Plus className="h-4 w-4 mr-2" />
                      Create RFQ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredRFQs.map((rfq) => (
              <Card key={rfq.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-[#BDE8F5] flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-[#0F2854]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-[#111827]">{rfq.title}</h3>
                            {getStatusBadge(rfq.status)}
                          </div>
                          <p className="text-sm text-[#6B7280] mt-1">
                            RFQ ID: {rfq.id} • Category: {rfq.category}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#6B7280]">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {new Date(rfq.createdDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Deadline: {new Date(rfq.deadline).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              <span>{rfq.items.length} item(s)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {rfq.quotesReceived > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => handleViewQuotes(rfq)}
                          className="border-[#0F2854] text-[#0F2854] hover:bg-[#F0F9FF]"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {rfq.quotesReceived} Quote{rfq.quotesReceived !== 1 ? 's' : ''}
                        </Button>
                      )}

                      {rfq.status === 'draft' && (
                        <Button
                          onClick={() => handlePublishRFQ(rfq.id)}
                          className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Publish
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewRFQ(rfq)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {rfq.status === 'draft' && (
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit RFQ
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          {rfq.status === 'draft' && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create RFQ Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New RFQ Request</DialogTitle>
            <DialogDescription>
              Fill in the details below to request quotes from suppliers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#111827]">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">RFQ Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Hot Rolled Steel Sheets - Q1 2026"
                  value={newRFQ.title}
                  onChange={(e) => setNewRFQ({ ...newRFQ, title: e.target.value })}
                  className="bg-white border-[#E5E7EB]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newRFQ.category} onValueChange={(value) => setNewRFQ({ ...newRFQ, category: value })}>
                    <SelectTrigger className="bg-white border-[#E5E7EB]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Steel Sheets">Steel Sheets</SelectItem>
                      <SelectItem value="Steel Coils">Steel Coils</SelectItem>
                      <SelectItem value="Rebar">Rebar</SelectItem>
                      <SelectItem value="Pipes">Pipes & Tubes</SelectItem>
                      <SelectItem value="Beams">Beams & Sections</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Submission Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newRFQ.deadline}
                    onChange={(e) => setNewRFQ({ ...newRFQ, deadline: e.target.value })}
                    className="bg-white border-[#E5E7EB]"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed requirements and specifications..."
                  value={newRFQ.description}
                  onChange={(e) => setNewRFQ({ ...newRFQ, description: e.target.value })}
                  rows={4}
                  className="bg-white border-[#E5E7EB]"
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#111827]">Items Required</h3>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Item
                </Button>
              </div>

              {rfqItems.map((item, index) => (
                <Card key={index} className="bg-[#F9FAFB]">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-[#111827]">Item {index + 1}</h4>
                        {rfqItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Product Name</Label>
                          <Input
                            placeholder="e.g., Hot Rolled Steel Sheet"
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                            className="bg-white border-[#E5E7EB]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="bg-white border-[#E5E7EB]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit</Label>
                            <Select value={item.unit} onValueChange={(value) => handleItemChange(index, 'unit', value)}>
                              <SelectTrigger className="bg-white border-[#E5E7EB]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tons">Tons</SelectItem>
                                <SelectItem value="kg">Kilograms</SelectItem>
                                <SelectItem value="meters">Meters</SelectItem>
                                <SelectItem value="pieces">Pieces</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Specifications</Label>
                        <Textarea
                          placeholder="e.g., Grade: ASTM A36, Thickness: 6mm, Width: 1500mm"
                          value={item.specifications}
                          onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                          rows={2}
                          className="bg-white border-[#E5E7EB]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <h3 className="font-semibold text-[#111827]">Attachments (Optional)</h3>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-[#6B7280] mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Supported formats: PDF, DOC, XLS (Max 10MB)
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRFQ} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
              Create RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View RFQ Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>RFQ Details</DialogTitle>
            <DialogDescription>{selectedRFQ?.id}</DialogDescription>
          </DialogHeader>

          {selectedRFQ && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#111827]">{selectedRFQ.title}</h3>
                  {getStatusBadge(selectedRFQ.status)}
                </div>
                <p className="text-sm text-[#6B7280]">{selectedRFQ.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                <div>
                  <p className="text-xs text-[#6B7280]">Category</p>
                  <p className="font-medium text-[#111827]">{selectedRFQ.category}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Deadline</p>
                  <p className="font-medium text-[#111827]">{new Date(selectedRFQ.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Created Date</p>
                  <p className="font-medium text-[#111827]">{new Date(selectedRFQ.createdDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Quotes Received</p>
                  <p className="font-medium text-[#111827]">{selectedRFQ.quotesReceived}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#111827] mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedRFQ.items.map((item, index) => (
                    <Card key={index} className="bg-[#F9FAFB]">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-[#111827]">{item.productName}</h4>
                            <Badge variant="outline">{item.quantity} {item.unit}</Badge>
                          </div>
                          <p className="text-sm text-[#6B7280]">{item.specifications}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedRFQ && selectedRFQ.quotesReceived > 0 && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleViewQuotes(selectedRFQ);
              }} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                View Quotes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Quotes Dialog */}
      <Dialog open={isQuotesDialogOpen} onOpenChange={setIsQuotesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Received Quotes</DialogTitle>
            <DialogDescription>
              {selectedRFQ?.title} - {selectedRFQ?.quotesReceived} quote(s) received
            </DialogDescription>
          </DialogHeader>

          {selectedRFQ && (
            <div className="space-y-4">
              {selectedRFQ.quotes.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-[#D1D5DB] mx-auto mb-3" />
                  <p className="text-[#6B7280]">No quotes received yet</p>
                </div>
              ) : (
                selectedRFQ.quotes.map((quote) => (
                  <Card key={quote.id} className={quote.status === 'accepted' ? 'border-green-500 border-2' : ''}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-[#0F2854] flex items-center justify-center text-white font-semibold">
                              <Building className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#111827]">{quote.supplierName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < Math.floor(quote.supplierRating) ? 'text-yellow-400' : 'text-gray-300'}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm text-[#6B7280]">{quote.supplierRating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {quote.status === 'accepted' && (
                              <Badge className="bg-green-100 text-green-800">ACCEPTED</Badge>
                            )}
                            {quote.status === 'rejected' && (
                              <Badge className="bg-red-100 text-red-800">REJECTED</Badge>
                            )}
                            {quote.status === 'pending' && (
                              <Badge className="bg-blue-100 text-blue-800">PENDING</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                          <div>
                            <p className="text-xs text-[#6B7280]">Unit Price</p>
                            <p className="font-semibold text-[#111827]">{quote.unitPrice.toLocaleString()} SAR</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280]">Total Price</p>
                            <p className="font-semibold text-[#111827]">{quote.totalPrice.toLocaleString()} SAR</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280]">Delivery Time</p>
                            <p className="font-semibold text-[#111827]">{quote.deliveryTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7280]">Submitted</p>
                            <p className="font-semibold text-[#111827]">{new Date(quote.submittedDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-[#6B7280] mb-1">Terms & Conditions</p>
                          <p className="text-sm text-[#111827]">{quote.terms}</p>
                        </div>

                        {quote.status === 'pending' && selectedRFQ.status !== 'awarded' && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => handleRejectQuote(selectedRFQ.id, quote.id)}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleAcceptQuote(selectedRFQ.id, quote.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept Quote
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuotesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
