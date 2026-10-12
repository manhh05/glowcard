import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../api/errors';
import { UserPlus } from 'lucide-react';

export const CustomerRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Vui lòng điền đầy đủ các trường thông tin.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Mật khẩu cần tối thiểu 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await registerCustomer(name.trim(), email.trim(), phone.trim(), password);
      navigate('/profile');
    } catch (err) {
      setErrorMsg(authErrorMessage(err, 'login'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl border border-[#EADBCE] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <Link to="/" className="font-serif text-3xl font-medium tracking-tight text-stone-900 block">
            Glowcard
          </Link>
          <h1 className="font-serif text-2xl text-stone-800 font-normal">
            Đăng Ký Tài Khoản
          </h1>
          <p className="text-xs text-stone-500">
            Tạo tài khoản để nhận ưu đãi và mua sắm tiện lợi
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-stone-600 mb-1 font-medium">Họ và tên của bạn:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-medium">Địa chỉ Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@vidu.com"
              autoComplete="email"
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-medium">Số điện thoại liên hệ:</label>
            <input
              type="tel"
              required
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              autoComplete="tel"
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-medium">Mật khẩu:</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-medium">Xác nhận mật khẩu:</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
              autoComplete="new-password"
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-stone-50 font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-amber-900 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};