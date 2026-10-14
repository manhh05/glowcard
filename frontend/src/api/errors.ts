import { ApiError } from './client';

/** context 'login': 401 nghĩa là sai thông tin đăng nhập. 'action': 401 nghĩa là hết phiên. */
export function authErrorMessage(
  e: unknown,
  context: 'login' | 'action' = 'action',
): string {
  if (!(e instanceof ApiError)) return 'Có lỗi xảy ra, vui lòng thử lại.';
  switch (e.status) {
    case 0:
      return 'Không kết nối được máy chủ. Vui lòng thử lại.';
    case 401:
      return context === 'login'
        ? 'Email hoặc mật khẩu không chính xác.'
        : 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
    case 404:
      return 'Không tìm thấy dữ liệu.';
    case 409:
      return e.message === 'Email already registered'
        ? 'Email này đã được đăng ký.'
        : e.message;
    case 422:
      return 'Thông tin chưa hợp lệ, vui lòng kiểm tra lại.';
    case 429:
      return typeof e.detail === 'string' && e.detail
        ? e.detail
        : 'Bạn thao tác quá nhanh, vui lòng thử lại sau.';
    default:
      return e.message || 'Có lỗi xảy ra, vui lòng thử lại.';
  }
}

export function cartErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const msg = e.message;
    if (e.status === 409) {
      if (msg.startsWith('Out of stock'))
        return 'Sản phẩm này vừa hết hàng, vui lòng chọn mùi khác.';
      if (msg === 'Cart has stock issues')
        return 'Một số sản phẩm trong giỏ đã hết hoặc không đủ số lượng. Vui lòng kiểm tra lại giỏ hàng.';
      return msg;
    }
    if (e.status === 400) {
      return msg === 'Cart is empty' ? 'Giỏ hàng đang trống.' : msg;
    }
    if (e.status === 404) {
      return msg === 'Address not found'
        ? 'Địa chỉ giao hàng không hợp lệ, vui lòng chọn lại.'
        : 'Sản phẩm không còn tồn tại.';
    }
  }
  return authErrorMessage(e);
}

export function adminErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    // Backend admin trả sẵn thông báo tiếng Việt cho lỗi 400 và 409
    if (e.status === 400 || e.status === 409) return e.message;
    if (e.status === 404) {
      return 'Không tìm thấy dữ liệu, có thể đã bị thay đổi. Vui lòng tải lại trang.';
    }
  }
  return authErrorMessage(e);
}