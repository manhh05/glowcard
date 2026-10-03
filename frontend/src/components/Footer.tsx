import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#242120] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Introduction */}
          <div className="md:col-span-1 space-y-4">
            <span className="font-serif text-2xl text-stone-100 font-medium tracking-tight block">
              Glowcard
            </span>
            <p className="text-xs leading-relaxed text-stone-400">
              Glowcard mang đến các dòng nến thơm từ sáp đậu nành tự nhiên, thiệp sáp thơm nghệ thuật và các set quà tinh tế phối chế thủ công, gửi gắm hương thơm và tình cảm vẹn nguyên.
            </p>
            <div className="flex items-center gap-3 pt-2 text-stone-400">
              <span className="p-2 rounded-full bg-stone-800 hover:text-white transition-colors cursor-pointer" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-full bg-stone-800 hover:text-white transition-colors cursor-pointer" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base text-stone-100 font-normal">Sản Phẩm</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/products?category=candle" className="hover:text-stone-100 transition-colors">
                  Nến thơm thủ công (30ml / 50ml)
                </Link>
              </li>
              <li>
                <Link to="/products?category=wax_card" className="hover:text-stone-100 transition-colors">
                  Thiệp sáp thơm nghệ thuật
                </Link>
              </li>
              <li>
                <Link to="/products?category=combo" className="hover:text-stone-100 transition-colors">
                  Combo quà tặng tự chọn mùi
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-stone-100 transition-colors">
                  Mùi hương tuỳ chỉnh theo yêu cầu
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Assistance */}
          <div className="space-y-3">
            <h4 className="font-serif text-base text-stone-100 font-normal">Chính Sách & Hỗ Trợ</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/about" className="hover:text-stone-100 transition-colors">
                  Về Glowcard
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-stone-100 transition-colors">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-stone-100 transition-colors">
                  Chính sách đổi trả & bảo hành
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-stone-100 transition-colors text-stone-500">
                  Cổng quản trị nội bộ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Placeholder */}
          <div className="space-y-3">
            <h4 className="font-serif text-base text-stone-100 font-normal">Thông Tin Liên Hệ</h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>[Thông tin liên hệ: Xưởng chế tác Glowcard, TP. Hồ Chí Minh]</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Hotline: 090 123 4567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Email: contact@glowcard.vn</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                Giờ làm việc: 09:00 - 20:00 (Thứ 2 - Chủ Nhật)
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© 2026 Glowcard. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span>Thanh toán bảo mật: PayOS · COD (Tiền mặt)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
