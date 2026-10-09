import { api } from './client';
import type { ProductDetail, ProductListItem, ProductType } from './types';

export function listProducts(
  params: { type?: ProductType; q?: string; featured?: boolean } = {},
) {
  return api<ProductListItem[]>('/products', { query: params });
}

export function getProduct(slug: string) {
  return api<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}