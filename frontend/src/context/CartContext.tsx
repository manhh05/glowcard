import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY_CART = 'glowcard_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    // Generate unique key based on product + options + scents
    const optionsKey = [
      newItem.productId,
      newItem.selectedSize || 'nosize',
      newItem.selectedScent || 'noscent',
      newItem.isCustomScent ? `custom:${newItem.customScentNote}` : 'nocustom',
      newItem.comboSelections ? JSON.stringify(newItem.comboSelections) : 'nocombo',
    ].join('_');

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => {
        const itemKey = [
          item.productId,
          item.selectedSize || 'nosize',
          item.selectedScent || 'noscent',
          item.isCustomScent ? `custom:${item.customScentNote}` : 'nocustom',
          item.comboSelections ? JSON.stringify(item.comboSelections) : 'nocombo',
        ].join('_');
        return itemKey === optionsKey;
      });

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      } else {
        const itemWithId: CartItem = {
          ...newItem,
          id: 'cart-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        };
        return [...prevItems, itemWithId];
      }
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
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
