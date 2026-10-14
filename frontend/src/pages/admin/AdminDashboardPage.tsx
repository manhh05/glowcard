import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useCatalog';
import { getDashboard, listAdminOrders } from '../../api/admin';
import {
  formatVND,
  formatDateVi,
  getOrderStatusText,
  getPaymentStatusText,
} from '../../utils/formatters';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

const LOW_STOCK_THRESHOLD = 5;
const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const dayLabel = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T00:00:00`);
  const dd = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  return days <= 7 ? `${WEEKDAY[d.getDay()]} ${dd}` : dd;
};

export const AdminDashboardPage: React.FC = () => {
  const [days, setDays] = useState(7);

  const dash = useAsync(() => getDashboard(days, LOW_STOCK_THRESHOLD), [days]);
  const recent = useAsync(() => listAdminOrders({ limit: 5 }), []);

  const stats = dash.data;

  if (!stats) {
    return (
      <div className="py-20 text-center text-sm">
        {dash.error ? (
          <div className="space-y-3">
            <p className="text-red-600">{dash.error.message}</p>
            <button
              onClick={dash.reload}
              className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <p className="text-stone-500">Đang tải số liệu...</p>
        )}
      </div>
    );
  }

  const maxRevenue = Math.max(1, ...stats.daily.map((d) => d.revenue));
  const maxOrders = Math.max(1, ...stats.daily.map((d) => d.orders));
  const inProgress =
    stats.orders_confirmed + stats.orders_preparing + stats.orders_shipped;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900 font-normal">
            Bảng Tổng Quan Hoạt Động
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi tổng doanh thu, tiến độ đơn hàng và cảnh báo tồn kho Glowcard
          </p>
        </div>

        <Link
          to="/admin/custom-scent"
          className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-amber-100 text-amber-950 text-xs font-semibold hover:bg-amber-200/80 transition-colors border border-amber-300"
        >
          <Sparkles className="w-4 h-4 text-amber-800" />
          <span>{stats.pending_custom_scents} yêu cầu mùi hương chờ xử lý</span>
        </Link>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tổng doanh thu</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {formatVND(stats.total_revenue)}
          </div>
          <p className="text-[11px] text-stone-500">Chỉ tính các đơn đã thu tiền</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tổng số đơn hàng</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.total_orders} đơn
          </div>
          <p className="text-[11px] text-stone-500">
            {stats.orders_completed} đã hoàn tất · {stats.cancelled_orders} đã hủy
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Đang xử lý & giao</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {inProgress} đơn
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            {stats.orders_preparing} đang rót sáp, {stats.orders_shipped} đang giao
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Sản phẩm sắp hết hàng</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {stats.low_stock.length} mặt hàng
          </div>
          <p className="text-[11px] text-rose-700 font-medium">
            Tồn kho ≤ {stats.low_stock_threshold} · {stats.out_of_stock_count} đã hết
          </p>
        </div>
      </div>

      {/* Orders By Status Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h3 className="font-serif text-lg text-stone-900 font-normal">
          Phân Bổ Tiến Độ Đơn Hàng
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200">
            <span className="text-rose-900 block mb-1">Chờ xác nhận</span>
            <strong className="text-xl text-rose-950 tabular-nums">{stats.orders_pending}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-stone-500 block mb-1">Đã xác nhận</span>
            <strong className="text-xl text-stone-900 tabular-nums">{stats.orders_confirmed}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-amber-900 block mb-1">Đang chuẩn bị</span>
            <strong className="text-xl text-amber-950 tabular-nums">{stats.orders_preparing}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-blue-900 block mb-1">Đang giao</span>
            <strong className="text-xl text-blue-950 tabular-nums">{stats.orders_shipped}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-emerald-900 block mb-1">Hoàn thành</span>
            <strong className="text-xl text-emerald-950 tabular-nums">{stats.orders_completed}</strong>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-stone-900 font-normal">Thống Kê Theo Ngày</h3>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-xs p-2 rounded-xl border border-stone-200 bg-white"
          >
            <option value={7}>7 ngày gần nhất</option>
            <option value={14}>14 ngày gần nhất</option>
            <option value={30}>30 ngày gần nhất</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-stone-900 font-normal">Doanh Thu</h3>
                <p className="text-xs text-stone-500">Tiền đã thu theo từng ngày</p>
              </div>
              <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md tabular-nums">
                {formatVND(stats.period_revenue)}
              </span>
            </div>

            <div className="pt-4 flex items-end justify-between gap-1.5 h-44 border-b border-stone-200 px-1">
              {stats.daily.map((item, idx) => {
                const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                const showLabel = days <= 7 || idx % 5 === 0 || idx === stats.daily.length - 1;
                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end min-w-0"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-stone-800 tabular-nums text-center whitespace-nowrap">
                      {(item.revenue / 1000).toLocaleString('vi-VN')}k
                    </div>
                    <div
                      className="w-full max-w-[36px] bg-amber-800/80 hover:bg-amber-800 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(heightPercent, item.revenue > 0 ? 3 : 0)}%` }}
                    />
                    <span className="text-[10px] sm:text-xs text-stone-600 font-medium pt-1 h-4 whitespace-nowrap">
                      {showLabel ? dayLabel(item.date, days) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orders count */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-stone-900 font-normal">Số Đơn Hàng</h3>
                <p className="text-xs text-stone-500">Đơn phát sinh theo từng ngày (không tính đơn hủy)</p>
              </div>
              <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md tabular-nums">
                {stats.daily.reduce((sum, d) => sum + d.orders, 0)} đơn
              </span>
            </div>

            <div className="pt-4 flex items-end justify-between gap-1.5 h-44 border-b border-stone-200 px-1">
              {stats.daily.map((item, idx) => {
                const heightPercent = Math.round((item.orders / maxOrders) * 100);
                const showLabel = days <= 7 || idx % 5 === 0 || idx === stats.daily.length - 1;
                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end min-w-0"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-stone-800 tabular-nums">
                      {item.orders} đơn
                    </div>
                    <div
                      className="w-full max-w-[36px] bg-stone-800/80 hover:bg-stone-900 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(heightPercent, item.orders > 0 ? 3 : 0)}%` }}
                    />
                    <span className="text-[10px] sm:text-xs text-stone-600 font-medium pt-1 h-4 whitespace-nowrap">
                      {showLabel ? dayLabel(item.date, days) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Low stock list */}
      {stats.low_stock.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-stone-900 font-normal">
              Cảnh Báo Tồn Kho (≤ {stats.low_stock_threshold})
            </h3>
            <Link
              to="/admin/products"
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold"
            >
              Nhập thêm hàng →
            </Link>
          </div>
          <div className="divide-y divide-stone-100 text-xs">
            {stats.low_stock.map((item) => (
              <div key={item.variant_id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 truncate">{item.product_name}</p>
                  <p className="text-[11px] text-stone-500">{item.label}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums shrink-0 ${
                    item.stock_quantity <= 0
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {item.stock_quantity <= 0 ? 'Hết hàng' : `Còn ${item.stock_quantity}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-stone-900 font-normal">Đơn Hàng Gần Đây</h3>
          <Link
            to="/admin/orders"
            className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1"
          >
            Xem tất cả đơn hàng →
          </Link>
        </div>

        {recent.error ? (
          <p className="text-xs text-red-600">{recent.error.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Mã đơn</th>
                  <th className="py-2.5 px-3 font-medium">Người nhận</th>
                  <th className="py-2.5 px-3 font-medium">Ngày đặt</th>
                  <th className="py-2.5 px-3 font-medium">Thanh toán</th>
                  <th className="py-2.5 px-3 font-medium">Trạng thái</th>
                  <th className="py-2.5 px-3 font-medium text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(recent.data?.items ?? []).map((ord) => (
                  <tr key={ord.order_code} className="hover:bg-stone-50/70">
                    <td className="py-3 px-3 font-mono font-medium text-stone-900">
                      <Link to={`/admin/orders?q=${ord.order_code}`} className="hover:underline">
                        {ord.order_code}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-stone-800 font-medium">{ord.recipient_name}</td>
                    <td className="py-3 px-3 text-stone-500">{formatDateVi(ord.created_at)}</td>
                    <td className="py-3 px-3">
                      {ord.payment_status && (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            ord.payment_status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {getPaymentStatusText(ord.payment_status)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          ord.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {getOrderStatusText(ord.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-stone-900 tabular-nums">
                      {formatVND(ord.total)}
                    </td>
                  </tr>
                ))}
                {recent.data && recent.data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-stone-400">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
