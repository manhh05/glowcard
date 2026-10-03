export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateVi = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const getOrderStatusText = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PREPARING':
      return 'Đang chuẩn bị';
    case 'SHIPPED':
      return 'Đang giao';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return status;
  }
};

export const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'UNPAID':
      return 'Chưa thanh toán';
    default:
      return status;
  }
};

export const getCustomScentStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'ACCEPTED':
      return 'Đã chấp nhận';
    case 'REJECTED':
      return 'Từ chối';
    default:
      return status;
  }
};
