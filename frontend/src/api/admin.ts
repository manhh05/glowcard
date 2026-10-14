import { api } from './client';
import type {
  AdminCustomScentListItem,
  AdminOrderDetail,
  AdminOrderPage,
  AdminProductOut,
  AdminScentOut,
  AdminVariantOut,
  ComponentIn,
  CustomScentReviewIn,
  DashboardOut,
  OrderStatusUpdateIn,
  ProductCreateIn,
  ProductUpdateIn,
  ScentCreateIn,
  ScentUpdateIn,
  VariantCreateIn,
  VariantUpdateIn,
} from './types';

const auth = 'admin' as const;

// ---------- dashboard ----------
export const getDashboard = (days = 7, lowStockThreshold = 5) =>
  api<DashboardOut>('/admin/dashboard', {
    auth,
    query: { days, low_stock_threshold: lowStockThreshold },
  });

// ---------- đơn hàng ----------
export const listAdminOrders = (params: {
  status?: string;
  payment_status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) => api<AdminOrderPage>('/admin/orders', { auth, query: params });

export const getAdminOrder = (orderCode: string) =>
  api<AdminOrderDetail>(`/admin/orders/${encodeURIComponent(orderCode)}`, { auth });

export const updateOrderStatus = (orderCode: string, body: OrderStatusUpdateIn) =>
  api<AdminOrderDetail>(`/admin/orders/${encodeURIComponent(orderCode)}/status`, {
    method: 'PATCH',
    body,
    auth,
  });

// ---------- custom scent ----------
export const listCustomScentRequests = (
  params: { status?: string; limit?: number; offset?: number } = {},
) => api<AdminCustomScentListItem[]>('/admin/custom-scent-requests', { auth, query: params });

export const reviewCustomScent = (requestId: number, body: CustomScentReviewIn) =>
  api<AdminCustomScentListItem>(`/admin/custom-scent-requests/${requestId}`, {
    method: 'PATCH',
    body,
    auth,
  });

// ---------- sản phẩm ----------
export const listAdminProducts = () => api<AdminProductOut[]>('/admin/products', { auth });

export const getAdminProduct = (id: number) =>
  api<AdminProductOut>(`/admin/products/${id}`, { auth });

export const createProduct = (body: ProductCreateIn) =>
  api<AdminProductOut>('/admin/products', { method: 'POST', body, auth });

export const updateProduct = (id: number, body: ProductUpdateIn) =>
  api<AdminProductOut>(`/admin/products/${id}`, { method: 'PATCH', body, auth });

/** "Xóa" sản phẩm = ẩn khỏi cửa hàng (is_active = false), không xóa dữ liệu. */
export const hideProduct = (id: number) =>
  api<AdminProductOut>(`/admin/products/${id}`, { method: 'DELETE', auth });

export const replaceComponents = (id: number, body: ComponentIn[]) =>
  api<AdminProductOut>(`/admin/products/${id}/components`, { method: 'PUT', body, auth });

export const addVariant = (productId: number, body: VariantCreateIn) =>
  api<AdminVariantOut>(`/admin/products/${productId}/variants`, {
    method: 'POST',
    body,
    auth,
  });

export const updateVariant = (variantId: number, body: VariantUpdateIn) =>
  api<AdminVariantOut>(`/admin/variants/${variantId}`, { method: 'PATCH', body, auth });

// ---------- mùi hương ----------
export const listAdminScents = () => api<AdminScentOut[]>('/admin/scents', { auth });

export const createScent = (body: ScentCreateIn) =>
  api<AdminScentOut>('/admin/scents', { method: 'POST', body, auth });

export const updateScent = (id: number, body: ScentUpdateIn) =>
  api<AdminScentOut>(`/admin/scents/${id}`, { method: 'PATCH', body, auth });
