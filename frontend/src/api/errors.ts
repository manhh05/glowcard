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
      return 'Bạn thao tác quá nhanh, vui lòng thử lại sau.';
    default:
      return e.message || 'Có lỗi xảy ra, vui lòng thử lại.';
  }
}