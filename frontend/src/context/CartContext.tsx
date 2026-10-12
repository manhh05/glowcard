import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as cartApi from '../api/cart';
import { authErrorMessage } from '../api/errors';
import type { CartItemIn, CartItemOut, CartOut } from '../api/types';

const EMPTY_CART: CartOut = {
  items: [],
  subtotal: 0,
  shipping_fee: 0,
  total: 0,
  item_count: 0,
  has_stock_issue: false,
  can_checkout: false,
};

interface CartContextType {
  items: CartItemOut[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  canCheckout: boolean;
  hasStockIssue: boolean;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addItem: (body: CartItemIn) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Giỏ hàng chỉ dành cho khách hàng đã đăng nhập
  const customerId = user?.role === 'customer' ? user.id : null;

  const [cart, setCart] = useState<CartOut>(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!customerId) {
      setCart(EMPTY_CART);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setCart(await cartApi.getCart());
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Tải giỏ khi đăng nhập, xóa sạch khi đăng xuất hoặc đổi tài khoản
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Mọi thao tác đều do server tính lại giá và tồn kho, frontend chỉ hiển thị kết quả
  const apply = async (task: () => Promise<CartOut>) => {
    setCart(await task());
  };

  const addItem = (body: CartItemIn) => apply(() => cartApi.addCartItem(body));
  const updateQuantity = (itemId: number, quantity: number) =>
    apply(() => cartApi.updateCartItem(itemId, quantity));
  const removeItem = (itemId: number) => apply(() => cartApi.removeCartItem(itemId));
  const clear = () => apply(() => cartApi.clearCart());

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        itemCount: cart.item_count,
        subtotal: cart.subtotal,
        shippingFee: cart.shipping_fee,
        total: cart.total,
        canCheckout: cart.can_checkout,
        hasStockIssue: cart.has_stock_issue,
        loading,
        error,
        refresh,
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
