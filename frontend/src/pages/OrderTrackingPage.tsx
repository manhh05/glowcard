import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { getOrderStatusText, getPaymentStatusText, formatVND } from '../utils/formatters';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck, 
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById } = useOrders();
  const order = getOrderById(id || '');

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Không tìm thấy thông tin đơn hàng</h2>
        <p className="text-xs text-stone-500">Mã đơn hàng không hợp lệ hoặc đã bị thay đổi.</p>
        <Link to="/orders" className="inline-block py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium">
          Xem đơn hàng của bạn
        </Link>
      </div>
    );
  }

  const steps = [
    {
      key: 'CONFIRMED',
      label: 'Đã xác nhận',
      icon: CheckCircle2,
      desc: 'Đơn hàng được tiếp nhận và nhân viên bắt đầu kiểm tra đơn',
    },
    {
      key: 'PREPARING',
      label: 'Đang chuẩn bị',
      icon: Clock,
      desc: 'Nghệ nhân Glowcard rót sáp thủ công, phối hương và đóng gói hộp quà',
    },
    {
      key: 'SHIPPED',
      label: 'Đang giao hàng',
      icon: Truck,
      desc: 'Kiện hàng đã bàn giao cho đối tác vận chuyển và đang trên đường tới bạn',
    },
    {
      key: 'COMPLETED',
      label: 'Hoàn thành',
      icon: PackageCheck,
      desc: 'Giao hàng thành công đến tay người nhận',
    },
  ];

  const statusOrderMap: Record<string, number> = {
    CONFIRMED: 0,
    PREPARING: 1,
    SHIPPED: 2,
    COMPLETED: 3,
  };

  const currentStepIndex = statusOrderMap[order.orderStatus] ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800">
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại chi tiết đơn hàng #{order.orderCode}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-serif text-3xl text-stone-900 font-normal">
            Theo Dõi Tiến Trình Đơn Hàng
          </h1>
          <span className="text-xs text-stone-500">
            Mã đơn: <strong className="text-stone-900 font-mono">{order.orderCode}</strong>
          </span>
        </div>
      </div>

      {/* Visual Step Progress Card */}
      <div className="bg-white rounded-3xl border border-[#EADBCE] p-6 sm:p-10 shadow-2xs space-y-10">
        
        {/* Horizontal Progress Bar for Desktop */}
        <div className="hidden sm:grid sm:grid-cols-4 relative">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-stone-200 -z-0">
            <div
              className="h-full bg-amber-800 transition-all duration-500"
              style={{ width: `${(currentStepIndex / 3) * 100}%` }}
            />
          </div>

          {steps.map((st, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const timelineStep = order.trackingTimeline[idx];

            return (
              <div key={st.key} className="flex flex-col items-center text-center relative z-10 px-2 space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-amber-800 text-white shadow-sm ring-4 ring-amber-100'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  <st.icon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-amber-900' : isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                    {st.label}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {timelineStep?.timestamp || 'Dự kiến'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Vertical Timeline */}
        <div className="border-t border-stone-100 pt-8 space-y-6">
          <h3 className="font-serif text-xl text-stone-900 font-normal">
            Nhật Ký Tiến Trình Chi Tiết
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {order.trackingTimeline.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.status} className="relative space-y-1 text-xs">
                  {/* Dot Marker */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white transition-colors ${
                      isCurrent
                        ? 'border-amber-800 bg-amber-800 ring-4 ring-amber-100'
                        : isPast
                        ? 'border-amber-800 bg-amber-800'
                        : 'border-stone-300 bg-stone-100'
                    }`}
                  />

                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className={`font-semibold text-sm ${isCurrent ? 'text-amber-900' : isPast ? 'text-stone-900' : 'text-stone-400'}`}>
                      {step.title}
                    </span>
                    <span className="text-stone-400 text-[11px]">
                      ({step.timestamp})
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        Hiện tại
                      </span>
                    )}
                  </div>

                  {step.note && (
                    <p className="text-stone-600 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80">
                      {step.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Scent Note In Tracking */}
        {order.customScentRequests.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Ghi chú cho đơn hàng có mùi hương riêng:</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              Mỗi sản phẩm tuỳ chỉnh được rót mẻ riêng và cần thời gian ủ sáp từ 48 - 72 giờ để cấu trúc hương thơm hòa quyện bền bỉ nhất trước khi xuất xưởng.
            </p>
          </div>
        )}

        {/* Destination Summary */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between gap-4 text-xs text-stone-600">
          <div className="space-y-1">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              Nơi nhận hàng:
            </span>
            <p className="text-stone-700">
              {order.shippingAddress.fullName} · {order.shippingAddress.phone}
            </p>
            <p className="text-stone-500">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="font-semibold text-stone-900">Tổng thanh toán:</span>
            <p className="text-base font-bold text-amber-950 tabular-nums">
              {formatVND(order.total)}
            </p>
            <p className="text-[11px] text-stone-500">
              {getPaymentStatusText(order.paymentStatus)}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
