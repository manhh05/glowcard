import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('DuongMinhAnh9506@gmail.com');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginCustomer, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setIsSubmitting(true);
    await loginCustomer(email, password);
    setIsSubmitting(false);
    navigate(redirectPath);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    await loginWithGoogle();
    setIsSubmitting(false);
    navigate(redirectPath);
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
            Đăng Nhập Khách Hàng
          </h1>
          <p className="text-xs text-stone-500">
            Đăng nhập để lưu giỏ hàng, đặt hàng và theo dõi tiến trình
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* 1. Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-all shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng nhập nhanh bằng Google</span>
        </button>

        {/* Separator */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-stone-400 absolute">
            hoặc email & mật khẩu
          </span>
        </div>

        {/* 2. Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-600 mb-1 font-medium">Địa chỉ Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@email.com"
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-stone-600 font-medium">Mật khẩu:</label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-amber-900/80 hover:text-amber-950 hover:underline transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 border-t border-stone-100 text-center space-y-2 text-xs">
          <p className="text-stone-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-amber-900 hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          <p className="text-[11px] text-stone-400 pt-2">
            Bạn là nhân viên quản trị?{' '}
            <Link to="/admin/login" className="text-stone-600 hover:text-stone-900 underline">
              Đăng nhập Admin
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
