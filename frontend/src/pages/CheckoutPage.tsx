import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { ShippingAddress, PaymentMethod } from '../types';
import { formatVND } from '../utils/formatters';
import { ProductArtwork } from '../components/ProductArtwork';
import { 
  CreditCard, 
  Banknote, 
  MapPin, 
  Plus, 
  Check, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  QrCode
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, addAddress } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Selected address state
  const defaultAddr = user?.addresses.find((a) => a.isDefault) || user?.addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || '');

  // Add new address inline modal / state
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(
    !user?.addresses || user.addresses.length === 0
  );
  const [newAddrName, setNewAddrName] = useState(user?.fullName || '');
  const [newAddrPhone, setNewAddrPhone] = useState(user?.phone || '');
  const [newAddrProvince, setNewAddrProvince] = useState('TP. Hồ Chí Minh');
  const [newAddrDistrict, setNewAddrDistrict] = useState('Quận 1');
  const [newAddrWard, setNewAddrWard] = useState('Phường Bến Nghé');
  const [newAddrStreet, setNewAddrStreet] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payos');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const shippingFee = 30000;
  const orderTotal = subtotal + shippingFee;

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;

    addAddress({
      fullName: newAddrName || user?.fullName || 'Khách hàng',
      phone: newAddrPhone || user?.phone || '0901234567',
      province: newAddrProvince,
      district: newAddrDistrict,
      ward: newAddrWard,
      streetAddress: newAddrStreet,
      isDefault: !user?.addresses || user.addresses.length === 0,
    });

    setIsAddingNewAddress(false);
  };

  const handlePlaceOrder = () => {
    if (!user) return;

    let activeAddress = user.addresses.find((a) => a.id === selectedAddressId);
    if (!activeAddress && user.addresses.length > 0) {
      activeAddress = user.addresses[0];
    }

    if (!activeAddress) {
      setIsAddingNewAddress(true);
      return;
    }

    setIsSubmitting(true);

    const created = createOrder({
      customerId: user.id,
      customerName: activeAddress.fullName || user.fullName,
      customerPhone: activeAddress.phone || user.phone,
      customerEmail: user.email,
      shippingAddress: activeAddress,
      items: [...items],
      subtotal,
      shippingFee,
      total: orderTotal,
      paymentMethod,
      customerNotes: customerNotes.trim() ? customerNotes : undefined,
    });

    clearCart();
    setIsSubmitting(false);
    navigate(`/orders/${created.id}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-stone-500">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
        <Link to="/products" className="inline-block py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium">
          Duyệt sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button & Title */}
      <div className="mb-8 space-y-2">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800">
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại giỏ hàng
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Thanh Toán Đơn Hàng
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Customer info, Shipping Addresses, Payment Method */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Customer Info */}
          <section className="bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-4 shadow-2xs">
            <h2 className="font-serif text-xl text-stone-900 font-normal pb-3 border-b border-stone-100">
              1. Thông Tin Người Nhận
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Họ và tên</label>
                <p className="font-semibold text-stone-900">{user?.fullName}</p>
              </div>
              <div>
                <label className="text-stone-400 block mb-1">Số điện thoại</label>
                <p className="font-semibold text-stone-900">{user?.phone}</p>
              </div>
              <div>
                <label className="text-stone-400 block mb-1">Email</label>
                <p className="font-semibold text-stone-900 truncate">{user?.email}</p>
              </div>
            </div>
          </section>

          {/* 2. Shipping Address Selection */}
          <section className="bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                2. Địa Chỉ Giao Hàng
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingNewAddress ? 'Hủy' : 'Thêm địa chỉ mới'}
              </button>
            </div>

            {/* Existing Saved Addresses */}
            {user?.addresses && user.addresses.length > 0 && !isAddingNewAddress && (
              <div className="space-y-3">
                {user.addresses.map((addr) => {
                  const isChecked = selectedAddressId === addr.id || (!selectedAddressId && addr.isDefault);
                  return (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-stone-900 bg-stone-50/70 ring-1 ring-stone-900'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping_addr"
                          value={addr.id}
                          checked={isChecked}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-stone-900"
                        />
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900">{addr.fullName}</span>
                            <span className="text-stone-400">·</span>
                            <span className="text-stone-700">{addr.phone}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-stone-600">
                            {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Inline Add Address Form */}
            {isAddingNewAddress && (
              <form onSubmit={handleSaveNewAddress} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
                <h4 className="font-semibold text-stone-900">Nhập địa chỉ giao hàng mới:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">Người nhận:</label>
                    <input
                      type="text"
                      required
                      value={newAddrName}
                      onChange={(e) => setNewAddrName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      placeholder="Họ và tên..."
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Số điện thoại:</label>
                    <input
                      type="text"
                      required
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      placeholder="090..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">Tỉnh / Thành phố:</label>
                    <input
                      type="text"
                      required
                      value={newAddrProvince}
                      onChange={(e) => setNewAddrProvince(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Quận / Huyện:</label>
                    <input
                      type="text"
                      required
                      value={newAddrDistrict}
                      onChange={(e) => setNewAddrDistrict(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Phường / Xã:</label>
                    <input
                      type="text"
                      required
                      value={newAddrWard}
                      onChange={(e) => setNewAddrWard(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Địa chỉ cụ thể (Số nhà, tên đường):</label>
                  <input
                    type="text"
                    required
                    value={newAddrStreet}
                    onChange={(e) => setNewAddrStreet(e.target.value)}
                    placeholder="Ví dụ: 123 Lê Lợi..."
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800"
                  >
                    Lưu địa chỉ này
                  </button>
                  {user?.addresses && user.addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="py-2 px-3 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100"
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* 3. Payment Method */}
          <section className="bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-4 shadow-2xs">
            <h2 className="font-serif text-xl text-stone-900 font-normal pb-3 border-b border-stone-100">
              3. Phương Thức Thanh Toán
            </h2>

            <div className="space-y-3">
              {/* Option 1: PayOS */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'payos'
                    ? 'border-amber-800 bg-amber-50/60 ring-1 ring-amber-800'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="payos"
                    checked={paymentMethod === 'payos'}
                    onChange={() => setPaymentMethod('payos')}
                    className="mt-1 accent-amber-800"
                  />
                  <div className="space-y-1.5 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-700" />
                        Thanh toán trực tuyến qua PayOS (VietQR / Chuyển khoản)
                      </span>
                      <span className="text-[11px] font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                        Tự động xác nhận
                      </span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      Quét mã QR bằng mọi ứng dụng ngân hàng di động hoặc ví điện tử. Đơn hàng sẽ được hệ thống PayOS kích hoạt trạng thái "Đã thanh toán" tức thì.
                    </p>
                  </div>
                </div>
              </label>

              {/* Option 2: COD */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-800 bg-amber-50/60 ring-1 ring-amber-800'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-amber-800"
                  />
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-stone-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-stone-700" />
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <p className="text-stone-600 leading-relaxed">
                      Quý khách thanh toán tiền mặt trực tiếp cho nhân viên bưu tá khi nhận và kiểm tra kiện hàng.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* 4. Customer Notes */}
          <section className="bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-3 shadow-2xs">
            <h2 className="font-serif text-lg text-stone-900 font-normal">
              Ghi Chú Đơn Hàng (Không bắt buộc)
            </h2>
            <textarea
              rows={2}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Lời nhắn kèm quà, yêu cầu thời gian giao hoặc lưu ý đặc biệt..."
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-400"
            />
          </section>

        </div>

        {/* Right Column: Order Summary & Place Order Button */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-6 shadow-2xs lg:sticky lg:top-24">
          <h3 className="font-serif text-xl text-stone-900 font-normal pb-3 border-b border-stone-100">
            Tóm Tắt Đơn Hàng ({items.length} món)
          </h3>

          {/* Product Items Breakdown */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-xs py-2 border-b border-stone-100 last:border-b-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0 border border-stone-200">
                  <ProductArtwork type={item.product.type} title={item.product.name} />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-medium text-stone-900 truncate">{item.product.name}</p>
                  <p className="text-[11px] text-stone-500">
                    {item.selectedSize ? `Dung tích: ${item.selectedSize}` : ''}
                    {item.selectedScent ? ` · Mùi: ${item.selectedScent}` : ''}
                  </p>
                  {item.isCustomScent && (
                    <p className="text-[10px] text-amber-800 font-medium">
                      ✨ Yêu cầu mùi hương riêng
                    </p>
                  )}
                  <p className="text-[11px] text-stone-500 tabular-nums">
                    SL: {item.quantity} × {formatVND(item.unitPrice)}
                  </p>
                </div>
                <div className="text-right font-semibold text-stone-900 tabular-nums shrink-0">
                  {formatVND(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Price Calculations */}
          <div className="pt-2 border-t border-stone-200 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-semibold text-stone-900 tabular-nums">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí giao hàng toàn quốc:</span>
              <span className="font-semibold text-stone-900 tabular-nums">{formatVND(shippingFee)}</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-stone-900">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-amber-950 tabular-nums">{formatVND(orderTotal)}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePlaceOrder}
            className="w-full py-4 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Đang xử lý đặt hàng...</span>
            ) : (
              <span>Xác nhận đặt hàng ({formatVND(orderTotal)})</span>
            )}
          </button>

          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[11px] text-stone-500 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bảo mật đơn hàng</span>
            </div>
            <p>
              Sau khi đặt hàng, bạn có thể theo dõi tiến trình làm nến và giao nhận theo thời gian thực tại trang Theo dõi đơn.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
