import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 px-3 py-1 rounded-full">
          <Truck className="w-3.5 h-3.5 text-amber-800" />
          <span>Vận Chuyển Toàn Quốc</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Chính Sách Giao Hàng Glowcard
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Cam kết đóng gói an toàn và vận chuyển tận nơi trên mọi tỉnh thành Việt Nam
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EADBCE] p-6 sm:p-10 shadow-2xs space-y-8 text-stone-700 text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-800" />
            1. Thời Gian Xử Lý & Giao Hàng
          </h2>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <p>
              • <strong>Đơn hàng tiêu chuẩn:</strong> Đóng gói và bàn giao bưu tá trong vòng <strong>24 - 48 giờ</strong> kể từ khi xác nhận đơn.
            </p>
            <p className="text-amber-950 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
              • <strong>Đơn hàng có nến mùi hương tuỳ chỉnh:</strong> Cần thêm từ <strong>2 - 3 ngày làm việc</strong> để nghệ nhân Glowcard phối chế tỷ lệ tinh dầu và ủ sáp đạt độ tỏa hương tiêu chuẩn nhất trước khi xuất xưởng.
            </p>
            <p>
              • <strong>Thời gian vận chuyển đến tay bạn:</strong>
              <br />- Khu vực TP. Hồ Chí Minh & Hà Nội: 1 - 2 ngày làm việc.
              <br />- Các tỉnh thành khác: 2 - 4 ngày làm việc.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-800" />
            2. Cước Phí Vận Chuyển
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>Cước phí đồng giá toàn quốc: <strong>30.000₫ / đơn hàng</strong>.</li>
            <li>Miễn phí vận chuyển toàn quốc cho các đơn hàng có giá trị từ <strong>600.000₫</strong> trở lên.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-800" />
            3. Tiêu Chuẩn Đóng Gói Thủ Công
          </h2>
          <p>
            Mỗi hũ nến và thiệp sáp đều được Glowcard bọc lớp giấy chống sốc tổ ong thân thiện môi trường, chèn xốp định hình bên trong hộp carton cứng cáp và dán niêm phong cẩn thận.
          </p>
          <p>
            Quý khách được quyền đồng kiểm cùng nhân viên giao hàng khi nhận kiện hàng COD.
          </p>
        </section>

      </div>

    </div>
  );
};
