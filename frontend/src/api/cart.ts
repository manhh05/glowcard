import { api } from './client';
import type { CartItemIn, CartOut } from './types';

export const getCart = () => api<CartOut>('/cart', { auth: 'customer' });

export const addCartItem = (body: CartItemIn) =>
  api<CartOut>('/cart/items', { method: 'POST', body, auth: 'customer' });

export const updateCartItem = (itemId: number, quantity: number) =>
  api<CartOut>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: { quantity },
    auth: 'customer',
  });

export const removeCartItem = (itemId: number) =>
  api<CartOut>(`/cart/items/${itemId}`, { method: 'DELETE', auth: 'customer' });

export const clearCart = () => api<CartOut>('/cart', { method: 'DELETE', auth: 'customer' });
