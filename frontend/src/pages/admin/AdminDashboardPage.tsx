import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { formatVND, formatDateVi, getOrderStatusText, getPaymentStatusText } from '../../utils/formatters';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { orders } = useOrders();
  const { products } = useProducts();

  // Metrics calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'CONFIRMED').length;
  const preparingOrders = orders.filter((o) => o.orderStatus === 'PREPARING').length;
  const shippedOrders = orders.filter((o) => o.orderStatus === 'SHIPPED').length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'COMPLETED').length;
  const lowStockProducts = products.filter((p) => p.stock < 20);

  // Custom scent requests count
  const customScentCount = orders.reduce((sum, o) => sum + o.customScentRequests.length, 0);

  // Mock revenue data points for 7 days
  const mockRevenueHistory = [
    { day: 'T2', revenue: 1450000, orders: 3 },
    { day: 'T3', revenue: 2100000, orders: 4 },
    { day: 'T4', revenue: 1800000, orders: 3 },
    { day: 'T5', revenue: 2850000, orders: 6 },
    { day: 'T6', revenue: 3400000, orders: 7 },
    { day: 'T7', revenue: 4900000, orders: 9 },
    { day: 'CN', revenue: 3900000, orders: 8 },
  ];

  const maxDailyRevenue = Math.max(...mockRevenueHistory.map((d) => d.revenue));

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
          <span>{customScentCount} Yêu cầu mùi hương riêng</span>
        </Link>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tổng doanh thu</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {formatVND(totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% so với tuần trước
          </p>
        </div>

        {/* Stat 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tổng số đơn hàng</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {totalOrders} đơn
          </div>
          <p className="text-[11px] text-stone-500">
            {completedOrders} đơn đã hoàn tất
          </p>
        </div>

        {/* Stat 3: Processing Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Đang chuẩn bị & giao</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {pendingOrders + preparingOrders + shippedOrders} đơn
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            {preparingOrders} đang rót sáp, {shippedOrders} đang giao
          </p>
        </div>

        {/* Stat 4: Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Sản phẩm sắp hết hàng</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {lowStockProducts.length} mặt hàng
          </div>
          <p className="text-[11px] text-rose-700 font-medium">
            Tồn kho &lt; 20 sản phẩm
          </p>
        </div>

      </div>

      {/* Orders By Status Bar Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h3 className="font-serif text-lg text-stone-900 font-normal">
          Phân Bổ Tiến Độ Đơn Hàng
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-stone-500 block mb-1">Đơn chờ xác nhận</span>
            <strong className="text-xl text-stone-900 tabular-nums">{pendingOrders}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-amber-900 block mb-1">Đang chuẩn bị (rót sáp)</span>
            <strong className="text-xl text-amber-950 tabular-nums">{preparingOrders}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-blue-900 block mb-1">Đang giao vận chuyển</span>
            <strong className="text-xl text-blue-950 tabular-nums">{shippedOrders}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-emerald-900 block mb-1">Hoàn thành thành công</span>
            <strong className="text-xl text-emerald-950 tabular-nums">{completedOrders}</strong>
          </div>
        </div>
      </div>

      {/* Charts Section: Revenue over time & Orders count */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mock Chart 1: Revenue over time */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-stone-900 font-normal">Doanh Thu 7 Ngày Gần Nhất</h3>
              <p className="text-xs text-stone-500">Mức doanh thu theo từng ngày trong tuần</p>
            </div>
            <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
              Doanh thu tuần
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="pt-4 flex items-end justify-between gap-3 h-44 border-b border-stone-200 px-2">
            {mockRevenueHistory.map((item) => {
              const heightPercent = Math.round((item.revenue / maxDailyRevenue) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-stone-800 tabular-nums text-center whitespace-nowrap">
                    {(item.revenue / 1000).toLocaleString('vi-VN')}k
                  </div>
                  <div
                    className="w-full max-w-[36px] bg-amber-800/80 hover:bg-amber-800 rounded-t-lg transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs text-stone-600 font-medium pt-1">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock Chart 2: Orders count over time */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-stone-900 font-normal">Số Lượng Đơn Hàng Theo Ngày</h3>
              <p className="text-xs text-stone-500">Lượng đơn hàng phát sinh trong tuần</p>
            </div>
            <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
              Đơn hàng
            </span>
          </div>

          <div className="pt-4 flex items-end justify-between gap-3 h-44 border-b border-stone-200 px-2">
            {mockRevenueHistory.map((item) => {
              const maxOrders = 10;
              const heightPercent = Math.round((item.orders / maxOrders) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-stone-800 tabular-nums">
                    {item.orders} đơn
                  </div>
                  <div
                    className="w-full max-w-[36px] bg-stone-800/80 hover:bg-stone-900 rounded-t-lg transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs text-stone-600 font-medium pt-1">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-stone-900 font-normal">Đơn Hàng Gần Đây</h3>
          <Link to="/admin/orders" className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1">
            Xem tất cả đơn hàng →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Mã đơn</th>
                <th className="py-2.5 px-3 font-medium">Khách hàng</th>
                <th className="py-2.5 px-3 font-medium">Ngày đặt</th>
                <th className="py-2.5 px-3 font-medium">Thanh toán</th>
                <th className="py-2.5 px-3 font-medium">Trạng thái</th>
                <th className="py-2.5 px-3 font-medium text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/70">
                  <td className="py-3 px-3 font-mono font-medium text-stone-900">
                    <Link to={`/admin/orders`} className="hover:underline">
                      {ord.orderCode}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-stone-800 font-medium">{ord.customerName}</td>
                  <td className="py-3 px-3 text-stone-500">{formatDateVi(ord.createdAt)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {getPaymentStatusText(ord.paymentStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-800 font-medium">
                      {getOrderStatusText(ord.orderStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-stone-900 tabular-nums">
                    {formatVND(ord.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
