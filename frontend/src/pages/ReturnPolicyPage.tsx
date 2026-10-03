import React from 'react';
import { RotateCcw, ShieldAlert, CheckCircle2, Phone, Mail } from 'lucide-react';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 px-3 py-1 rounded-full">
          <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
          <span>Bảo Vệ Quyền Lợi Khách Hàng</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Chính Sách Đổi Trả & Bảo Hành
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Glowcard cam kết 100% sự hài lòng và sẵn sàng hỗ trợ bạn đổi trả nhanh chóng
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EADBCE] p-6 sm:p-10 shadow-2xs space-y-8 text-stone-700 text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1: Conditions */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            1. Trường Hợp Được Chấp Nhận Đổi Trả
          </h2>
          <div className="space-y-2 text-stone-600">
            <p>Glowcard hỗ trợ 1 đổi 1 hoàn toàn miễn phí (bao gồm cả phí vận chuyển 2 chiều) nếu:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Hũ nến hoặc thiệp sáp bị nứt vỡ trong quá trình vận chuyển.</li>
              <li>Sản phẩm giao không đúng dung tích (30ml / 50ml) hoặc sai mùi hương đã đặt.</li>
              <li>Bấc nến bị lỗi không thắp được hoặc bề mặt sáp bị biến dạng nghiêm trọng.</li>
              <li>Giao thiếu thành phần trong các combo quà tặng.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Time window */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
            2. Thời Gian Áp Dụng
          </h2>
          <p>
            Quý khách vui lòng thông báo cho Glowcard trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng thành công theo dấu bưu tá.
          </p>
          <p className="text-stone-500 text-xs">
            *Lưu ý: Để được hỗ trợ nhanh nhất, quý khách nên quay lại video ngắn lúc mở gói bưu phẩm.
          </p>
        </section>

        {/* Section 3: Contact */}
        <section className="space-y-3 pt-2 border-t border-stone-100">
          <h2 className="font-serif text-xl text-stone-900 font-normal">
            3. Phương Thức Liên Hệ Đổi Trả
          </h2>
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2 text-xs">
            <p className="flex items-center gap-2 font-medium text-stone-900">
              <Phone className="w-4 h-4 text-amber-700" />
              Hotline hỗ trợ đổi trả: <strong>090 123 4567</strong> (09:00 - 20:00)
            </p>
            <p className="flex items-center gap-2 font-medium text-stone-900">
              <Mail className="w-4 h-4 text-amber-700" />
              Email phản hồi: <strong>contact@glowcard.vn</strong>
            </p>
          </div>
        </section>

      </div>

    </div>
  );
};
