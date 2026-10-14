import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAsync } from '../../hooks/useCatalog';
import {
  getAdminOrder,
  listAdminOrders,
  updateOrderStatus,
} from '../../api/admin';
import { adminErrorMessage } from '../../api/errors';
import type { OrderStatusUpdateIn } from '../../api/types';
import {
  formatVND,
  formatDateVi,
  formatDateTimeVi,
  getOrderStatusText,
  getPaymentStatusText,
  getCustomScentStatusText,
} from '../../utils/formatters';
import { Search, Eye, Sparkles, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

type StatusTarget = OrderStatusUpdateIn['status'];

const PAGE_SIZE = 20;

// Các bước tiếp theo được phép (khớp với luật ở backend)
const NEXT_STEP: Record<string, { to: StatusTarget; label: string; hint?: string }[]> = {
  PENDING: [{ to: 'CONFIRMED', label: 'Xác nhận đơn' }],
  CONFIRMED: [{ to: 'PREPARING', label: 'Bắt đầu chuẩn bị' }],
  PREPARING: [{ to: 'SHIPPED', label: 'Giao cho đơn vị vận chuyển' }],
  SHIPPED: [
    {
      to: 'COMPLETED',
      label: 'Đánh dấu hoàn thành',
      hint: 'Đơn COD sẽ tự chuyển sang "Đã thanh toán".',
    },
  ],
};
const CAN_CANCEL = ['PENDING', 'CONFIRMED', 'PREPARING'];

const statusChip = (status: string) => {
  if (status === 'CANCELLED') return 'bg-red-50 text-red-700 border border-red-200';
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
  if (status === 'PENDING') return 'bg-rose-50 text-rose-800 border border-rose-200';
  return 'bg-stone-100 text-stone-800 border border-stone-200';
};

const paymentChip = (status: string) =>
  status === 'PAID'
    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    : status === 'PENDING'
    ? 'bg-amber-50 text-amber-800 border border-amber-200'
    : 'bg-stone-100 text-stone-600 border border-stone-200';

const methodText = (m: string | null) =>
  m === 'PAYOS' ? 'PayOS' : m === 'COD' ? 'COD' : '—';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [page, setPage] = useState(0);
  const [version, setVersion] = useState(0);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Gõ xong 300ms mới tìm, tránh gọi API mỗi phím
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, loading, error, reload } = useAsync(
    () =>
      listAdminOrders({
        status: status === 'all' ? undefined : status,
        payment_status: payment === 'all' ? undefined : payment,
        q: q || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    [status, payment, q, page, version]
  );

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl text-stone-900 font-normal">Quản Lý Đơn Hàng</h1>
        <p className="text-xs text-stone-500 mt-1">
          Theo dõi danh sách đơn đặt, cập nhật tiến độ làm nến và giao nhận
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên người nhận, số điện thoại..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 bg-stone-50 text-stone-900"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 shrink-0">Tiến độ:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PREPARING">Đang chuẩn bị</option>
              <option value="SHIPPED">Đang giao</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 shrink-0">Thanh toán:</span>
            <select
              value={payment}
              onChange={(e) => {
                setPayment(e.target.value);
                setPage(0);
              }}
              className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PENDING">Chưa thanh toán</option>
              <option value="FAILED">Thất bại</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-xs text-red-600">{error.message}</p>
            <button
              onClick={reload}
              className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 font-medium">Mã đơn</th>
                  <th className="py-3 px-4 font-medium">Người nhận</th>
                  <th className="py-3 px-4 font-medium">Ngày đặt</th>
                  <th className="py-3 px-4 font-medium">Tổng tiền</th>
                  <th className="py-3 px-4 font-medium">Thanh toán</th>
                  <th className="py-3 px-4 font-medium">Trạng thái đơn</th>
                  <th className="py-3 px-4 font-medium">Mùi hương riêng</th>
                  <th className="py-3 px-4 font-medium text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.order_code} className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      {ord.order_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-900">{ord.recipient_name}</p>
                      <p className="text-[11px] text-stone-500">{ord.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">{formatDateVi(ord.created_at)}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums">
                      {formatVND(ord.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.payment_status ? (
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block text-[11px] font-medium py-0.5 px-2 rounded ${paymentChip(
                              ord.payment_status
                            )}`}
                          >
                            {getPaymentStatusText(ord.payment_status)}
                          </span>
                          <p className="text-[10px] text-stone-400">
                            {methodText(ord.payment_method)}
                          </p>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[11px] font-medium py-1 px-2 rounded ${statusChip(
                          ord.status
                        )}`}
                      >
                        {getOrderStatusText(ord.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.pending_custom_scents > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          {ord.pending_custom_scents} chờ xử lý
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCode(ord.order_code)}
                        className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      Không có đơn hàng nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Tổng <strong className="text-stone-800 tabular-nums">{total}</strong> đơn · Trang{' '}
              {page + 1}/{pageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedCode && (
        <OrderDetailModal
          code={selectedCode}
          onClose={() => setSelectedCode(null)}
          onChanged={() => setVersion((v) => v + 1)}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------

const OrderDetailModal: React.FC<{
  code: string;
  onClose: () => void;
  onChanged: () => void;
}> = ({ code, onClose, onChanged }) => {
  const { data: order, loading, error, reload } = useAsync(() => getAdminOrder(code), [code]);

  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  const changeStatus = async (to: StatusTarget) => {
    setBusy(true);
    setActionError('');
    try {
      await updateOrderStatus(code, { status: to, note: note.trim() || null });
      setNote('');
      setConfirmCancel(false);
      reload();
      onChanged();
    } catch (e) {
      setActionError(adminErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const nextSteps = order ? NEXT_STEP[order.status] ?? [] : [];
  const canCancel = order ? CAN_CANCEL.includes(order.status) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-2xl text-stone-900 font-normal">Đơn Hàng #{code}</h3>
            {order && (
              <p className="text-xs text-stone-500">
                Thời gian đặt: {formatDateTimeVi(order.created_at)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!order && loading && (
          <p className="py-10 text-center text-xs text-stone-500">Đang tải chi tiết đơn...</p>
        )}

        {!order && error && (
          <div className="py-10 text-center space-y-3">
            <p className="text-xs text-red-600">{error.message}</p>
            <button
              onClick={reload}
              className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {order && (
          <>
            {/* Trạng thái và thao tác */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-stone-500">Trạng thái đơn:</span>
                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusChip(order.status)}`}>
                  {getOrderStatusText(order.status)}
                </span>
                {order.payments.length > 0 && (
                  <>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">Thanh toán:</span>
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold ${paymentChip(
                        order.payments[order.payments.length - 1].status
                      )}`}
                    >
                      {getPaymentStatusText(order.payments[order.payments.length - 1].status)}
                    </span>
                  </>
                )}
              </div>

              {(nextSteps.length > 0 || canCancel) && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">
                      Ghi chú cho bước này (khách hàng sẽ thấy trong trang theo dõi đơn, ví dụ mã vận đơn):
                    </label>
                    <input
                      type="text"
                      maxLength={500}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Không bắt buộc"
                      className="w-full p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  {actionError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {nextSteps.map((step) => (
                      <div key={step.to} className="space-y-1">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus(step.to)}
                          className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 font-semibold hover:bg-stone-800 disabled:opacity-60 transition-colors"
                        >
                          {busy ? 'Đang cập nhật...' : step.label}
                        </button>
                        {step.hint && <p className="text-[11px] text-stone-500">{step.hint}</p>}
                      </div>
                    ))}

                    {canCancel && !confirmCancel && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmCancel(true)}
                        className="py-2 px-4 rounded-xl border border-red-200 text-red-700 bg-red-50 font-medium hover:bg-red-100 disabled:opacity-60 transition-colors"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>

                  {confirmCancel && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2">
                      <p className="text-red-800 font-medium">
                        Hủy đơn #{code}? Tồn kho các sản phẩm trong đơn sẽ được trả lại và không thể
                        hoàn tác. Nếu đơn đã thanh toán qua PayOS, bạn cần tự hoàn tiền bên PayOS.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus('CANCELLED')}
                          className="py-2 px-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                        >
                          {busy ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmCancel(false)}
                          className="py-2 px-3 rounded-lg border border-stone-300 text-stone-700 hover:bg-white"
                        >
                          Không hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {nextSteps.length === 0 && !canCancel && (
                <p className="text-stone-500">
                  Đơn hàng đã ở trạng thái cuối, không thể thay đổi thêm.
                </p>
              )}
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-stone-200 text-xs">
              <div className="space-y-1">
                <strong className="text-stone-900 block">Tài khoản đặt hàng:</strong>
                <p className="text-stone-700">{order.customer.full_name}</p>
                <p className="text-stone-600">{order.customer.phone || '—'}</p>
                <p className="text-stone-500">{order.customer.email}</p>
              </div>

              <div className="space-y-1">
                <strong className="text-stone-900 block">Giao đến:</strong>
                <p className="text-stone-800 font-medium">
                  {order.shipping.recipient_name} · {order.shipping.phone}
                </p>
                <p className="text-stone-600 leading-relaxed">
                  {[
                    order.shipping.address_line,
                    order.shipping.ward,
                    order.shipping.district,
                    order.shipping.province,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {order.note && (
                  <p className="text-amber-900 pt-1">
                    <strong>Ghi chú của khách:</strong> {order.note}
                  </p>
                )}
              </div>
            </div>

            {/* Payments */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-stone-900">Thanh toán:</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl px-3">
                {order.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-stone-900">{methodText(p.method)}</span>
                      <span className="text-stone-400"> · </span>
                      <span className="text-stone-500">
                        {p.paid_at
                          ? `Thu lúc ${formatDateTimeVi(p.paid_at)}`
                          : `Tạo lúc ${formatDateTimeVi(p.created_at)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums text-stone-700">{formatVND(p.amount)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${paymentChip(
                          p.status
                        )}`}
                      >
                        {getPaymentStatusText(p.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom scent */}
            {order.custom_scent_requests.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    Yêu cầu mùi hương riêng cần phối chế:
                  </p>
                  <Link
                    to="/admin/custom-scent"
                    className="text-[11px] font-semibold text-amber-900 hover:underline"
                  >
                    Duyệt yêu cầu →
                  </Link>
                </div>
                {order.custom_scent_requests.map((req) => (
                  <div key={req.id} className="p-3 bg-white rounded-lg border border-amber-200 space-y-1">
                    <p className="font-semibold text-stone-900">{req.description}</p>
                    <p className="text-stone-700 italic">"{req.requested_text}"</p>
                    <p className="text-stone-500 text-[11px]">
                      Trạng thái: {getCustomScentStatusText(req.status)}
                      {req.internal_note ? ` · Ghi chú: ${req.internal_note}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-stone-900">Chi tiết sản phẩm đã đặt:</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl p-3">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-stone-900">{item.product_name}</p>
                      {item.product_type !== 'COMBO' && (
                        <p className="text-stone-500 text-[11px]">{item.variant_label}</p>
                      )}
                      {item.custom_scent_text && (
                        <p className="text-[11px] text-amber-900">
                          Mùi hương tuỳ chỉnh: "{item.custom_scent_text}"
                        </p>
                      )}
                      {item.selections.length > 0 && (
                        <div className="text-[11px] text-stone-600 pl-2 border-l-2 border-stone-200">
                          {item.selections.map((sel) => (
                            <p key={sel.slot_no}>
                              Nến {sel.slot_no}:{' '}
                              {sel.is_custom
                                ? `Tự phối (${sel.custom_scent_text})`
                                : sel.scent_name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-stone-500 tabular-nums">
                        {item.quantity} × {formatVND(item.unit_price)}
                      </p>
                      <p className="font-semibold text-stone-900 tabular-nums">
                        {formatVND(item.line_total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Tiền hàng:</span>
                <span className="tabular-nums">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="tabular-nums">{formatVND(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between items-baseline text-sm pt-1">
                <span className="font-bold text-stone-900">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-amber-950 tabular-nums">
                  {formatVND(order.total)}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-stone-900">Lịch sử trạng thái:</h4>
              <div className="space-y-1.5 border border-stone-200 rounded-xl p-3">
                {order.timeline.map((h, idx) => (
                  <div key={idx} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium text-stone-900">{getOrderStatusText(h.status)}</span>
                    <span className="text-stone-400">{formatDateTimeVi(h.created_at)}</span>
                    {h.note && <span className="text-stone-600">· {h.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
