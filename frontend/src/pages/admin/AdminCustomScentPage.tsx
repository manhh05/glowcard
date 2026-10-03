import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { CustomScentStatus } from '../../types';
import { getCustomScentStatusText } from '../../utils/formatters';
import { Sparkles, Check, X, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export const AdminCustomScentPage: React.FC = () => {
  const { getAllCustomScentRequests, updateCustomScentStatus } = useOrders();
  const allRequests = getAllCustomScentRequests();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  // Dedicated in-UI modal state for declining an order (replaces window.prompt which is blocked in iframes)
  const [decliningTarget, setDecliningTarget] = useState<{
    orderId: string;
    requestId: string;
    orderCode: string;
    customerName: string;
    productName: string;
    scentText: string;
    existingNote: string;
  } | null>(null);
  const [declineReasonInput, setDeclineReasonInput] = useState<string>('');

  const filtered = allRequests.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.request.status === filterStatus;
  });

  const pendingCount = allRequests.filter((r) => r.request.status === 'PENDING').length;
  const acceptedCount = allRequests.filter((r) => r.request.status === 'ACCEPTED').length;
  const rejectedCount = allRequests.filter((r) => r.request.status === 'REJECTED').length;

  const handleStatusChange = (
    orderId: string,
    requestId: string,
    newStatus: CustomScentStatus,
    adminNote?: string
  ) => {
    updateCustomScentStatus(orderId, requestId, newStatus, adminNote);
  };

  const handleSaveNote = (orderId: string, requestId: string) => {
    updateCustomScentStatus(orderId, requestId, undefined, noteText);
    setEditingNoteId(null);
  };

  const openDeclineModal = (item: {
    orderId: string;
    orderCode: string;
    customerName: string;
    request: { id: string; productName: string; customScentText: string; adminNote?: string };
  }) => {
    setDecliningTarget({
      orderId: item.orderId,
      requestId: item.request.id,
      orderCode: item.orderCode,
      customerName: item.customerName,
      productName: item.request.productName,
      scentText: item.request.customScentText,
      existingNote: item.request.adminNote || 'Rất tiếc hiện tại xưởng chưa có sẵn tinh dầu này để phối chế.',
    });
    setDeclineReasonInput(item.request.adminNote || 'Rất tiếc hiện tại xưởng chưa có sẵn tinh dầu này để phối chế.');
  };

  const confirmDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decliningTarget) return;

    handleStatusChange(
      decliningTarget.orderId,
      decliningTarget.requestId,
      'REJECTED',
      declineReasonInput.trim() || 'Rất tiếc hiện tại xưởng chưa có sẵn tinh dầu này.'
    );

    setDecliningTarget(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-800" />
          <span>Xưởng Phối Chế Thủ Công</span>
        </div>
        <h1 className="font-serif text-3xl text-stone-900 font-normal">
          Yêu Cầu Mùi Hương Tuỳ Chỉnh
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Duyệt và ghi chú công thức điều chế cho các đơn hàng có yêu cầu phối hương riêng từ khách hàng
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3 text-xs">
        {[
          { id: 'all', label: `Tất cả yêu cầu (${allRequests.length})` },
          { id: 'PENDING', label: `Chờ xử lý (${pendingCount})` },
          { id: 'ACCEPTED', label: `Đã chấp nhận (${acceptedCount})` },
          { id: 'REJECTED', label: `Từ chối (${rejectedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === tab.id
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl text-stone-800 font-normal">
            Không có yêu cầu mùi hương nào ở mục này
          </h3>
          <p className="text-xs text-stone-500">
            Khi khách hàng đặt nến hoặc combo có yêu cầu phối mùi hương riêng, thông tin sẽ được tập hợp tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(({ orderId, orderCode, customerName, customerPhone, request }) => {
            const isPending = request.status === 'PENDING';
            const isAccepted = request.status === 'ACCEPTED';
            const isRejected = request.status === 'REJECTED';

            return (
              <div
                key={request.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">#{orderCode}</span>
                    <span className="text-stone-400">·</span>
                    <span className="font-semibold text-stone-800">{customerName}</span>
                    <span className="text-stone-500">({customerPhone})</span>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold ${
                      isAccepted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isRejected
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {getCustomScentStatusText(request.status)}
                  </span>
                </div>

                {/* Content: Product, Candle part, Scent Description */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-stone-400 block mb-0.5">Sản phẩm & Vị trí nến:</span>
                    <p className="font-semibold text-stone-900">
                      {request.productName} — <span className="text-amber-900">{request.candleDescription}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                    <span className="font-semibold text-stone-800 block">
                      Mô tả mùi hương khách hàng mong muốn:
                    </span>
                    <p className="text-stone-800 text-sm leading-relaxed italic">
                      "{request.customScentText}"
                    </p>
                  </div>

                  {/* Internal Admin Note */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 font-medium flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ghi chú nội bộ / Lý do từ chối:
                      </span>
                      {editingNoteId !== request.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(request.id);
                            setNoteText(request.adminNote || '');
                          }}
                          className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold"
                        >
                          {request.adminNote ? 'Sửa ghi chú' : '+ Thêm ghi chú'}
                        </button>
                      )}
                    </div>

                    {editingNoteId === request.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Ví dụ: Đã duyệt tỷ lệ phối 40% gỗ thông, 35% vỏ quýt, 25% vani..."
                          className="flex-1 p-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(orderId, request.id)}
                          className="py-1.5 px-3 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="py-1.5 px-2.5 rounded-lg border border-stone-300 text-stone-600 text-xs hover:bg-stone-50"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      request.adminNote && (
                        <p className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-[11px] leading-relaxed">
                          {request.adminNote}
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Actions: Chờ xử lý / Đã chấp nhận / Từ chối */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(orderId, request.id, 'PENDING')}
                    className={`py-1.5 px-3 rounded-lg font-medium border transition-colors ${
                      isPending ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Chờ xử lý
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(orderId, request.id, 'ACCEPTED', request.adminNote || 'Đã chấp nhận yêu cầu và xếp lịch điều chế.')}
                    className={`py-1.5 px-3 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                      isAccepted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Chấp nhận yêu cầu
                  </button>

                  <button
                    type="button"
                    onClick={() => openDeclineModal({ orderId, orderCode, customerName, request })}
                    className={`py-1.5 px-3 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                      isRejected ? 'bg-rose-600 border-rose-600 text-white' : 'border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Từ chối
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-UI Decline Modal (No window.prompt, 100% reliable inside iframes) */}
      {decliningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Từ Chối Yêu Cầu Mùi Hương
              </h3>
              <button
                type="button"
                onClick={() => setDecliningTarget(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p>
                Đơn hàng: <strong className="text-stone-900 font-mono">#{decliningTarget.orderCode}</strong> · Khách hàng: <strong className="text-stone-900">{decliningTarget.customerName}</strong>
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block mb-0.5">Mùi hương khách yêu cầu:</span>
                <p className="italic text-stone-800 font-medium">"{decliningTarget.scentText}"</p>
              </div>
            </div>

            <form onSubmit={confirmDecline} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Lý do từ chối (sẽ lưu vào ghi chú nội bộ):
                </label>
                <textarea
                  rows={3}
                  required
                  value={declineReasonInput}
                  onChange={(e) => setDeclineReasonInput(e.target.value)}
                  placeholder="Nhập lý do xưởng không thể phối chế mùi hương này..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-rose-600 text-stone-900"
                />
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecliningTarget(null)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
