import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { formatVND, formatDateVi, getOrderStatusText, getPaymentStatusText, getCustomScentStatusText } from '../utils/formatters';
import { ProductArtwork } from '../components/ProductArtwork';
import { 
  CheckCircle2, 
  Package, 
  MapPin, 
  CreditCard, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Truck
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById } = useOrders();
  const order = getOrderById(id || '');

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Không tìm thấy thông tin đơn hàng</h2>
        <p className="text-xs text-stone-500">Mã đơn hàng không hợp lệ hoặc bạn không có quyền xem đơn hàng này.</p>
        <Link to="/orders" className="inline-block py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium">
          Xem danh sách đơn hàng của bạn
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Success Notification Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#FAF6F0] border border-[#EADBCE] text-center space-y-3 shadow-2xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Cảm ơn bạn đã lựa chọn Glowcard. Đơn hàng <strong>#{order.orderCode}</strong> đã được ghi nhận vào hệ thống.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/orders/${order.id}/tracking`}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
          >
            <Truck className="w-4 h-4" />
            Theo dõi tiến trình đơn hàng
          </Link>

          <Link
            to="/orders"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl border border-stone-300 text-stone-800 text-xs font-medium hover:bg-white transition-colors"
          >
            Lịch sử đơn hàng
          </Link>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="bg-white rounded-2xl border border-[#EADBCE] p-6 space-y-8 shadow-2xs">
        
        {/* Status & Codes Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-stone-100 text-xs">
          <div>
            <span className="text-stone-400 block mb-1">Mã đơn hàng</span>
            <strong className="text-stone-900 font-mono text-sm">{order.orderCode}</strong>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">Thời gian đặt</span>
            <span className="text-stone-800 font-medium">{formatDateVi(order.createdAt)}</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">Trạng thái thanh toán</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
              isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {getPaymentStatusText(order.paymentStatus)}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">Trạng thái đơn hàng</span>
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
              {getOrderStatusText(order.orderStatus)}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-stone-100 text-xs">
          <div className="space-y-2">
            <h3 className="font-semibold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-stone-600" />
              Địa chỉ nhận hàng
            </h3>
            <p className="font-medium text-stone-800">{order.shippingAddress.fullName}</p>
            <p className="text-stone-600">{order.shippingAddress.phone}</p>
            <p className="text-stone-600">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-stone-600" />
              Phương thức thanh toán
            </h3>
            <p className="font-medium text-stone-800">
              {order.paymentMethod === 'payos' ? 'Thanh toán trực tuyến PayOS (VietQR)' : 'Thanh toán khi nhận hàng (COD)'}
            </p>
            <p className="text-stone-500">
              {order.paymentMethod === 'payos'
                ? 'Đã xác nhận thanh toán an toàn qua cổng PayOS.'
                : 'Vui lòng chuẩn bị tiền mặt khi bưu tá giao hàng.'}
            </p>
            {order.customerNotes && (
              <p className="text-stone-500 pt-1">
                <strong>Ghi chú:</strong> {order.customerNotes}
              </p>
            )}
          </div>
        </div>

        {/* Custom Scent Request Banner if any */}
        {order.customScentRequests.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Yêu Cầu Mùi Hương Tuỳ Chỉnh Trong Đơn Hàng</span>
            </div>
            {order.customScentRequests.map((req) => (
              <div key={req.id} className="p-3 bg-white/80 rounded-lg border border-amber-200/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-900">{req.productName} ({req.candleDescription})</span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                    {getCustomScentStatusText(req.status)}
                  </span>
                </div>
                <p className="text-stone-700 italic">"{req.customScentText}"</p>
                {req.adminNote && (
                  <p className="text-[11px] text-stone-600 pt-0.5">
                    <strong>Ghi chú từ nghệ nhân:</strong> {req.adminNote}
                  </p>
                )}
              </div>
            ))}
            <p className="text-[11px] text-stone-500">
              Thời gian chuẩn bị và giao hàng cho sản phẩm chứa mùi hương tuỳ chỉnh sẽ cần thêm 2-3 ngày để hoàn thiện thủ công.
            </p>
          </div>
        )}

        {/* Product Items Table */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-stone-900 font-normal">Chi Tiết Sản Phẩm</h3>
          <div className="divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex gap-4 items-start text-xs">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-stone-200">
                  <ProductArtwork type={item.product.type} title={item.product.name} />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-semibold text-stone-900">{item.product.name}</p>
                  <p className="text-stone-500">
                    {item.selectedSize && `Dung tích: ${item.selectedSize}`}
                    {item.selectedScent && ` · Mùi: ${item.selectedScent}`}
                  </p>

                  {/* Combo Scents */}
                  {item.comboSelections && (
                    <div className="text-[11px] text-stone-600 space-y-0.5 pt-1">
                      {item.comboSelections.map((cand) => (
                        <div key={cand.candleNumber}>
                          • Nến {cand.candleNumber}: {cand.isCustom ? `Tự phối (${cand.customScentText})` : cand.scent}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-stone-400 tabular-nums">
                    Số lượng: {item.quantity} × {formatVND(item.unitPrice)}
                  </p>
                </div>
                <div className="text-right font-semibold text-stone-900 tabular-nums">
                  {formatVND(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Totals */}
        <div className="pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Tiền hàng:</span>
            <span className="font-semibold text-stone-900 tabular-nums">{formatVND(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span className="font-semibold text-stone-900 tabular-nums">{formatVND(order.shippingFee)}</span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-sm">
            <span className="font-bold text-stone-900">Tổng thanh toán:</span>
            <span className="font-bold text-lg text-amber-950 tabular-nums">{formatVND(order.total)}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
