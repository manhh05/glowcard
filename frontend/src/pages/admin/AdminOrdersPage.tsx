import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatVND, formatDateVi, getOrderStatusText, getPaymentStatusText, getCustomScentStatusText } from '../../utils/formatters';
import { ProductArtwork } from '../../components/ProductArtwork';
import { Search, Eye, Sparkles, Filter, X, Check, Truck, Clock } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, updatePaymentStatus } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((ord) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = ord.orderCode.toLowerCase().includes(q);
      const matchName = ord.customerName.toLowerCase().includes(q);
      const matchPhone = ord.customerPhone.includes(q);
      if (!matchCode && !matchName && !matchPhone) return false;
    }

    if (filterStatus !== 'all' && ord.orderStatus !== filterStatus) {
      return false;
    }

    if (filterPayment !== 'all' && ord.paymentStatus !== filterPayment) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl text-stone-900 font-normal">
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Theo dõi danh sách đơn đặt, cập nhật trạng thái làm nến và tiến trình giao nhận
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 bg-stone-50 text-stone-900"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 shrink-0">Tiến độ:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PREPARING">Đang chuẩn bị</option>
              <option value="SHIPPED">Đang giao</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>

          {/* Filter Payment */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 shrink-0">Thanh toán:</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
            </select>
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-medium">Mã đơn</th>
                <th className="py-3 px-4 font-medium">Khách hàng</th>
                <th className="py-3 px-4 font-medium">Thời gian</th>
                <th className="py-3 px-4 font-medium">Tổng tiền</th>
                <th className="py-3 px-4 font-medium">Thanh toán</th>
                <th className="py-3 px-4 font-medium">Trạng thái đơn</th>
                <th className="py-3 px-4 font-medium">Mùi hương riêng</th>
                <th className="py-3 px-4 font-medium text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((ord) => {
                const isPaid = ord.paymentStatus === 'PAID';
                return (
                  <tr key={ord.id} className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      {ord.orderCode}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-900">{ord.customerName}</p>
                      <p className="text-[11px] text-stone-500">{ord.customerPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500">
                      {formatDateVi(ord.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums">
                      {formatVND(ord.total)}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ord.paymentStatus}
                        onChange={(e) => updatePaymentStatus(ord.id, e.target.value as PaymentStatus)}
                        className={`text-[11px] font-medium py-1 px-2 rounded border focus:outline-none cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="UNPAID">Chưa thanh toán</option>
                        <option value="PAID">Đã thanh toán</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="text-[11px] font-medium py-1 px-2 rounded border border-stone-300 bg-white text-stone-800 focus:outline-none cursor-pointer"
                      >
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="PREPARING">Đang chuẩn bị</option>
                        <option value="SHIPPED">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      {ord.customScentRequests.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          {ord.customScentRequests.length} yêu cầu
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-2xl text-stone-900 font-normal">
                  Đơn Hàng #{selectedOrder.orderCode}
                </h3>
                <p className="text-xs text-stone-500">
                  Thời gian đặt: {formatDateVi(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Control Bar */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-stone-500 block">Cập nhật tiến độ đơn:</span>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => {
                    const newSt = e.target.value as OrderStatus;
                    updateOrderStatus(selectedOrder.id, newSt);
                    setSelectedOrder({ ...selectedOrder, orderStatus: newSt });
                  }}
                  className="font-semibold p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                  <option value="PREPARING">Đang chuẩn bị rót sáp (PREPARING)</option>
                  <option value="SHIPPED">Đang giao vận chuyển (SHIPPED)</option>
                  <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-stone-500 block">Cập nhật thanh toán:</span>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => {
                    const newPay = e.target.value as PaymentStatus;
                    updatePaymentStatus(selectedOrder.id, newPay);
                    setSelectedOrder({ ...selectedOrder, paymentStatus: newPay });
                  }}
                  className="font-semibold p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="UNPAID">Chưa thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-stone-200 text-xs">
              <div className="space-y-1">
                <strong className="text-stone-900 block">Khách hàng:</strong>
                <p className="text-stone-700">{selectedOrder.customerName}</p>
                <p className="text-stone-600">{selectedOrder.customerPhone}</p>
                <p className="text-stone-500">{selectedOrder.customerEmail}</p>
              </div>

              <div className="space-y-1">
                <strong className="text-stone-900 block">Địa chỉ giao hàng:</strong>
                <p className="text-stone-600 leading-relaxed">
                  {selectedOrder.shippingAddress.streetAddress}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}
                </p>
                {selectedOrder.customerNotes && (
                  <p className="text-amber-900 pt-1">
                    <strong>Ghi chú:</strong> {selectedOrder.customerNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Scent Details if any */}
            {selectedOrder.customScentRequests.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Yêu cầu mùi hương riêng cần phối chế:
                </p>
                {selectedOrder.customScentRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-white rounded-lg border border-amber-200 space-y-1">
                    <p className="font-semibold text-stone-900">{req.productName} ({req.candleDescription})</p>
                    <p className="text-stone-700 italic">"{req.customScentText}"</p>
                    <p className="text-stone-500 text-[11px]">Trạng thái yêu cầu: {getCustomScentStatusText(req.status)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Items Breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-stone-900">Chi tiết sản phẩm đã đặt:</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl p-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-stone-900">{item.product.name}</p>
                      <p className="text-stone-500 text-[11px]">
                        {item.selectedSize ? `Dung tích: ${item.selectedSize} · ` : ''}
                        {item.selectedScent || 'Combo'}
                      </p>
                      {item.comboSelections && (
                        <div className="text-[11px] text-stone-600 pl-2 border-l-2 border-stone-200">
                          {item.comboSelections.map((cand) => (
                            <p key={cand.candleNumber}>
                              Nến {cand.candleNumber}: {cand.isCustom ? `Tự phối (${cand.customScentText})` : cand.scent}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-stone-500 tabular-nums">{item.quantity} × {formatVND(item.unitPrice)}</p>
                      <p className="font-semibold text-stone-900 tabular-nums">{formatVND(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline text-sm">
              <span className="font-bold text-stone-900">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-amber-950 tabular-nums">
                {formatVND(selectedOrder.total)}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
