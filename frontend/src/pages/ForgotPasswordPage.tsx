import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, MessageCircle } from 'lucide-react';

// Điền thông tin liên hệ của shop vào đây, mỗi dòng một kênh. Ví dụ:
//   'Zalo: 090 123 4567',
//   'Instagram: @glowcard.vn',
// Để trống thì trang sẽ hiện câu hướng dẫn chung.
const SHOP_CONTACT_LINES: string[] = [];

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-[#EADBCE] p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <Link
            to="/"
            className="font-serif text-3xl font-medium tracking-tight text-stone-900 block"
          >
            Glowcard
          </Link>
          <h1 className="font-serif text-2xl text-stone-800 font-normal">Khôi Phục Mật Khẩu</h1>
          <p className="text-xs text-stone-500">
            Glowcard hỗ trợ đặt lại mật khẩu trực tiếp qua tin nhắn
          </p>
        </div>

        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
          <p>
            Hiện tại hệ thống chưa gửi được email đặt lại mật khẩu tự động. Để lấy lại quyền truy
            cập tài khoản, vui lòng nhắn tin cho Glowcard và cung cấp{' '}
            <strong className="text-stone-900">email bạn đã dùng để đăng ký</strong>.
          </p>
          <p>Chúng tôi sẽ đặt mật khẩu mới cho bạn và gửi lại qua tin nhắn.</p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900">
            <MessageCircle className="w-4 h-4 text-stone-600" />
            <span>Liên hệ Glowcard</span>
          </div>
          {SHOP_CONTACT_LINES.length > 0 ? (
            <ul className="space-y-1 text-stone-700">
              {SHOP_CONTACT_LINES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-stone-600">
              Hãy nhắn tin cho Glowcard qua kênh bạn đã biết đến shop (trang mạng xã hội của shop).
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
