import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowRight, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    // Mock API processing delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedEmail(email);
    }, 600);
  };

  const handleReset = () => {
    setSubmittedEmail(null);
    setEmail('');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-[#EADBCE] p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="font-serif text-3xl font-medium tracking-tight text-stone-900 block">
            Glowcard
          </Link>
          <h1 className="font-serif text-2xl text-stone-800 font-normal">
            {submittedEmail ? 'Kiểm Tra Hộp Thư Của Bạn' : 'Khôi Phục Mật Khẩu'}
          </h1>
          <p className="text-xs text-stone-500">
            {submittedEmail 
              ? 'Hướng dẫn khôi phục mật khẩu đã được gửi thành công'
              : 'Nhập email đã đăng ký tài khoản Glowcard để nhận liên kết đặt lại mật khẩu'
            }
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {submittedEmail ? (
          /* Mock Success Confirmation State */
          <div className="space-y-6 py-2 text-center animate-in fade-in duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p>
                Chúng tôi đã gửi email chứa hướng dẫn đặt lại mật khẩu đến:
              </p>
              <p className="font-semibold text-stone-900 text-sm bg-stone-50 py-2 px-3 rounded-lg border border-stone-200 break-all">
                {submittedEmail}
              </p>
              <p className="text-[11px] text-stone-500 pt-2 leading-relaxed">
                Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam/Quảng cáo). Đường dẫn bảo mật sẽ có hiệu lực trong 15 phút.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Quay lại trang Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
              >
                Nhập lại với email khác
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-600 mb-1 font-medium">Địa chỉ Email đăng ký:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenban@email.com"
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi liên kết khôi phục'}</span>
            </button>
          </form>
        )}

        {/* Footer link back to login */}
        {!submittedEmail && (
          <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-500">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
