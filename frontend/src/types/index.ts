export type ProductType = 'candle' | 'wax_card' | 'combo';

export type CandleSize = '30ml' | '50ml';

export type StandardScent = 
  | 'Gardenia' 
  | 'Jasmine' 
  | 'Peach' 
  | 'Sweet Orange' 
  | 'Ebonywood' 
  | 'Sakura';

export interface ScentOption {
  id: string;
  nameVi: string;
  nameEn: StandardScent | string;
  description: string;
  notes: string;
}

export interface ComboComponentConfig {
  candleCount: number;
  candleSize?: CandleSize;
  waxCardCount?: number;
  descriptionVi: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  description: string;
  story?: string;
  price: number;
  image: string;
  stock: number;
  availableSizes?: CandleSize[];
  availableScents?: string[];
  allowCustomScent?: boolean;
  comboConfig?: ComboComponentConfig;
  burnTime?: string;
  ingredients?: string;
  featured?: boolean;
  categoryNameVi: string;
}

export interface ComboCandleSelection {
  candleNumber: number;
  scent: string;
  isCustom?: boolean;
  customScentText?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedSize?: CandleSize;
  selectedScent?: string;
  isCustomScent?: boolean;
  customScentNote?: string;
  comboSelections?: ComboCandleSelection[];
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export type UserRole = 'guest' | 'customer' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: ShippingAddress[];
}

export type PaymentMethod = 'payos' | 'cod';

export type PaymentStatus = 'UNPAID' | 'PAID';

export type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'COMPLETED';

export type CustomScentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  note?: string;
}

export interface CustomScentOrderRequest {
  id: string;
  cartItemId: string;
  productName: string;
  candleDescription: string;
  customScentText: string;
  status: CustomScentStatus;
  adminNote?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  createdAt: string;
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
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingTimeline: TrackingStep[];
  customScentRequests: CustomScentOrderRequest[];
  customerNotes?: string;
}
