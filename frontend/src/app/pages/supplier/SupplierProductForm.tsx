import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  X,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from '../../lib/api';

interface ProductFormData {
  name: string;
  category: string;
  price: number;
  moq: number;
  unit: string;
  deliveryTime: string;
  description: string;
  inventory: number;
  specifications: Record<string, string>;
  image: string;
}

const categories = [
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

const units = ['ton', 'kg', 'piece', 'meter', 'bundle', 'sheet'];

const initialFormData: ProductFormData = {
  name: '',
  category: '',
  price: 0,
  moq: 1,
  unit: 'ton',
  deliveryTime: '',
  description: '',
  inventory: 0,
  specifications: {},
  image: '',
};

function isBase64Image(value: string) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

function extractErrorMessage(error: any) {
  if (!error) return 'Failed to save product.';
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  return 'Failed to save product.';
}

export default function SupplierProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!isEditMode || !id) return;

      try {
        setIsLoadingProduct(true);
        setPageError('');

        const product = await getProductById(id);

        const normalizedSpecs =
          product.specifications &&
          typeof product.specifications === 'object' &&
          !Array.isArray(product.specifications)
            ? (product.specifications as Record<string, string>)
            : {};

        const mainImage =
          (typeof product.image === 'string' && product.image) || '';

        setFormData({
          name: String(product.name || ''),
          category: String(product.category || ''),
          price: Number(product.price || 0),
          moq: Number(product.moq ?? product.min_order_quantity ?? 1),
          unit: String(product.unit || 'ton'),
          deliveryTime: String(product.deliveryTime || product.delivery_time || ''),
          description: String(product.description || ''),
          inventory: Number(product.inventory ?? product.stock ?? 0),
          specifications: normalizedSpecs,
          image: mainImage,
        });

        setImagePreview(mainImage);
      } catch (error: any) {
        const message = extractErrorMessage(error);
        setPageError(message);
        toast.error(message);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, isEditMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const image = reader.result as string;
      setImagePreview(image);
      setFormData((prev) => ({
        ...prev,
        image,
      }));
      toast.success('Image selected.');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    toast.info('Image removed');
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim(),
        },
      }));
      setNewSpecKey('');
      setNewSpecValue('');
      toast.success('Specification added');
    }
  };

  const removeSpecification = (key: string) => {
    const { [key]: _, ...rest } = formData.specifications;
    setFormData((prev) => ({
      ...prev,
      specifications: rest,
    }));
    toast.info('Specification removed');
  };

  const buildPayload = () => {
    return {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      moq: Number(formData.moq),
      unit: formData.unit,
      delivery_time: formData.deliveryTime.trim(),
      description: formData.description.trim(),
      inventory: Number(formData.inventory),
      specifications: formData.specifications,
      image: formData.image.trim(),
    };
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error('Product name is required.');
    }

    if (!formData.category) {
      throw new Error('Category is required.');
    }

    if (!formData.description.trim()) {
      throw new Error('Description is required.');
    }

    if (!Number.isFinite(Number(formData.price)) || Number(formData.price) <= 0) {
      throw new Error('Price must be greater than zero.');
    }

    if (!Number.isFinite(Number(formData.moq)) || Number(formData.moq) <= 0) {
      throw new Error('Minimum order quantity must be greater than zero.');
    }

    if (!Number.isFinite(Number(formData.inventory)) || Number(formData.inventory) < 0) {
      throw new Error('Inventory must be zero or greater.');
    }

    if (!formData.deliveryTime.trim()) {
      throw new Error('Delivery time is required.');
    }

    if (formData.image && isBase64Image(formData.image)) {
      throw new Error(
        'The backend does not accept local uploaded image data yet. Please use a direct image URL instead.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      validateForm();

      const payload = buildPayload();

      if (isEditMode && id) {
        await updateProduct(id, payload);
        toast.success('Product updated successfully.');
      } else {
        await createProduct(payload);
        toast.success('Product created successfully.');
      }

      navigate('/supplier/products');
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!isEditMode || !id) return;

    try {
      setIsSubmitting(true);
      await deleteProduct(id);
      toast.success('Product deleted successfully.');
      navigate('/supplier/products');
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/supplier/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#0F2854]">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="mt-1 text-[#6B7280]">
                {isEditMode
                  ? 'Update product information and details'
                  : 'Add a new product to your catalog'}
              </p>
            </div>
          </div>
        </div>

        {pageError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{pageError}</AlertDescription>
          </Alert>
        )}

        {isLoadingProduct ? (
          <Card>
            <CardContent className="py-10 text-center text-[#6B7280]">
              Loading product details...
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the core details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Hot Rolled Steel Sheet"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product in detail..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Set pricing and stock information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (SAR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: Number(e.target.value || 0) })
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moq">Minimum Order Quantity *</Label>
                    <Input
                      id="moq"
                      type="number"
                      value={formData.moq}
                      onChange={(e) =>
                        setFormData({ ...formData, moq: Number(e.target.value || 1) })
                      }
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inventory">Current Inventory *</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={formData.inventory}
                      onChange={(e) =>
                        setFormData({ ...formData, inventory: Number(e.target.value || 0) })
                      }
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Delivery Time *</Label>
                    <Input
                      id="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryTime: e.target.value })
                      }
                      placeholder="e.g., 7-10 days"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>
                  Use a direct image URL. Local file upload is not supported by the current backend.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image">Main Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, image: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/product-image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Or select a local file for preview only</Label>
                  <div className="flex items-start gap-4">
                    {imagePreview ? (
                      <div className="relative h-64 w-64 overflow-hidden rounded-lg border-2 border-[#E5E7EB]">
                        <ImageWithFallback
                          src={imagePreview}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 bg-white/90 hover:bg-white"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] transition-colors hover:border-[#1C4D8D]">
                        <ImageIcon className="mb-2 h-12 w-12 text-[#6B7280]" />
                        <span className="mb-1 text-sm text-[#6B7280]">Select image</span>
                        <span className="text-xs text-[#9CA3AF]">Preview only</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}

                    <div className="flex-1">
                      <p className="mb-2 text-sm text-[#6B7280]">
                        If you use local upload, it will preview only.
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        To save successfully, paste a direct public image URL in the field above.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
                <CardDescription>Add detailed specifications and properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(formData.specifications).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 rounded-lg bg-[#F9FAFB] p-3">
                        <div className="grid flex-1 grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-[#374151]">{key}</span>
                          </div>
                          <div>
                            <span className="text-sm text-[#6B7280]">{value}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Add Specification</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Property name (e.g., Grade)"
                      className="flex-1"
                    />
                    <Input
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Value (e.g., ASTM A36)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addSpecification}
                      disabled={!newSpecKey || !newSpecValue}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/supplier/products')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <div className="flex gap-3">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    disabled={isSubmitting}
                    onClick={handleDeleteProduct}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Product
                  </Button>
                )}

                <Button
                  type="submit"
                  className="bg-[#0F2854] hover:bg-[#1C4D8D]"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}