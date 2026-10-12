import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatVND } from '../utils/formatters';
import { ProductArtwork } from '../components/ProductArtwork';
import { toUiType } from '../api/adapters';
import { createOrder } from '../api/orders';
import { cartErrorMessage } from '../api/errors';
import {
  CreditCard,
  Banknote,
  Plus,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

type CheckoutPayment = 'COD' | 'PAYOS';

export const CheckoutPage: React.FC = () => {
  const { items, itemCount, subtotal, shippingFee, total, canCheckout, hasStockIssue, loading, refresh } =
    useCart();
  const { user, isAuthenticated, isAdmin, addAddress } = useAuth();
  const navigate = useNavigate();

  const addresses = user?.addresses ?? [];

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPayment>('COD');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form địa chỉ mới
  const [newAddrName, setNewAddrName] = useState(user?.fullName || '');
  const [newAddrPhone, setNewAddrPhone] = useState(user?.phone || '');
  const [newAddrProvince, setNewAddrProvince] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrWard, setNewAddrWard] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Vào trang thanh toán thì lấy lại giá và tồn kho mới nhất
  useEffect(() => {
    if (isAuthenticated && !isAdmin) void refresh();
  }, [isAuthenticated, isAdmin, refresh]);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0] ??
    null;

  // Chưa có địa chỉ nào thì mở sẵn form nhập
  const showAddressForm = isAddingNewAddress || addresses.length === 0;

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;

    setError('');
    setIsSavingAddress(true);
    try {
      const created = await addAddress({
        fullName: newAddrName || user?.fullName || 'Khách hàng',
        phone: newAddrPhone || user?.phone || '',
        province: newAddrProvince,
        district: newAddrDistrict,
        ward: newAddrWard,
        streetAddress: newAddrStreet,
        isDefault: addresses.length === 0,
      });
      setSelectedAddressId(created.id);
      setIsAddingNewAddress(false);
      setNewAddrStreet('');
    } catch (err) {
      setError(cartErrorMessage(err));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!selectedAddress) {
      setError('Vui lòng thêm hoặc chọn địa chỉ giao hàng.');
      return;
    }
    if (!canCheckout) {
      setError(
        'Giỏ hàng có sản phẩm hết hàng hoặc không đủ số lượng. Vui lòng quay lại giỏ hàng để điều chỉnh.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        address_id: Number(selectedAddress.id),
        payment_method: paymentMethod,
        note: customerNotes.trim() || null,
      });
      // COD: server đã xóa giỏ. Chuyển trang trước rồi mới làm mới giỏ để tránh nháy "giỏ trống".
      navigate(`/orders/${order.order_code}`);
      void refresh();
    } catch (err) {
      await refresh(); // lấy lại số liệu mới nhất sau khi bị từ chối
      setError(cartErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">
          {isAdmin ? 'Tài khoản quản trị không thể đặt hàng' : 'Vui lòng đăng nhập để thanh toán'}
        </h2>
        <Link
          to={isAdmin ? '/' : '/login?redirect=/checkout'}
          className="inline-block py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          {isAdmin ? 'Về trang chủ' : 'Đăng nhập'}
        </Link>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-stone-500">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
        <Link
          to="/products"
          className="inline-block py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          Duyệt sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button & Title */}
      <div className="mb-8 space-y-2">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại giỏ hàng
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Thanh Toán Đơn Hàng
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Customer Info */}
          <section className="bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-4 shadow-2xs">
            <h2 className="font-serif text-xl text-stone-900 font-normal pb-3 border-b border-stone-100">
              1. Thông Tin Người Đặt
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Họ và tên</label>
                <p className="font-semibold text-stone-900">{user?.fullName}</p>
              </div>
              <div>
                <label className="text-stone-400 block mb-1">Số điện thoại</label>
                <p className="font-semibold text-stone-900">{user?.phone || '—'}</p>
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
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingNewAddress ? 'Hủy' : 'Thêm địa chỉ mới'}
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isChecked = selectedAddress?.id === addr.id;
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
                            {[addr.streetAddress, addr.ward, addr.district, addr.province]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Inline Add Address Form */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveNewAddress}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs"
              >
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
                      maxLength={20}
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
                  <label className="block text-stone-600 mb-1">
                    Địa chỉ cụ thể (Số nhà, tên đường):
                  </label>
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
                    disabled={isSavingAddress}
                    className="py-2 px-4 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-60"
                  >
                    {isSavingAddress ? 'Đang lưu...' : 'Lưu địa chỉ này'}
                  </button>
                  {addresses.length > 0 && (
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
              {/* Option 1: PayOS (chưa mở) */}
              <label className="block p-4 rounded-xl border border-stone-200 bg-stone-50/70 opacity-60 cursor-not-allowed">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="PAYOS"
                    disabled
                    checked={paymentMethod === 'PAYOS'}
                    onChange={() => setPaymentMethod('PAYOS')}
                    className="mt-1 accent-amber-800"
                  />
                  <div className="space-y-1.5 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-700" />
                        Thanh toán trực tuyến qua PayOS (VietQR / Chuyển khoản)
                      </span>
                      <span className="text-[11px] font-medium text-stone-600 bg-stone-200 px-2 py-0.5 rounded">
                        Sắp ra mắt
                      </span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      Tính năng thanh toán trực tuyến đang được hoàn thiện. Hiện tại vui lòng chọn
                      thanh toán khi nhận hàng.
                    </p>
                  </div>
                </div>
              </label>

              {/* Option 2: COD */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-amber-800 bg-amber-50/60 ring-1 ring-amber-800'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-amber-800"
                  />
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-stone-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-stone-700" />
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <p className="text-stone-600 leading-relaxed">
                      Quý khách thanh toán tiền mặt trực tiếp cho nhân viên bưu tá khi nhận và kiểm
                      tra kiện hàng.
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
              maxLength={500}
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
            Tóm Tắt Đơn Hàng ({itemCount} món)
          </h3>

          {/* Product Items Breakdown */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => {
              const hasCustom =
                !!item.custom_scent_text || item.selections.some((s) => s.is_custom);
              return (
                <div
                  key={item.id}
                  className="flex gap-3 text-xs py-2 border-b border-stone-100 last:border-b-0"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0 border border-stone-200">
                    <ProductArtwork type={toUiType(item.product_type)} title={item.product_name} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-medium text-stone-900 truncate">{item.product_name}</p>
                    {item.product_type !== 'COMBO' && (
                      <p className="text-[11px] text-stone-500">{item.label}</p>
                    )}
                    {hasCustom && (
                      <p className="text-[10px] text-amber-800 font-medium">
                        ✨ Yêu cầu mùi hương riêng
                      </p>
                    )}
                    <p className="text-[11px] text-stone-500 tabular-nums">
                      SL: {item.quantity} × {formatVND(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right font-semibold text-stone-900 tabular-nums shrink-0">
                    {formatVND(item.line_total)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Calculations (do server tính) */}
          <div className="pt-2 border-t border-stone-200 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {formatVND(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phí giao hàng toàn quốc:</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {formatVND(shippingFee)}
              </span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-stone-900">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-amber-950 tabular-nums">
                {formatVND(total)}
              </span>
            </div>
          </div>

          {hasStockIssue && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Có sản phẩm hết hàng hoặc không đủ số lượng.{' '}
                <Link to="/cart" className="font-semibold underline">
                  Quay lại giỏ hàng
                </Link>{' '}
                để điều chỉnh.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Place Order CTA */}
          <button
            type="button"
            disabled={isSubmitting || !canCheckout}
            onClick={handlePlaceOrder}
            className="w-full py-4 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Đang xử lý đặt hàng...</span>
            ) : (
              <span>Xác nhận đặt hàng ({formatVND(total)})</span>
            )}
          </button>

          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 text-[11px] text-stone-500 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bảo mật đơn hàng</span>
            </div>
            <p>
              Giá và tồn kho được kiểm tra lại lúc đặt hàng. Sau khi đặt, bạn có thể theo dõi tiến
              trình tại trang Theo dõi đơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
