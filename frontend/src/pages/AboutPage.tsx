import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Feather, Flame, ArrowRight } from 'lucide-react';
import { ProductArtwork } from '../components/ProductArtwork';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-800" />
          <span>Về Thương Hiệu Glowcard</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal leading-tight text-balance">
          Trao Gửi Hương Thơm & Xúc Cảm Thủ Công
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
          Glowcard ra đời từ niềm đam mê với những liệu pháp mùi hương chữa lành và ước mong tạo nên những món quà đong đầy cảm xúc yêu thương.
        </p>
      </div>

      {/* Story & Philosophy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="rounded-3xl overflow-hidden border border-[#EADBCE] bg-[#FAF6F0] aspect-4/3 shadow-sm">
          <ProductArtwork type="hero" />
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">
            Hương Thơm Thuần Khiết Từ Thiên Nhiên
          </h2>
          <p>
            Chúng tôi tin rằng, một ngọn nến thơm không đơn thuần là nguồn sáng hay mùi hương trong phòng, mà còn là người bạn đồng hành xoa dịu những nhọc nhằn, khơi dậy nguồn cảm hứng sáng tạo và vỗ về những giấc ngủ bình yên.
          </p>
          <p>
            Tại Glowcard, mọi hũ nến đều được chế tác từ <strong>100% sáp đậu nành tự nhiên</strong> kết hợp cùng bấc cotton hữu cơ không khói chì. Từng nốt hương hoa nhài, đào ngọt, hoa dành dành hay gỗ mun trầm lắng đều được chắt lọc từ nguồn tinh dầu nhập khẩu an toàn tuyệt đối.
          </p>
          <p>
            Đặc biệt, dòng <strong>thiệp sáp thơm nghệ thuật</strong> đính hoa khô thủ công và dịch vụ <strong>phối hương theo yêu cầu</strong> là nét độc bản mà Glowcard luôn tự hào mang đến cho quý khách hàng.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EADBCE] space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-stone-900 font-normal">Rót Tay Tỉ Mỉ</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Mỗi mẻ nến được kiểm soát nhiệt độ rót nghiêm ngặt, bề mặt sáp mịn màng và thời gian ủ sáp đúng chuẩn để hương thơm tỏa đều nhất.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EADBCE] space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Feather className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-stone-900 font-normal">Thiệp Sáp Nghệ Thuật</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Những cánh hoa khô tự nhiên được nghệ nhân sắp đặt khéo léo vào từng tấm sáp thơm, như một tác phẩm thu nhỏ gửi gắm trong tủ đồ của bạn.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EADBCE] space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-stone-900 font-normal">Mùi Hương Độc Bản</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Chúng tôi luôn sẵn lòng lắng nghe câu chuyện của bạn để phối chế nên một công thức hương thơm dành riêng cho bạn hoặc người thương.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-[#F5EFEB] rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-[#EADBCE]">
        <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">
          Hãy Để Glowcard Đồng Hành Cùng Không Gian Sống Của Bạn
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Chọn ngay cho mình một hũ nến ấm áp hoặc set quà trao gửi người trân quý.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
          >
            Khám phá các sản phẩm Glowcard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
};
