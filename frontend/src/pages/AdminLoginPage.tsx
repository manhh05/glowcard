import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { authErrorMessage } from '../api/errors';
import { ShieldCheck, LogIn } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await loginAdmin(username.trim(), password);
      navigate('/admin');
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError && err.status === 401
          ? 'Tên đăng nhập hoặc mật khẩu quản trị viên không chính xác.'
          : authErrorMessage(err)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-stone-300 p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
            <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h1 className="font-serif text-2xl text-stone-900 font-normal">
            Cổng Quản Trị Nội Bộ
          </h1>
          <p className="text-xs text-stone-500">
            Dành riêng cho ban quản lý cửa hàng Glowcard
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-600 mb-1 font-medium">Tên đăng nhập quản trị:</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-medium">Mật khẩu bảo mật:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-stone-50 font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống quản trị'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-500">
          <Link to="/" className="text-stone-600 hover:text-stone-900">
            ← Quay lại trang chủ khách hàng
          </Link>
        </div>
      </div>
    </div>
  );
};