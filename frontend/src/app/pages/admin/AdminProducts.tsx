import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
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
import { Label } from '../../components/ui/label';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCcw,
  Package,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { API_BASE_URL, getAdminProducts } from '../../lib/api';

type ProductStatus = 'all' | 'pending' | 'approved' | 'rejected';

type ProductRowStatus = 'pending' | 'approved' | 'rejected';

type AdminProduct = {
  id: string;
  name: string;
  supplierName: string;
  category: string;
  price: number;
  stock: number;
  submittedDate: string;
  status: ProductRowStatus;
  image: string;
  isActive: boolean;
};

type EditProductForm = {
  name: string;
  category: string;
  price: string;
  stock: string;
  status: ProductRowStatus;
  image: string;
};

const PRODUCT_CATEGORIES = [
  'Steel Sheets',
  'Steel Pipes',
  'Steel Coils',
  'Rebar',
  'Steel Beams',
  'Structural Steel',
  'Galvanized Steel',
  'Stainless Steel',
  'Carbon Steel',
  'Alloy Steel',
];

const INITIAL_EDIT_FORM: EditProductForm = {
  name: '',
  category: '',
  price: '',
  stock: '',
  status: 'pending',
  image: '',
};

function getAccessToken() {
  return localStorage.getItem('access') || '';
}

function getErrorMessage(data: any, fallback = 'Request failed.') {
  if (!data) return fallback;

  if (typeof data === 'string') return data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;

  if (typeof data === 'object') {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const method = String(options.method || 'GET').toUpperCase();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(method !== 'GET' && method !== 'DELETE' && !isFormData
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Request failed.'));
  }

  return data;
}

function normalizeProduct(apiProduct: any): AdminProduct {
  const price = Number(apiProduct?.price ?? 0);
  const stock = Number(apiProduct?.inventory ?? apiProduct?.stock ?? 0);

  return {
    id: String(apiProduct?.id ?? ''),
    name: String(apiProduct?.name || 'Product'),
    supplierName: String(
      apiProduct?.supplier_name ||
        apiProduct?.supplierName ||
        apiProduct?.supplier?.username ||
        apiProduct?.supplier?.email ||
        'Supplier'
    ),
    category: String(apiProduct?.category || '-'),
    price: Number.isFinite(price) ? price : 0,
    stock: Number.isFinite(stock) ? stock : 0,
    submittedDate: String(
      apiProduct?.created_at || apiProduct?.submitted_date || apiProduct?.submittedDate || ''
    ),
    status: String(apiProduct?.status || 'pending') as ProductRowStatus,
    image: String(apiProduct?.image || ''),
    isActive: Boolean(apiProduct?.is_active),
  };
}

async function approveAdminProduct(productId: string) {
  const data = await apiRequest(`/admin/products/${productId}/approve/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeProduct(data?.product ?? data);
}

async function rejectAdminProduct(productId: string) {
  const data = await apiRequest(`/admin/products/${productId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return normalizeProduct(data?.product ?? data);
}

async function updateAdminProduct(productId: string, payload: any) {
  const data = await apiRequest(`/admin/products/${productId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeProduct(data?.product ?? data);
}

async function deleteAdminProduct(productId: string) {
  await apiRequest(`/admin/products/${productId}/`, {
    method: 'DELETE',
  });
}

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus>('all');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageError, setPageError] = useState('');
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [editForm, setEditForm] = useState<EditProductForm>(INITIAL_EDIT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      if (mode === 'initial') {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setPageError('');
      const data = await getAdminProducts();
      setProducts((data || []).map(normalizeProduct));
    } catch (error: any) {
      console.error('Failed to load admin products:', error);
      setPageError(error?.message || 'Failed to load products.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts('initial');
  }, [loadProducts]);

  const handleApprove = async (productId: string) => {
    const product = products.find((p) => p.id === productId);

    try {
      setProcessingProductId(productId);
      const updatedProduct = await approveAdminProduct(productId);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p))
      );

      toast.success(`"${product?.name}" has been approved successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve product');
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleReject = async (productId: string) => {
    const product = products.find((p) => p.id === productId);

    try {
      setProcessingProductId(productId);
      const updatedProduct = await rejectAdminProduct(productId);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p))
      );

      toast.error(`"${product?.name}" has been rejected`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject product');
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setProcessingProductId(productId);
      await deleteAdminProduct(productId);

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success(`"${product?.name}" has been deleted successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete product');
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleEdit = (product: AdminProduct) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      status: product.status,
      image: product.image || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
      setEditForm(INITIAL_EDIT_FORM);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    const trimmedName = editForm.name.trim();
    const trimmedCategory = editForm.category.trim();
    const trimmedImage = editForm.image.trim();

    if (!trimmedName) {
      toast.error('Product name is required');
      return;
    }

    if (!trimmedCategory) {
      toast.error('Category is required');
      return;
    }

    if (!editForm.price || Number(editForm.price) <= 0) {
      toast.error('Price must be greater than zero');
      return;
    }

    if (Number(editForm.stock) < 0) {
      toast.error('Stock must be zero or greater');
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: trimmedName,
        category: trimmedCategory,
        price: Number(editForm.price),
        inventory: Number(editForm.stock),
        status: editForm.status,
        image: trimmedImage,
      };

      const updatedProduct = await updateAdminProduct(selectedProduct.id, payload);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === selectedProduct.id ? updatedProduct : product
        )
      );

      toast.success(`"${updatedProduct.name}" has been updated successfully`);
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      setEditForm(INITIAL_EDIT_FORM);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.supplierName.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      pending: products.filter((p) => p.status === 'pending').length,
      approved: products.filter((p) => p.status === 'approved').length,
      rejected: products.filter((p) => p.status === 'rejected').length,
    };
  }, [products]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-60 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-8 w-16 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 rounded bg-gray-200" />
                <div className="h-64 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-[#0F2854]">Product Management</h1>
            <p className="text-[#6B7280]">
              Review, approve, and manage all products on the platform
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => loadProducts('refresh')}
            disabled={isRefreshing}
            className="w-full md:w-auto"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {pageError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {pageError}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#6B7280]">
                <Package className="h-4 w-4" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#6B7280]">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search by product name, supplier, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ProductStatus)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-[#6B7280]">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const isProcessing = processingProductId === product.id;

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E5E7EB] text-xs text-[#6B7280]">
                                  No Image
                                </div>
                              )}

                              <div>
                                <div className="font-medium text-[#111827]">
                                  {product.name}
                                </div>
                                <div className="text-xs text-[#9CA3AF]">
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {product.supplierName}
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {product.category}
                          </TableCell>

                          <TableCell className="font-medium text-[#111827]">
                            {product.price.toLocaleString()} SAR
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                product.stock > 100
                                  ? 'bg-green-100 text-green-800'
                                  : product.stock > 0
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {product.stock} units
                            </Badge>
                          </TableCell>

                          <TableCell className="text-[#6B7280]">
                            {formatDate(product.submittedDate)}
                          </TableCell>

                          <TableCell>{getStatusBadge(product.status)}</TableCell>

                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(product)}
                                title="Edit product"
                                disabled={isProcessing}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              {product.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(product.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                    title="Approve product"
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(product.id)}
                                    className="text-red-600 hover:bg-red-50"
                                    title="Reject product"
                                    disabled={isProcessing}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:bg-red-50"
                                title="Delete product"
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information from the admin panel
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_category">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger id="product_category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="product_price">Price</Label>
                  <Input
                    id="product_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_stock">Stock</Label>
                  <Input
                    id="product_stock"
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, stock: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: value as ProductRowStatus,
                      }))
                    }
                  >
                    <SelectTrigger id="product_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_image">Image URL</Label>
                <Input
                  id="product_image"
                  value={editForm.image}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              {editForm.image && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB]">
                    <img
                      src={editForm.image}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}