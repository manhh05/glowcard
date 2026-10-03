import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, CustomScentStatus, PaymentMethod, PaymentStatus, CartItem, ShippingAddress, CustomScentOrderRequest, TrackingStep } from '../types';
import { INITIAL_ORDERS } from '../data/mockData';

interface CreateOrderParams {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerNotes?: string;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (params: CreateOrderParams) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  updateCustomScentStatus: (orderId: string, requestId: string, status?: CustomScentStatus, adminNote?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByCustomerId: (customerId: string) => Order[];
  getAllCustomScentRequests: () => Array<{
    orderId: string;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    request: CustomScentOrderRequest;
  }>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY_ORDERS = 'glowcard_orders_records';

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const createOrder = (params: CreateOrderParams): Order => {
    const timestamp = new Date().toISOString();
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `GC-${dateFormatted}-${randomSuffix}`;
    const orderId = `ord-${Date.now()}`;

    // Extract any custom scent requests
    const customScentRequests: CustomScentOrderRequest[] = [];
    params.items.forEach((item) => {
      if (item.isCustomScent && item.customScentNote) {
        customScentRequests.push({
          id: `csr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          cartItemId: item.id,
          productName: item.product.name,
          candleDescription: item.selectedSize ? `Hũ ${item.selectedSize}` : 'Nến thơm',
          customScentText: item.customScentNote,
          status: 'PENDING',
        });
      }

      if (item.comboSelections) {
        item.comboSelections.forEach((cand) => {
          if (cand.isCustom && cand.customScentText) {
            customScentRequests.push({
              id: `csr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              cartItemId: item.id,
              productName: item.product.name,
              candleDescription: `Nến số ${cand.candleNumber} trong combo`,
              customScentText: cand.customScentText,
              status: 'PENDING',
            });
          }
        });
      }
    });

    const nowFormatted = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const initialTracking: TrackingStep[] = [
      {
        status: 'CONFIRMED',
        title: 'Đã xác nhận đơn hàng',
        timestamp: nowFormatted,
        completed: true,
        current: true,
        note: customScentRequests.length > 0
          ? 'Đơn hàng đã được Glowcard tiếp nhận. Chờ nghệ nhân duyệt yêu cầu mùi hương tuỳ chỉnh.'
          : 'Đơn hàng đã được tiếp nhận và chuyển đến bộ phận chuẩn bị.',
      },
      {
        status: 'PREPARING',
        title: 'Đang chuẩn bị sản phẩm',
        timestamp: 'Chờ xử lý',
        completed: false,
        current: false,
        note: 'Đóng gói sản phẩm và kiểm tra chất lượng.',
      },
      {
        status: 'SHIPPED',
        title: 'Đang giao hàng',
        timestamp: 'Dự kiến sau khi đóng gói',
        completed: false,
        current: false,
        note: 'Bàn giao cho đơn vị vận chuyển đối tác.',
      },
      {
        status: 'COMPLETED',
        title: 'Hoàn thành',
        timestamp: 'Dự kiến',
        completed: false,
        current: false,
        note: 'Khách hàng nhận kiện hàng và hoàn tất.',
      },
    ];

    const newOrder: Order = {
      id: orderId,
      orderCode,
      createdAt: timestamp,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      shippingAddress: params.shippingAddress,
      items: params.items,
      subtotal: params.subtotal,
      shippingFee: params.shippingFee,
      total: params.total,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'payos' ? 'PAID' : 'UNPAID',
      orderStatus: 'CONFIRMED',
      trackingTimeline: initialTracking,
      customScentRequests,
      customerNotes: params.customerNotes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const nowFormatted = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusOrderMap: Record<OrderStatus, number> = {
      CONFIRMED: 0,
      PREPARING: 1,
      SHIPPED: 2,
      COMPLETED: 3,
    };
    const targetIdx = statusOrderMap[status];

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedTimeline = order.trackingTimeline.map((step, idx) => {
          if (idx < targetIdx) {
            return { ...step, completed: true, current: false };
          } else if (idx === targetIdx) {
            return {
              ...step,
              completed: true,
              current: true,
              timestamp: step.timestamp.includes('Dự kiến') || step.timestamp.includes('Chờ') ? nowFormatted : step.timestamp,
            };
          } else {
            return { ...step, completed: false, current: false };
          }
        });

        return {
          ...order,
          orderStatus: status,
          trackingTimeline: updatedTimeline,
        };
      })
    );
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, paymentStatus: status } : order))
    );
  };

  const updateCustomScentStatus = (
    orderId: string,
    requestId: string,
    status?: CustomScentStatus,
    adminNote?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedRequests = order.customScentRequests.map((req) => {
          if (req.id === requestId) {
            return {
              ...req,
              status: status !== undefined ? status : req.status,
              adminNote: adminNote !== undefined ? adminNote : req.adminNote,
            };
          }
          return req;
        });
        return {
          ...order,
          customScentRequests: updatedRequests,
        };
      })
    );
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId || o.orderCode === orderId);
  };

  const getOrdersByCustomerId = (customerId: string) => {
    return orders.filter((o) => o.customerId === customerId);
  };

  const getAllCustomScentRequests = () => {
    const list: Array<{
      orderId: string;
      orderCode: string;
      customerName: string;
      customerPhone: string;
      request: CustomScentOrderRequest;
    }> = [];

    orders.forEach((order) => {
      order.customScentRequests.forEach((req) => {
        list.push({
          orderId: order.id,
          orderCode: order.orderCode,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          request: req,
        });
      });
    });

    return list;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        updateCustomScentStatus,
        getOrderById,
        getOrdersByCustomerId,
        getAllCustomScentRequests,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
