import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAsync } from '../hooks/useCatalog';
import { getOrder } from '../api/orders';
import type { OrderDetail } from '../api/types';
import {
  getPaymentStatusText,
  formatVND,
  formatDateTimeVi,
} from '../utils/formatters';
import { CancelOrderButton } from '../components/CancelOrderButton';
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  ArrowLeft,
  Sparkles,
  MapPin,
  Ban,
} from 'lucide-react';

type TimelineEntry = OrderDetail['timeline'][number];

const STEPS = [
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

type LogState = 'done' | 'current' | 'upcoming' | 'cancelled';

interface LogItem {
  key: string;
  title: string;
  desc?: string;
  entry?: TimelineEntry;
  state: LogState;
}

export const OrderTrackingPage: React.FC = () => {
  // Tham số trên URL là mã đơn hàng (order_code)
  const { id } = useParams<{ id: string }>();
  const { data: order, loading, error, reload } = useAsync(() => getOrder(id ?? ''), [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Đang tải tiến trình đơn hàng...
      </div>
    );
  }

  if (error && error.status !== 404) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-red-600">{error.message}</p>
        <button
          onClick={reload}
          className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Không tìm thấy thông tin đơn hàng</h2>
        <p className="text-xs text-stone-500">
          Mã đơn hàng không hợp lệ hoặc bạn không có quyền xem đơn hàng này.
        </p>
        <Link
          to="/orders"
          className="inline-block py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          Xem đơn hàng của bạn
        </Link>
      </div>
    );
  }

  // Mỗi trạng thái có một mốc thời gian trong lịch sử đơn hàng
  const entryByStatus = new Map<string, TimelineEntry>();
  for (const h of order.timeline) entryByStatus.set(h.status, h);

  const placed = entryByStatus.get('PENDING');
  const cancelled = entryByStatus.get('CANCELLED');
  const isCancelled = order.status === 'CANCELLED';

  // Bước cao nhất đã đạt được (trong 4 bước), -1 nếu chưa được xác nhận
  const reachedIdx = STEPS.reduce(
    (acc, st, idx) => (entryByStatus.has(st.key) ? idx : acc),
    -1
  );
  const progressPct = reachedIdx <= 0 ? 0 : (reachedIdx / (STEPS.length - 1)) * 100;
  const isWaitingConfirm = order.status === 'PENDING';

  // Nhật ký chi tiết
  const log: LogItem[] = [];
  if (placed) {
    log.push({
      key: 'PENDING',
      title: 'Đã đặt hàng',
      desc: 'Đơn hàng đã được ghi nhận vào hệ thống',
      entry: placed,
      state: isWaitingConfirm ? 'current' : 'done',
    });
  }
  STEPS.forEach((st, idx) => {
    const reached = idx <= reachedIdx;
    // Đơn đã hủy thì chỉ hiện các bước đã đi qua
    if (isCancelled && !reached) return;
    log.push({
      key: st.key,
      title: st.label,
      desc: st.desc,
      entry: entryByStatus.get(st.key),
      state: !reached ? 'upcoming' : idx === reachedIdx && !isCancelled ? 'current' : 'done',
    });
  });
  if (isCancelled) {
    log.push({
      key: 'CANCELLED',
      title: 'Đơn hàng đã hủy',
      entry: cancelled,
      state: 'cancelled',
    });
  }

  const payment = order.payment;
  const address = [
    order.shipping.address_line,
    order.shipping.ward,
    order.shipping.district,
    order.shipping.province,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link
          to={`/orders/${order.order_code}`}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại chi tiết đơn hàng #{order.order_code}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-serif text-3xl text-stone-900 font-normal">
            Theo Dõi Tiến Trình Đơn Hàng
          </h1>
          <span className="text-xs text-stone-500">
            Mã đơn: <strong className="text-stone-900 font-mono">{order.order_code}</strong>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#EADBCE] p-6 sm:p-10 shadow-2xs space-y-10">
        <CancelOrderButton
          orderCode={order.order_code}
          status={order.status}
          paymentStatus={order.payment?.status}
          onCancelled={reload}
        />

        {/* Thông báo trạng thái đặc biệt */}
        {isCancelled && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-red-800">
              <Ban className="w-4 h-4" />
              <span>Đơn hàng đã được hủy</span>
              {cancelled && (
                <span className="font-normal text-red-700/80">
                  ({formatDateTimeVi(cancelled.created_at)})
                </span>
              )}
            </div>
            {cancelled?.note && <p className="text-red-900">{cancelled.note}</p>}
          </div>
        )}

        {isWaitingConfirm && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs flex items-start gap-2 text-amber-950">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {payment?.method === 'PAYOS' && payment.status !== 'PAID'
                ? 'Đơn hàng đang chờ thanh toán qua PayOS.'
                : 'Đơn hàng đã được ghi nhận và đang chờ Glowcard xác nhận. Chúng tôi sẽ cập nhật tại đây ngay khi xác nhận.'}
            </span>
          </div>
        )}

        {/* Thanh tiến trình ngang (desktop) */}
        <div className="hidden sm:grid sm:grid-cols-4 relative">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-stone-200 -z-0">
            <div
              className="h-full bg-amber-800 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {STEPS.map((st, idx) => {
            const isCompleted = idx <= reachedIdx;
            const isCurrent = idx === reachedIdx && !isCancelled;
            const entry = entryByStatus.get(st.key);

            return (
              <div
                key={st.key}
                className="flex flex-col items-center text-center relative z-10 px-2 space-y-2"
              >
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
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-amber-900'
                        : isCompleted
                        ? 'text-stone-900'
                        : 'text-stone-400'
                    }`}
                  >
                    {st.label}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {entry ? formatDateTimeVi(entry.created_at) : isCancelled ? '—' : 'Dự kiến'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nhật ký chi tiết */}
        <div className="border-t border-stone-100 pt-8 space-y-6">
          <h3 className="font-serif text-xl text-stone-900 font-normal">
            Nhật Ký Tiến Trình Chi Tiết
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {log.map((item) => {
              const dot =
                item.state === 'current'
                  ? 'border-amber-800 bg-amber-800 ring-4 ring-amber-100'
                  : item.state === 'done'
                  ? 'border-amber-800 bg-amber-800'
                  : item.state === 'cancelled'
                  ? 'border-red-600 bg-red-600 ring-4 ring-red-100'
                  : 'border-stone-300 bg-stone-100';
              const titleColor =
                item.state === 'current'
                  ? 'text-amber-900'
                  : item.state === 'done'
                  ? 'text-stone-900'
                  : item.state === 'cancelled'
                  ? 'text-red-700'
                  : 'text-stone-400';

              return (
                <div key={item.key} className="relative space-y-1 text-xs">
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 transition-colors ${dot}`}
                  />

                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className={`font-semibold text-sm ${titleColor}`}>{item.title}</span>
                    <span className="text-stone-400 text-[11px]">
                      ({item.entry ? formatDateTimeVi(item.entry.created_at) : 'Dự kiến'})
                    </span>
                    {item.state === 'current' && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        Hiện tại
                      </span>
                    )}
                  </div>

                  {item.desc && item.state !== 'cancelled' && (
                    <p className="text-[11px] text-stone-500">{item.desc}</p>
                  )}

                  {item.entry?.note && item.state !== 'cancelled' && (
                    <p className="text-stone-600 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80">
                      {item.entry.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ghi chú mùi hương tuỳ chỉnh */}
        {order.custom_scent_requests.length > 0 && !isCancelled && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Ghi chú cho đơn hàng có mùi hương riêng:</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              Mỗi sản phẩm tuỳ chỉnh được rót mẻ riêng và cần thời gian ủ sáp từ 48 - 72 giờ để cấu
              trúc hương thơm hòa quyện bền bỉ nhất trước khi xuất xưởng.
            </p>
          </div>
        )}

        {/* Nơi nhận và tổng tiền */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between gap-4 text-xs text-stone-600">
          <div className="space-y-1">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              Nơi nhận hàng:
            </span>
            <p className="text-stone-700">
              {order.shipping.recipient_name} · {order.shipping.phone}
            </p>
            <p className="text-stone-500">{address}</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="font-semibold text-stone-900">Tổng thanh toán:</span>
            <p className="text-base font-bold text-amber-950 tabular-nums">
              {formatVND(order.total)}
            </p>
            <p className="text-[11px] text-stone-500">
              {payment ? getPaymentStatusText(payment.status) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
