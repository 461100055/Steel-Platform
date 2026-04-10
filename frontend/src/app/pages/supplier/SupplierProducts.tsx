import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Package,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Plus,
  Download,
  MoreVertical,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
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
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  createProduct,
  deleteProduct,
  getProducts,
  type Product,
  updateProduct,
} from '../../lib/api';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../context/AuthContext';

type ProductFormState = {
  name: string;
  category: string;
  price: number | string;
  moq: number | string;
  unit: string;
  deliveryTime: string;
  description: string;
  inventory: number | string;
  image: string;
  specificationsText: string;
};

const initialProductForm: ProductFormState = {
  name: '',
  category: '',
  price: '',
  moq: 1,
  unit: 'ton',
  deliveryTime: '',
  description: '',
  inventory: '',
  image: '',
  specificationsText: '{}',
};

function getProductImage(product: Product) {
  if (product.image && String(product.image).trim()) return String(product.image);
  if (Array.isArray(product.images) && product.images.length > 0) return String(product.images[0]);
  return 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400';
}

function getProductInventory(product: Product) {
  const value = Number(product.inventory ?? product.stock ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getProductPrice(product: Product) {
  const value = Number(product.price ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getProductMoq(product: Product) {
  const value = Number(product.moq ?? product.min_order_quantity ?? 1);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function parseSpecificationsText(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    throw new Error('Specifications must be valid JSON.');
  }
}

function extractErrorMessage(error: any, fallback = 'Something went wrong.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  if (error?.error) return error.error;
  return fallback;
}

export default function SupplierProducts() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setPageError('');

      const data = await getProducts();

      let nextProducts = Array.isArray(data) ? data : [];

      if (user?.id) {
        const filteredBySupplier = nextProducts.filter(
          (product) => String(product.supplier_id ?? product.supplier ?? '') === String(user.id)
        );

        if (filteredBySupplier.length > 0) {
          nextProducts = filteredBySupplier;
        }
      }

      setProducts(nextProducts);
    } catch (error: any) {
      const message = extractErrorMessage(error, 'Failed to load products.');
      setPageError(message);
      setProducts([]);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.id]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const productName = String(product.name || '').toLowerCase();
      const productCategory = String(product.category || '').toLowerCase();
      const inventory = getProductInventory(product);

      const matchesSearch =
        query === '' ||
        productName.includes(query) ||
        productCategory.includes(query);

      const matchesCategory =
        categoryFilter === 'all' || String(product.category || '') === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'low-stock' && inventory > 0 && inventory < 100) ||
        (statusFilter === 'in-stock' && inventory >= 100) ||
        (statusFilter === 'out-of-stock' && inventory === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const activeProducts = products.length;

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const inventory = getProductInventory(p);
      return inventory > 0 && inventory < 100;
    }).length;
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => getProductInventory(p) === 0).length;
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => sum + getProductPrice(p) * getProductInventory(p), 0);
  }, [products]);

  const categories = useMemo(() => {
    return [
      'all',
      ...Array.from(
        new Set(products.map((p) => String(p.category || '').trim()).filter(Boolean))
      ),
    ];
  }, [products]);

  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setFormError('');
    setSelectedProduct(null);
  };

  const validateProductForm = () => {
    if (!productForm.name.trim()) {
      throw new Error('Product name is required.');
    }

    if (!productForm.category.trim()) {
      throw new Error('Category is required.');
    }

    const price = Number(productForm.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Price must be greater than zero.');
    }

    const moq = Number(productForm.moq);
    if (!Number.isFinite(moq) || moq <= 0) {
      throw new Error('MOQ must be greater than zero.');
    }

    const inventory = Number(productForm.inventory);
    if (!Number.isFinite(inventory) || inventory < 0) {
      throw new Error('Inventory must be zero or greater.');
    }

    if (!productForm.deliveryTime.trim()) {
      throw new Error('Delivery time is required.');
    }

    parseSpecificationsText(productForm.specificationsText || '{}');
  };

  const buildProductPayload = () => {
    const specifications = parseSpecificationsText(productForm.specificationsText || '{}');

    return {
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price: Number(productForm.price),
      moq: Number(productForm.moq),
      unit: productForm.unit.trim() || 'ton',
      delivery_time: productForm.deliveryTime.trim(),
      description: productForm.description.trim(),
      inventory: Number(productForm.inventory),
      image: productForm.image.trim(),
      specifications,
    };
  };

  const handleAddProduct = async () => {
    try {
      setIsSaving(true);
      setFormError('');

      validateProductForm();

      const created = await createProduct(buildProductPayload());
      setProducts((prev) => [created, ...prev]);

      setIsAddDialogOpen(false);
      resetProductForm();
      toast.success(`Product "${created.name}" has been added successfully.`);
    } catch (error: any) {
      const message = extractErrorMessage(error, 'Failed to add product.');
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    try {
      setIsSaving(true);
      setFormError('');

      validateProductForm();

      const updated = await updateProduct(selectedProduct.id, buildProductPayload());

      setProducts((prev) =>
        prev.map((product) =>
          String(product.id) === String(selectedProduct.id) ? updated : product
        )
      );

      setIsEditDialogOpen(false);
      resetProductForm();
      toast.success('Product updated successfully.');
    } catch (error: any) {
      const message = extractErrorMessage(error, 'Failed to update product.');
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string | number) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => String(product.id) !== String(productId)));
      toast.success('Product deleted successfully.');
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'Failed to delete product.'));
    }
  };

  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormError('');
    setProductForm({
      name: String(product.name || ''),
      category: String(product.category || ''),
      price: getProductPrice(product),
      moq: getProductMoq(product),
      unit: String(product.unit || 'ton'),
      deliveryTime: String(product.deliveryTime || product.delivery_time || ''),
      description: String(product.description || ''),
      inventory: getProductInventory(product),
      image: String(product.image || ''),
      specificationsText: JSON.stringify(product.specifications || {}, null, 2),
    });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    resetProductForm();
    setIsAddDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854]">Product Management</h1>
            <p className="mt-1 text-[#6B7280]">Manage your product catalog and inventory</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => toast.info('Export feature can be added next.')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={openAddDialog} className="bg-[#0F2854] hover:bg-[#1C4D8D]">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{activeProducts}</div>
              <p className="mt-1 text-xs text-[#6B7280]">Total listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
              <p className="mt-1 text-xs text-[#6B7280]">Below 100 units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
              <p className="mt-1 text-xs text-[#6B7280]">Need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#6B7280]">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">
                {(totalValue / 1000).toFixed(0)}K SAR
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">Inventory value</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Search and filter your product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-[#E5E7EB] bg-white pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full border-[#E5E7EB] bg-white md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full border-[#E5E7EB] bg-white md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pageError && (
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-700">
                  {pageError}
                </AlertDescription>
              </Alert>
            )}

            {!pageError && !isLoading && products.length === 0 && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  No supplier-specific product endpoint exists yet in the backend. If your products do not appear here,
                  we should add `/api/supplier/products/` next.
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="py-12 text-center text-[#6B7280]">Loading products...</div>
            ) : (
              <Tabs defaultValue="grid" className="w-full">
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="mt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => {
                      const inventory = getProductInventory(product);
                      const price = getProductPrice(product);

                      return (
                        <Card key={String(product.id)} className="overflow-hidden transition-shadow hover:shadow-lg">
                          <div className="relative">
                            <img
                              src={getProductImage(product)}
                              alt={String(product.name)}
                              className="h-48 w-full object-cover"
                            />
                            {inventory === 0 ? (
                              <Badge className="absolute right-2 top-2 bg-red-600">Out of Stock</Badge>
                            ) : inventory < 100 ? (
                              <Badge className="absolute right-2 top-2 bg-orange-600">Low Stock</Badge>
                            ) : null}
                          </div>

                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{String(product.name)}</CardTitle>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      to={`/supplier/products/edit/${product.id}`}
                                      className="flex cursor-pointer items-center"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => handleOpenEditDialog(product)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Quick Edit
                                  </DropdownMenuItem>

                                  <DropdownMenuItem asChild>
                                    <Link
                                      to={`/supplier/products/edit/${product.id}`}
                                      className="flex cursor-pointer items-center"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Page
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <p className="text-sm text-[#6B7280]">{String(product.category || '')}</p>
                          </CardHeader>

                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#6B7280]">Price</span>
                                <span className="font-semibold text-[#111827]">
                                  {price.toLocaleString()} SAR/{String(product.unit || 'unit')}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#6B7280]">Stock</span>
                                <span
                                  className={`font-medium ${
                                    inventory === 0
                                      ? 'text-red-600'
                                      : inventory < 100
                                      ? 'text-orange-600'
                                      : 'text-green-600'
                                  }`}
                                >
                                  {inventory} {String(product.unit || 'unit')}
                                </span>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="flex-1" asChild>
                                  <Link to={`/supplier/products/edit/${product.id}`}>
                                    <Edit className="mr-1 h-3 w-3" />
                                    Edit
                                  </Link>
                                </Button>

                                <Button size="sm" variant="outline" className="flex-1" asChild>
                                  <Link to={`/supplier/products/edit/${product.id}`}>
                                    <Eye className="mr-1 h-3 w-3" />
                                    View
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="list" className="mt-6">
                  <div className="space-y-4">
                    {filteredProducts.map((product) => {
                      const inventory = getProductInventory(product);
                      const price = getProductPrice(product);

                      return (
                        <Card key={String(product.id)} className="transition-shadow hover:shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={getProductImage(product)}
                                alt={String(product.name)}
                                className="h-20 w-20 rounded-lg object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="truncate font-semibold text-[#111827]">
                                      {String(product.name)}
                                    </h3>
                                    <p className="mt-1 text-sm text-[#6B7280]">{String(product.category || '')}</p>

                                    <div className="mt-2 flex items-center gap-4">
                                      <span className="text-sm text-[#6B7280]">
                                        SKU: {String(product.id)}
                                      </span>

                                      {inventory === 0 ? (
                                        <Badge variant="outline" className="border-red-600 text-red-600">
                                          <AlertTriangle className="mr-1 h-3 w-3" />
                                          Out of Stock
                                        </Badge>
                                      ) : inventory < 100 ? (
                                        <Badge variant="outline" className="border-orange-600 text-orange-600">
                                          <AlertTriangle className="mr-1 h-3 w-3" />
                                          Low Stock
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="ml-4 flex items-center gap-6">
                                    <div className="text-right">
                                      <p className="text-sm text-[#6B7280]">Price</p>
                                      <p className="font-semibold text-[#111827]">
                                        {price.toLocaleString()} SAR
                                      </p>
                                      <p className="text-xs text-[#6B7280]">
                                        per {String(product.unit || 'unit')}
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-sm text-[#6B7280]">Stock</p>
                                      <p
                                        className={`font-semibold ${
                                          inventory === 0
                                            ? 'text-red-600'
                                            : inventory < 100
                                            ? 'text-orange-600'
                                            : 'text-green-600'
                                        }`}
                                      >
                                        {inventory}
                                      </p>
                                      <p className="text-xs text-[#6B7280]">{String(product.unit || 'unit')}</p>
                                    </div>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                          <Link
                                            to={`/supplier/products/edit/${product.id}`}
                                            className="flex cursor-pointer items-center"
                                          >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                          </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => handleOpenEditDialog(product)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Quick Edit
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                          <Link
                                            to={`/supplier/products/edit/${product.id}`}
                                            className="flex cursor-pointer items-center"
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Page
                                          </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() => handleDeleteProduct(product.id)}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-[#6B7280]" />
                <h3 className="mb-2 text-lg font-semibold text-[#111827]">No products found</h3>
                <p className="mb-6 text-[#6B7280]">Try adjusting your search or filters</p>
                <Button asChild className="bg-[#0F2854] hover:bg-[#1C4D8D]">
                  <Link to="/supplier/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetProductForm();
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Add a new product to your catalog.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {formError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">{formError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-category">Category</Label>
              <Input
                id="add-category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-price">Price</Label>
              <Input
                id="add-price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-moq">MOQ</Label>
              <Input
                id="add-moq"
                type="number"
                value={productForm.moq}
                onChange={(e) => setProductForm({ ...productForm, moq: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-unit">Unit</Label>
              <Input
                id="add-unit"
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-deliveryTime">Delivery Time</Label>
              <Input
                id="add-deliveryTime"
                value={productForm.deliveryTime}
                onChange={(e) => setProductForm({ ...productForm, deliveryTime: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-image">Image URL</Label>
              <Input
                id="add-image"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-description">Description</Label>
              <Textarea
                id="add-description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-inventory">Inventory</Label>
              <Input
                id="add-inventory"
                type="number"
                value={productForm.inventory}
                onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-specifications">Specifications</Label>
              <Textarea
                id="add-specifications"
                value={productForm.specificationsText}
                onChange={(e) => setProductForm({ ...productForm, specificationsText: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddProduct} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetProductForm();
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Edit the product details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {formError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">{formError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-moq">MOQ</Label>
              <Input
                id="edit-moq"
                type="number"
                value={productForm.moq}
                onChange={(e) => setProductForm({ ...productForm, moq: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-unit">Unit</Label>
              <Input
                id="edit-unit"
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-deliveryTime">Delivery Time</Label>
              <Input
                id="edit-deliveryTime"
                value={productForm.deliveryTime}
                onChange={(e) => setProductForm({ ...productForm, deliveryTime: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-inventory">Inventory</Label>
              <Input
                id="edit-inventory"
                type="number"
                value={productForm.inventory}
                onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-specifications">Specifications</Label>
              <Textarea
                id="edit-specifications"
                value={productForm.specificationsText}
                onChange={(e) => setProductForm({ ...productForm, specificationsText: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditProduct} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}