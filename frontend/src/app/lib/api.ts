const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/* =========================
   Helpers
========================= */

function getAccessToken(): string | null {
  return localStorage.getItem('access');
}

function saveAuthData(data: any) {
  const access = data?.access || data?.tokens?.access || data?.token?.access;
  const refresh = data?.refresh || data?.tokens?.refresh || data?.token?.refresh;
  const user = data?.user || null;

  if (access) localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('steel_platform_user', JSON.stringify(user));
  }
}

function clearAuthData() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  localStorage.removeItem('steel_platform_user');
}

function getAuthHeaders(includeJson = true): HeadersInit {
  const token = getAccessToken();

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractApiErrorMessage(data: any, fallback = 'Request failed') {
  if (!data) return fallback;

  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  const firstKey = Object.keys(data)[0];
  const firstValue = firstKey ? data[firstKey] : null;

  if (Array.isArray(firstValue) && firstValue.length > 0) {
    return String(firstValue[0]);
  }

  if (typeof firstValue === 'string') {
    return firstValue;
  }

  return fallback;
}

async function handleResponse(response: Response) {
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(data, 'Request failed'));
  }

  return data;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const includeJson =
    options.headers && options.headers instanceof Headers
      ? !options.headers.has('Content-Type') || options.headers.get('Content-Type') === 'application/json'
      : true;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(includeJson),
      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
}

function normalizeListResponse<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function toNumber(value: any, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/* =========================
   Public Utils
========================= */

export function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  return String(phone || '').trim();
}

export function getStoredUser() {
  try {
    const raw =
      localStorage.getItem('user') ||
      localStorage.getItem('steel_platform_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function logoutUser() {
  clearAuthData();
}

/* =========================
   Types
========================= */

export type UserRole =
  | 'buyer'
  | 'buyer_individual'
  | 'buyer_company'
  | 'buyer_establishment'
  | 'supplier'
  | 'admin';

export type User = {
  id: string | number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: UserRole | string | null;
  buyer_type?: string;
  phone?: string;
  city?: string;
  company?: string;
  status?: string;
  joined_date?: string;
};

export type Product = {
  id: string | number;
  supplier?: string | number;
  supplier_id?: string | number;
  supplier_name?: string;
  supplierName?: string;

  name: string;
  description?: string;
  category?: string;
  price?: number;
  unit?: string;

  moq?: number;
  min_order_quantity?: number;

  inventory?: number;
  stock?: number;

  delivery_time?: string;
  deliveryTime?: string;

  image?: string;
  images?: string[];

  specifications?: Record<string, any>;

  rating?: number;
  stock_status?: string;
  stockStatus?: string;
  badge?: string;

  is_active?: boolean;
  status?: string;

  created_at?: string;
  updated_at?: string;
};

export type OrderItem = {
  id?: string | number;
  product?: string | number;
  product_name?: string;
  name?: string;
  quantity?: number;
  price?: number;
  unit?: string;
  product_details?: Product;
};

export type Order = {
  id: string | number;
  order_number?: string;

  buyer?: string | number;

  total_price?: number;
  total?: number;
  total_amount?: number;

  status?: string;
  order_status?: string;
  payment_status?: string;

  notes?: string;
  created_at?: string;
  createdAt?: string;
  date?: string;
  order_date?: string;

  quantity?: number;
  unit?: string;
  product_name?: string;

  supplier_name?: string;
  supplierName?: string;
  supplier?: {
    company?: string;
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
  };

  items?: OrderItem[];

  delivery_address?: string;
  shipping_address?: string;

  delivery_info?: any;
  billing_info?: any;
  order_info?: any;
};

export type DashboardStats = {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  totalOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
};

export interface AdminAnalyticsSummary {
  total_users: number;
  total_buyers: number;
  total_suppliers: number;
  total_admins: number;

  total_products: number;
  approved_products: number;
  pending_products: number;
  rejected_products: number;

  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  completed_orders: number;
  cancelled_orders: number;

  total_rfqs: number;
  pending_rfqs: number;
  quoted_rfqs: number;
  accepted_rfqs: number;
  rejected_rfqs: number;

  total_sales: string;
}

export interface AdminAnalyticsStatusItem {
  status?: string;
  category?: string;
  count: number;
}

export interface AdminLatestOrder {
  id: number;
  buyer: string;
  total: string;
  status: string;
  date: string;
}

export interface AdminLatestRFQ {
  id: number;
  product_name: string;
  buyer: string;
  supplier: string;
  quantity: number;
  status: string;
  date: string;
}

export interface AdminAnalyticsResponse {
  summary: AdminAnalyticsSummary;
  orders_by_status: AdminAnalyticsStatusItem[];
  rfqs_by_status: AdminAnalyticsStatusItem[];
  products_by_category: AdminAnalyticsStatusItem[];
  latest_orders: AdminLatestOrder[];
  latest_rfqs: AdminLatestRFQ[];
}

/* =========================
   Auth API
========================= */

export async function loginUser(credentials: {
  email?: string;
  password: string;
  username?: string;
  usernameOrEmail?: string;
  role?: string | null;
}) {
  const email = normalizeEmail(
    credentials.email ||
      credentials.usernameOrEmail ||
      credentials.username ||
      ''
  );

  const payload = {
    email,
    password: credentials.password,
  };

  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);
  saveAuthData(data);
  return data;
}

export async function registerUser(data: any) {
  const payload = {
    ...data,
    email: normalizeEmail(data?.email || ''),
    phone: data?.phone ? normalizePhone(data.phone) : data?.phone,
  };

  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await handleResponse(response);
  saveAuthData(result);
  return result;
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);

  if (data) {
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('steel_platform_user', JSON.stringify(data));
  }

  return data;
}

export async function checkEmailExists(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/check-email/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: normalizeEmail(email),
    }),
  });

  return handleResponse(response);
}

/* =========================
   Products API
========================= */

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await handleResponse(response);
  return normalizeListResponse<Product>(data);
}

export async function getProductById(productId: string | number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse(response);
}

export async function createProduct(productData: any): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  return handleResponse(response);
}

export async function updateProduct(
  productId: string | number,
  productData: any
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  return handleResponse(response);
}

export async function patchProduct(
  productId: string | number,
  productData: any
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  return handleResponse(response);
}

export async function deleteProduct(productId: string | number) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(false),
  });

  if (!response.ok) {
    const data = await parseJsonSafe(response);
    throw new Error(
      extractApiErrorMessage(data, 'Failed to delete product')
    );
  }

  return true;
}

/* =========================
   Orders API
========================= */

export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return normalizeListResponse<Order>(data);
}

export async function getOrderById(orderId: string | number): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createOrder(orderData: any): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/create/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });

  return handleResponse(response);
}

export async function getSupplierOrders(): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/supplier/orders/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return normalizeListResponse<Order>(data);
}

/* =========================
   Admin Analytics API
========================= */

export async function getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
  return apiRequest<AdminAnalyticsResponse>('/admin/analytics/', {
    method: 'GET',
  });
}

/* =========================
   Dashboard Aggregation
========================= */

function getOrderStatus(order: Order): string {
  return String(
    order?.status ||
      order?.order_status ||
      order?.payment_status ||
      'pending'
  ).toLowerCase();
}

function getProductStatus(product: Product): string {
  return String(product?.status || '').toLowerCase();
}

function getProductInventory(product: Product): number {
  return toNumber(product?.inventory ?? product?.stock ?? 0);
}

function getOrderCreatedAt(order: Order): number {
  const value =
    order?.created_at ||
    order?.createdAt ||
    order?.date ||
    order?.order_date ||
    '';
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [productsResult, ordersResult] = await Promise.allSettled([
    getProducts(),
    getOrders(),
  ]);

  const products =
    productsResult.status === 'fulfilled' ? productsResult.value : [];

  const orders =
    ordersResult.status === 'fulfilled' ? ordersResult.value : [];

  const activeProducts = products.filter((product) => {
    const status = getProductStatus(product);

    if (typeof product?.is_active === 'boolean') {
      return product.is_active;
    }

    return status === 'approved' || status === 'active' || status === '';
  }).length;

  const pendingProducts = products.filter((product) => {
    const status = getProductStatus(product);
    return status === 'pending' || status === 'review';
  }).length;

  const processingOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    return ['processing', 'pending', 'confirmed'].includes(status);
  }).length;

  const shippedOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    return ['shipped', 'shipping', 'in_transit', 'in-transit'].includes(status);
  }).length;

  const deliveredOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    return ['delivered', 'completed', 'paid'].includes(status);
  }).length;

  const totalRevenue = orders.reduce((sum, order) => {
    return (
      sum +
      toNumber(order?.total_price ?? order?.total ?? order?.total_amount, 0)
    );
  }, 0);

  const recentOrders = [...orders]
    .sort((a, b) => getOrderCreatedAt(b) - getOrderCreatedAt(a))
    .slice(0, 5);

  const lowStockProducts = products
    .filter((product) => {
      const inventory = getProductInventory(product);
      return inventory > 0 && inventory <= 10;
    })
    .slice(0, 5);

  return {
    totalProducts: products.length,
    activeProducts,
    pendingProducts,
    totalOrders: orders.length,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts,
  };
}

/* =========================
   Exports
========================= */

export { API_BASE_URL };