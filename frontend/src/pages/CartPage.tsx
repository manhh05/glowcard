import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatVND } from '../utils/formatters';
import { ProductArtwork } from '../components/ProductArtwork';
import { toUiType } from '../api/adapters';
import { cartErrorMessage } from '../api/errors';
import type { StockIssue } from '../api/types';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const MAX_QTY = 99;

const issueText = (issue: StockIssue) =>
  issue.code === 'OUT_OF_STOCK'
    ? `${issue.label}: đã hết hàng`
    : `${issue.label}: chỉ còn ${issue.available}`;

export const CartPage: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    canCheckout,
    hasStockIssue,
    loading,
    error,
    refresh,
    updateQuantity,
    removeItem,
  } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  // Mở trang giỏ hàng thì lấy lại số liệu tồn kho mới nhất
  useEffect(() => {
    if (isAuthenticated && !isAdmin) void refresh();
  }, [isAuthenticated, isAdmin, refresh]);

  const run = async (itemId: number, task: () => Promise<unknown>) => {
    setBusyId(itemId);
    setActionError('');
    try {
      await task();
    } catch (e) {
      setActionError(cartErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckout = () => {
    if (!canCheckout) return;
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl text-stone-900 font-normal">
            Đăng nhập để xem giỏ hàng
          </h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            Giỏ hàng được lưu theo tài khoản, bạn có thể xem lại trên mọi thiết bị.
          </p>
        </div>
        <Link
          to="/login?redirect=/cart"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
        >
          Đăng nhập
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="font-serif text-2xl text-stone-900 font-normal">
          Tài khoản quản trị không có giỏ hàng
        </h2>
        <p className="text-sm text-stone-500">
          Vui lòng đăng nhập bằng tài khoản khách hàng để mua sắm.
        </p>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => void refresh()}
          className="py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

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
          Bạn đang có{' '}
          <strong className="text-stone-800 tabular-nums">{itemCount}</strong> sản phẩm trong giỏ
        </p>
      </div>

      {actionError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (Left) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const outOfStock = item.is_out_of_stock;
            const busy = busyId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start justify-between shadow-2xs ${
                  outOfStock ? 'border-red-200' : 'border-[#EADBCE]'
                }`}
              >
                {/* Product Artwork & Info (làm mờ khi hết hàng) */}
                <div
                  className={`flex gap-4 items-start w-full sm:w-auto flex-1 ${
                    outOfStock ? 'opacity-50' : ''
                  }`}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#FAF6F0] border border-stone-100 shrink-0">
                    <ProductArtwork type={toUiType(item.product_type)} title={item.product_name} />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/products/${item.product_slug}`}
                        className="font-serif text-base sm:text-lg font-medium text-stone-900 hover:text-amber-900 transition-colors line-clamp-1"
                      >
                        {item.product_name}
                      </Link>
                      {outOfStock && (
                        <span className="text-[11px] font-semibold text-white bg-stone-900 px-2 py-0.5 rounded">
                          Hết hàng
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-600 space-y-1">
                      {item.product_type !== 'COMBO' && (
                        <div>
                          <span className="text-stone-400">Phân loại: </span>
                          <span className="font-medium text-stone-800">{item.label}</span>
                        </div>
                      )}

                      {/* Custom scent của nến lẻ */}
                      {item.custom_scent_text && (
                        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-950 space-y-0.5">
                          <span className="font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            Mùi hương tuỳ chỉnh riêng:
                          </span>
                          <p className="italic text-stone-700">"{item.custom_scent_text}"</p>
                          <span className="text-[10px] text-stone-500 block">
                            (Thêm 2-3 ngày phối chế thủ công)
                          </span>
                        </div>
                      )}

                      {/* Mùi từng cây nến trong combo */}
                      {item.selections.length > 0 && (
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-1">
                          <p className="font-semibold text-stone-900">Chi tiết mùi từng nến:</p>
                          {item.selections.map((sel) => (
                            <div key={sel.slot_no} className="text-stone-700">
                              <span>• Nến {sel.slot_no}: </span>
                              {sel.is_custom ? (
                                <span className="text-amber-900 font-medium">
                                  Tự phối ({sel.custom_scent_text || 'Theo yêu cầu'})
                                </span>
                              ) : (
                                <span className="font-medium">{sel.scent_name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 text-xs text-stone-500">
                      Đơn giá:{' '}
                      <span className="font-semibold text-stone-900 tabular-nums">
                        {formatVND(item.unit_price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tồn kho, số lượng, thành tiền, xóa */}
                <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {/* Cảnh báo / số lượng tồn kho */}
                  {item.issues.length > 0 ? (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 space-y-0.5 sm:max-w-[220px]">
                      {item.issues.map((issue, idx) => (
                        <p key={idx}>{issueText(issue)}</p>
                      ))}
                    </div>
                  ) : item.stock_available !== null ? (
                    <p
                      className={`text-[11px] sm:text-right ${
                        item.low_stock ? 'text-amber-700 font-medium' : 'text-stone-400'
                      }`}
                    >
                      {item.low_stock
                        ? `Chỉ còn ${item.stock_available} sản phẩm`
                        : `Còn ${item.stock_available} sản phẩm`}
                    </p>
                  ) : item.low_stock ? (
                    <p className="text-[11px] text-amber-700 font-medium sm:text-right">
                      Một số mùi trong combo sắp hết hàng
                    </p>
                  ) : null}

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 block sm:hidden">Tạm tính:</span>
                      <span
                        className={`text-base font-semibold tabular-nums ${
                          outOfStock ? 'text-stone-400 line-through' : 'text-stone-900'
                        }`}
                      >
                        {formatVND(item.line_total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                        <button
                          onClick={() =>
                            run(item.id, () => updateQuantity(item.id, item.quantity - 1))
                          }
                          disabled={busy || item.quantity <= 1}
                          className="p-1.5 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Giảm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            run(item.id, () => updateQuantity(item.id, item.quantity + 1))
                          }
                          disabled={busy || outOfStock || item.quantity >= MAX_QTY}
                          className="p-1.5 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Tăng"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => run(item.id, () => removeItem(item.id))}
                        disabled={busy}
                        className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-stone-50 disabled:opacity-40"
                        title="Xóa khỏi giỏ hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
              <span className="font-semibold text-stone-900 tabular-nums">
                {formatVND(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển dự kiến</span>
              <span className="text-stone-500">Tính ở bước thanh toán</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-stone-900">Tổng cộng tạm tính</span>
              <span className="text-xl font-bold text-stone-900 tabular-nums">
                {formatVND(subtotal)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {hasStockIssue && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Giỏ hàng có sản phẩm hết hàng hoặc không đủ số lượng. Vui lòng xóa hoặc giảm số
                  lượng các sản phẩm đó trước khi thanh toán.
                </span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={!canCheckout}
              className="w-full py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
            <p>
              Hỗ trợ thanh toán bảo mật PayOS (Quét mã VietQR) và Thanh toán tiền mặt khi nhận hàng
              (COD).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
