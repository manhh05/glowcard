import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, X, Lock } from 'lucide-react';

export const LoginRequiredModal: React.FC = () => {
  const { showLoginPromptModal, loginPromptMessage, closeLoginPromptModal } = useAuth();
  const navigate = useNavigate();

  if (!showLoginPromptModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FFFDF9] rounded-2xl shadow-xl border border-stone-200 p-6 md:p-8 text-center"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={closeLoginPromptModal}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Đóng hộp thoại"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
          <Lock className="w-6 h-6 stroke-[1.75]" />
        </div>

        <h3 className="font-serif text-2xl text-stone-900 mb-2 font-normal">
          Yêu Cầu Đăng Nhập
        </h3>
        
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          {loginPromptMessage}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              closeLoginPromptModal();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium hover:bg-stone-800 active:scale-[0.99] transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập tài khoản
          </button>

          <button
            onClick={() => {
              closeLoginPromptModal();
              navigate('/register');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl border border-stone-300 text-stone-800 text-sm font-medium hover:bg-stone-50 active:scale-[0.99] transition-all"
          >
            <UserPlus className="w-4 h-4 text-stone-600" />
            Đăng ký tài khoản mới
          </button>

          <button
            onClick={closeLoginPromptModal}
            className="text-xs text-stone-500 hover:text-stone-800 pt-2 transition-colors"
          >
            Tiếp tục duyệt sản phẩm với tư cách khách
          </button>
        </div>
      </div>
    </div>
  );
};
