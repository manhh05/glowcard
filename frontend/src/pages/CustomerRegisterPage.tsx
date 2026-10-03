import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ArrowRight } from 'lucide-react';

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
    if (!name || !email || !phone || !password) {
      setErrorMsg('Vui lòng điền đầy đủ các trường thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsSubmitting(true);
    await registerCustomer(name, email, phone, password);
    setIsSubmitting(false);
    navigate('/profile');
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
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-medium">Số điện thoại liên hệ:</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-medium">Mật khẩu:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
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
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-stone-50 focus:bg-white text-stone-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng ký tài khoản</span>
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
