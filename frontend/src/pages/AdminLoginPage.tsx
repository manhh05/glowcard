import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Lock, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('glowcard123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const success = await loginAdmin(username, password);
    setIsSubmitting(false);

    if (success) {
      navigate('/admin');
    } else {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu quản trị viên không chính xác.');
    }
  };

  const handleFillCredentials = () => {
    setUsername('admin');
    setPassword('glowcard123');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-stone-300 p-8 shadow-md space-y-6">
        
        {/* Header with Admin Badge */}
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

        {/* Credentials Helper Box */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-800 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              Tài khoản quản trị dùng chung:
            </span>
            <button
              type="button"
              onClick={handleFillCredentials}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline"
            >
              Điền nhanh
            </button>
          </div>
          <p className="text-[11px] font-mono text-stone-700">
            Tài khoản: <strong>admin</strong> · Mật khẩu: <strong>glowcard123</strong>
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
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập hệ thống quản trị</span>
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
