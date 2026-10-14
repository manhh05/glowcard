import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useCatalog';
import { listCustomScentRequests, reviewCustomScent } from '../../api/admin';
import { adminErrorMessage } from '../../api/errors';
import type { AdminCustomScentListItem } from '../../api/types';
import {
  getCustomScentStatusText,
  getOrderStatusText,
  formatDateVi,
} from '../../utils/formatters';
import { Sparkles, Check, X, MessageSquare, AlertCircle } from 'lucide-react';

type Item = AdminCustomScentListItem;
type Decision = 'ACCEPTED' | 'REJECTED';

const DEFAULT_ACCEPT_NOTE = 'Đã chấp nhận yêu cầu và xếp lịch điều chế.';

export const AdminCustomScentPage: React.FC = () => {
  const [version, setVersion] = useState(0);
  // Lấy tối đa 200 yêu cầu gần nhất, lọc theo tab ngay trên trình duyệt
  const { data, loading, error, reload } = useAsync(
    () => listCustomScentRequests({ limit: 200 }),
    [version]
  );
  const all = data ?? [];

  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Sửa ghi chú cho yêu cầu đã duyệt
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  // Hộp thoại chấp nhận / từ chối
  const [decision, setDecision] = useState<{ item: Item; status: Decision } | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const pendingCount = all.filter((r) => r.status === 'PENDING').length;
  const acceptedCount = all.filter((r) => r.status === 'ACCEPTED').length;
  const rejectedCount = all.filter((r) => r.status === 'REJECTED').length;

  const filtered = all.filter((r) => filterStatus === 'all' || r.status === filterStatus);

  const submit = async (
    item: Item,
    status: Decision,
    note: string,
    onDone: () => void
  ) => {
    setBusy(true);
    setActionError('');
    try {
      await reviewCustomScent(item.id, { status, internal_note: note.trim() || null });
      onDone();
      setVersion((v) => v + 1);
    } catch (e) {
      setActionError(adminErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openDecision = (item: Item, status: Decision) => {
    setActionError('');
    setDecision({ item, status });
    setDecisionNote(
      item.internal_note ?? (status === 'ACCEPTED' ? DEFAULT_ACCEPT_NOTE : '')
    );
  };

  const confirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return;
    void submit(decision.item, decision.status, decisionNote, () => setDecision(null));
  };

  const saveNote = (item: Item) => {
    if (item.status === 'PENDING') return; // chưa duyệt thì ghi chú nằm trong hộp thoại duyệt
    void submit(item, item.status as Decision, noteText, () => setEditingNoteId(null));
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
          Duyệt và ghi chú công thức điều chế cho các đơn hàng có yêu cầu phối hương riêng từ khách
          hàng. Kết quả duyệt không tự đổi trạng thái đơn, bạn vẫn có thể liên hệ khách qua điện
          thoại hoặc tin nhắn.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3 text-xs">
        {[
          { id: 'all', label: `Tất cả yêu cầu (${all.length})` },
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

      {actionError && !decision && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {!data && loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-500">
          Đang tải yêu cầu...
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <p className="text-xs text-red-600">{error.message}</p>
          <button
            onClick={reload}
            className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
          >
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl text-stone-800 font-normal">
            Không có yêu cầu mùi hương nào ở mục này
          </h3>
          <p className="text-xs text-stone-500">
            Khi khách hàng đặt nến hoặc combo có yêu cầu phối mùi hương riêng, thông tin sẽ được tập
            hợp tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((req) => {
            const isPending = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/admin/orders?q=${req.order_code}`}
                      className="font-mono font-bold text-stone-900 hover:underline"
                    >
                      #{req.order_code}
                    </Link>
                    <span className="text-stone-400">·</span>
                    <span className="font-semibold text-stone-800">{req.recipient_name}</span>
                    <span className="text-stone-500">({req.phone})</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">{formatDateVi(req.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500">
                      Đơn: {getOrderStatusText(req.order_status)}
                    </span>
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold ${
                        isAccepted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isRejected
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {getCustomScentStatusText(req.status)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-stone-400 block mb-0.5">Sản phẩm & vị trí nến:</span>
                    <p className="font-semibold text-stone-900">{req.description}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                    <span className="font-semibold text-stone-800 block">
                      Mô tả mùi hương khách hàng mong muốn:
                    </span>
                    <p className="text-stone-800 text-sm leading-relaxed italic">
                      "{req.requested_text}"
                    </p>
                  </div>

                  {/* Internal note */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 font-medium flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ghi chú nội bộ / Lý do từ chối:
                      </span>
                      {!isPending && editingNoteId !== req.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('');
                            setEditingNoteId(req.id);
                            setNoteText(req.internal_note ?? '');
                          }}
                          className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold"
                        >
                          {req.internal_note ? 'Sửa ghi chú' : '+ Thêm ghi chú'}
                        </button>
                      )}
                    </div>

                    {editingNoteId === req.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={500}
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Ví dụ: Đã duyệt tỷ lệ phối 40% gỗ thông, 35% vỏ quýt, 25% vani..."
                          className="flex-1 p-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500 bg-white"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => saveNote(req)}
                          className="py-1.5 px-3 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 disabled:opacity-60"
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
                    ) : req.internal_note ? (
                      <p className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-[11px] leading-relaxed">
                        {req.internal_note}
                      </p>
                    ) : isPending ? (
                      <p className="text-[11px] text-stone-400">
                        Ghi chú được nhập khi chấp nhận hoặc từ chối yêu cầu.
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => openDecision(req, 'ACCEPTED')}
                    className={`py-1.5 px-3 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                      isAccepted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Chấp nhận yêu cầu
                  </button>

                  <button
                    type="button"
                    onClick={() => openDecision(req, 'REJECTED')}
                    className={`py-1.5 px-3 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                      isRejected
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100'
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

      {/* Decision modal */}
      {decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
                {decision.status === 'ACCEPTED' ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                )}
                {decision.status === 'ACCEPTED'
                  ? 'Chấp Nhận Yêu Cầu Mùi Hương'
                  : 'Từ Chối Yêu Cầu Mùi Hương'}
              </h3>
              <button
                type="button"
                onClick={() => setDecision(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p>
                Đơn hàng:{' '}
                <strong className="text-stone-900 font-mono">#{decision.item.order_code}</strong> ·
                Người nhận: <strong className="text-stone-900">{decision.item.recipient_name}</strong>
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block mb-0.5">Mùi hương khách yêu cầu:</span>
                <p className="italic text-stone-800 font-medium">
                  "{decision.item.requested_text}"
                </p>
              </div>
            </div>

            <form onSubmit={confirmDecision} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  {decision.status === 'ACCEPTED'
                    ? 'Ghi chú nội bộ (công thức, lịch điều chế):'
                    : 'Lý do từ chối (lưu vào ghi chú nội bộ):'}
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  required={decision.status === 'REJECTED'}
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder={
                    decision.status === 'ACCEPTED'
                      ? 'Không bắt buộc'
                      : 'Nhập lý do xưởng không thể phối chế mùi hương này...'
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-600 text-stone-900"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Ghi chú này chỉ dành cho nội bộ, khách hàng không nhìn thấy.
                </p>
              </div>

              {actionError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecision(null)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className={`py-2.5 px-5 rounded-xl text-white font-medium shadow-sm flex items-center gap-1.5 disabled:opacity-60 ${
                    decision.status === 'ACCEPTED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {decision.status === 'ACCEPTED' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {busy
                    ? 'Đang lưu...'
                    : decision.status === 'ACCEPTED'
                    ? 'Xác nhận chấp nhận'
                    : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
