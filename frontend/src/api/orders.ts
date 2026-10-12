import { api } from './client';
import type { OrderCreateIn, OrderDetail, OrderListItem } from './types';

export const createOrder = (body: OrderCreateIn) =>
  api<OrderDetail>('/orders', { method: 'POST', body, auth: 'customer' });

export const getOrder = (orderCode: string) =>
  api<OrderDetail>(`/orders/${encodeURIComponent(orderCode)}`, { auth: 'customer' });

export const listOrders = () => api<OrderListItem[]>('/orders', { auth: 'customer' });
