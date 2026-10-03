import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatVND } from '../utils/formatters';
import { ProductArtwork } from '../components/ProductArtwork';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();
  const { isAuthenticated, triggerLoginRequirement } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      triggerLoginRequirement(
        'Vui lòng đăng nhập tài khoản khách hàng để tiến hành thanh toán đơn hàng.'
      );
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl text-stone-900 font-normal">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            Hãy khám phá các dòng nến thơm và thiệp sáp nghệ thuật của Glowcard để tìm kiếm mùi hương yêu thích.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
        >
          Khám phá sản phẩm ngay
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Giỏ Hàng Của Bạn
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Bạn đang có <strong className="text-stone-800 tabular-nums">{itemCount}</strong> sản phẩm trong giỏ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List (Left) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemSubtotal = item.unitPrice * item.quantity;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start justify-between shadow-2xs"
              >
                {/* Product Artwork & Info */}
                <div className="flex gap-4 items-start w-full sm:w-auto flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#FAF6F0] border border-stone-100 shrink-0">
                    <ProductArtwork type={item.product.type} title={item.product.name} />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-serif text-base sm:text-lg font-medium text-stone-900 hover:text-amber-900 transition-colors line-clamp-1 block"
                    >
                      {item.product.name}
                    </Link>

                    {/* Selected Options Breakdown */}
                    <div className="text-xs text-stone-600 space-y-1">
                      {item.selectedSize && (
                        <div>
                          <span className="text-stone-400">Dung tích: </span>
                          <span className="font-medium text-stone-800">{item.selectedSize}</span>
                        </div>
                      )}

                      {/* Single Scent */}
                      {item.selectedScent && (
                        <div>
                          <span className="text-stone-400">Mùi hương: </span>
                          <span className="font-medium text-stone-800">{item.selectedScent}</span>
                        </div>
                      )}

                      {/* Custom Scent Note for single candle */}
                      {item.isCustomScent && item.customScentNote && (
                        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-950 space-y-0.5">
                          <span className="font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            Mùi hương tuỳ chỉnh riêng:
                          </span>
                          <p className="italic text-stone-700">"{item.customScentNote}"</p>
                          <span className="text-[10px] text-stone-500 block">
                            (Thêm 2-3 ngày phối chế thủ công)
                          </span>
                        </div>
                      )}

                      {/* Combo Per-Candle Scents */}
                      {item.comboSelections && item.comboSelections.length > 0 && (
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-1">
                          <p className="font-semibold text-stone-900">Chi tiết mùi từng nến:</p>
                          {item.comboSelections.map((cand) => (
                            <div key={cand.candleNumber} className="text-stone-700">
                              <span>• Nến {cand.candleNumber}: </span>
                              {cand.isCustom ? (
                                <span className="text-amber-900 font-medium">
                                  Tự phối ({cand.customScentText || 'Theo yêu cầu'})
                                </span>
                              ) : (
                                <span className="font-medium">{cand.scent}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 text-xs text-stone-500">
                      Đơn giá: <span className="font-semibold text-stone-900 tabular-nums">{formatVND(item.unitPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Stepper, Subtotal, and Delete Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100 gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block sm:hidden">Tạm tính:</span>
                    <span className="text-base font-semibold text-stone-900 tabular-nums">
                      {formatVND(itemSubtotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                        aria-label="Giảm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 transition-colors"
                        aria-label="Tăng"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-stone-50"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Action (Right) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-6 shadow-2xs lg:sticky lg:top-24">
          <h3 className="font-serif text-xl text-stone-900 font-normal pb-3 border-b border-stone-100">
            Tóm Tắt Đơn Hàng
          </h3>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Tạm tính hàng ({itemCount} món)</span>
              <span className="font-semibold text-stone-900 tabular-nums">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển dự kiến</span>
              <span className="text-stone-500">Tính ở bước thanh toán</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-stone-900">Tổng cộng tạm tính</span>
              <span className="text-xl font-bold text-stone-900 tabular-nums">{formatVND(subtotal)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
            >
              <span>Tiến hành thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/products"
              className="block text-center text-xs text-stone-500 hover:text-stone-900 transition-colors pt-1"
            >
              ← Tiếp tục mua sắm thêm
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 text-[11px] text-stone-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-stone-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Giao dịch an toàn & Minh bạch</span>
            </div>
            <p>Hỗ trợ thanh toán bảo mật PayOS (Quét mã VietQR) và Thanh toán tiền mặt khi nhận hàng (COD).</p>
          </div>
        </div>

      </div>

    </div>
  );
};
