import React, { useState } from 'react';
import { ApiError } from '../api/client';
import { authErrorMessage } from '../api/errors';
import { cancelOrder } from '../api/orders';
import { AlertCircle, Ban } from 'lucide-react';

interface CancelOrderButtonProps {
  orderCode: string;
  status: string;
  paymentStatus?: string | null;
  /** Gọi sau khi hủy thành công (hoặc khi trạng thái đơn vừa đổi) để trang tải lại dữ liệu */
  onCancelled: () => void;
  /** Dùng trong danh sách đơn: không hiện các dòng giải thích khi không hủy được */
  compact?: boolean;
}

export const CancelOrderButton: React.FC<CancelOrderButtonProps> = ({
  orderCode,
  status,
  paymentStatus,
  onCancelled,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Chỉ hủy được khi đơn còn chờ xác nhận
  if (status !== 'PENDING') {
    if (compact || (status !== 'CONFIRMED' && status !== 'PREPARING')) return null;
    return (
      <p className="text-[11px] text-stone-500 leading-relaxed">
        Đơn hàng đã được Glowcard xác nhận nên không thể tự hủy trên web. Nếu cần hủy, vui lòng
        liên hệ Glowcard.
      </p>
    );
  }

  if (paymentStatus === 'PAID') {
    return compact ? null : (
      <p className="text-[11px] text-stone-500 leading-relaxed">
        Đơn hàng đã thanh toán nên không thể tự hủy trên web. Vui lòng liên hệ Glowcard để được hỗ
        trợ hoàn tiền.
      </p>
    );
  }

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await cancelOrder(orderCode, reason.trim() || null);
      setOpen(false);
      onCancelled();
    } catch (e) {
      setError(authErrorMessage(e));
      // Đơn vừa đổi trạng thái (ví dụ shop vừa xác nhận): tải lại để hiện đúng trạng thái mới
      if (e instanceof ApiError && e.status === 409) onCancelled();
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl border border-red-200 text-red-700 bg-red-50 text-xs font-medium hover:bg-red-100 transition-colors"
      >
        <Ban className="w-3.5 h-3.5" />
        Hủy đơn hàng
      </button>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 text-xs">
      <p className="text-red-900 leading-relaxed">
        Hủy đơn <strong className="font-mono">#{orderCode}</strong>? Sản phẩm trong đơn sẽ được trả
        lại kho và không thể khôi phục. Bạn chỉ tự hủy được khi Glowcard chưa xác nhận đơn.
      </p>

      <div>
        <label className="block text-stone-700 font-medium mb-1">Lý do hủy (không bắt buộc):</label>
        <textarea
          rows={2}
          maxLength={300}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: đặt nhầm mùi hương, đổi ý..."
          className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
        />
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-white border border-red-200 text-red-700 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={confirm}
          className="py-2 px-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {busy ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setError('');
          }}
          className="py-2 px-3 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50"
        >
          Giữ lại đơn
        </button>
      </div>
    </div>
  );
};
