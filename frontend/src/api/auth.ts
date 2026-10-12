import { api } from './client';
import type {
  AddressIn,
  AddressOut,
  AddressUpdate,
  AdminLoginIn,
  AdminMeOut,
  LoginIn,
  RegisterIn,
  TokenOut,
  UserOut,
  UserUpdate,
} from './types';

export const register = (body: RegisterIn) =>
  api<TokenOut>('/auth/register', { method: 'POST', body });

export const login = (body: LoginIn) =>
  api<TokenOut>('/auth/login', { method: 'POST', body });

export const adminLogin = (body: AdminLoginIn) =>
  api<TokenOut>('/auth/admin/login', { method: 'POST', body });

export const getAdminMe = () => api<AdminMeOut>('/auth/admin/me', { auth: 'admin' });

export const getMe = () => api<UserOut>('/me', { auth: 'customer' });

export const updateMe = (body: UserUpdate) =>
  api<UserOut>('/me', { method: 'PATCH', body, auth: 'customer' });

export const listAddresses = () =>
  api<AddressOut[]>('/me/addresses', { auth: 'customer' });

export const createAddress = (body: AddressIn) =>
  api<AddressOut>('/me/addresses', { method: 'POST', body, auth: 'customer' });

export const updateAddress = (id: number, body: AddressUpdate) =>
  api<AddressOut>(`/me/addresses/${id}`, { method: 'PATCH', body, auth: 'customer' });

export const deleteAddress = (id: number) =>
  api<void>(`/me/addresses/${id}`, { method: 'DELETE', auth: 'customer' });