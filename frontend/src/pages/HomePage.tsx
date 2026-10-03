import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { ProductArtwork } from '../components/ProductArtwork';
import { Sparkles, Heart, Feather, ArrowRight, ShieldCheck, Flame, Gift } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products } = useProducts();
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5EFEB] to-[#FAF8F5] border-b border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy & Primary Action */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-900 bg-amber-100/70 border border-amber-200/80 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                <span>Nến Thơm & Thiệp Sáp Nghệ Thuật Thủ Công</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-stone-900 font-normal leading-[1.15] text-balance">
                Trao hương thơm, gửi trọn yêu thương
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl font-light">
                Glowcard chế tác những hũ nến đậu nành thuần khiết, thiệp sáp hoa khô lưu hương và các set quà tinh xảo — nơi bạn có thể tự do phối chế mùi hương riêng cho từng xúc cảm.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-medium transition-all shadow-sm group"
                >
                  <span>Khám phá bộ sưu tập</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-stone-300 hover:bg-white text-stone-800 text-sm font-medium transition-all"
                >
                  Câu chuyện Glowcard
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-4 text-xs text-stone-600">
                <div>
                  <strong className="block text-stone-900 font-semibold mb-0.5">100% Tự Nhiên</strong>
                  <span className="text-[11px] text-stone-500">Sáp đậu nành lành tính</span>
                </div>
                <div>
                  <strong className="block text-stone-900 font-semibold mb-0.5">Mùi Hương Riêng</strong>
                  <span className="text-[11px] text-stone-500">Phối chế theo sở thích</span>
                </div>
                <div>
                  <strong className="block text-stone-900 font-semibold mb-0.5">Đóng Gói Quà</strong>
                  <span className="text-[11px] text-stone-500">Tỉ mỉ từng chi tiết</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E4D5C5] aspect-4/3 sm:aspect-16/10">
                <ProductArtwork type="hero" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-2">Danh Mục Tuyển Chọn</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
            Không Gian Hương Thơm Cho Riêng Bạn
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Lựa chọn sản phẩm theo từng nhu cầu thư giãn, trang trí hoặc làm quà tặng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Category 1: Nến thơm */}
          <Link
            to="/products?category=candle"
            className="group relative rounded-2xl bg-white border border-[#EADBCE] overflow-hidden p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#FAF6F0] mb-5 border border-stone-100">
              <ProductArtwork type="candle" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-2xl text-stone-900 group-hover:text-amber-900 transition-colors font-medium">
                  Nến Thơm
                </h3>
                <Flame className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Hũ thủy tinh hổ phách dung tích 30ml và 50ml, bấc cotton không khói, tinh dầu nhập khẩu cao cấp.
              </p>
              <div className="flex items-center text-xs font-semibold text-amber-900">
                <span>Khám phá 6 mùi hương & custom</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Category 2: Thiệp sáp thơm */}
          <Link
            to="/products?category=wax_card"
            className="group relative rounded-2xl bg-white border border-[#EADBCE] overflow-hidden p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#FAF6F0] mb-5 border border-stone-100">
              <ProductArtwork type="wax_card" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-2xl text-stone-900 group-hover:text-amber-900 transition-colors font-medium">
                  Thiệp Sáp Thơm
                </h3>
                <Feather className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Thiệp sáp thơm treo hoa khô tự nhiên, trang trí tủ áo hoặc góc học tập, lưu hương dịu nhẹ bền lâu 2-3 tháng.
              </p>
              <div className="flex items-center text-xs font-semibold text-amber-900">
                <span>Xem bộ sưu tập thiệp hoa</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Category 3: Combo */}
          <Link
            to="/products?category=combo"
            className="group relative rounded-2xl bg-white border border-[#EADBCE] overflow-hidden p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#FAF6F0] mb-5 border border-stone-100">
              <ProductArtwork type="combo" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-2xl text-stone-900 group-hover:text-amber-900 transition-colors font-medium">
                  Combo Quà Tặng
                </h3>
                <Gift className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Set 2 hoặc 4 nến kèm thiệp sáp, cho phép tự do chọn từng mùi hương riêng biệt cho mỗi hũ nến.
              </p>
              <div className="flex items-center text-xs font-semibold text-amber-900">
                <span>Tùy phối từng mùi hương</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-stone-200">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-1">Gợi Ý Nổi Bật</p>
            <h2 className="font-serif text-3xl text-stone-900 font-normal">
              Sản Phẩm Được Yêu Thích Nhất
            </h2>
          </div>
          <Link
            to="/products"
            className="mt-4 sm:mt-0 text-xs font-medium text-amber-900 hover:text-amber-700 flex items-center gap-1"
          >
            Xem tất cả sản phẩm ({products.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Craftsmanship & Custom Scent Feature Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F6EFE7] rounded-3xl p-8 md:p-14 border border-[#E5D7C7] relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-5">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Đặc Quyền Tại Glowcard</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight">
                Tự Do Thiết Kế Mùi Hương Riêng Biệt Cho Bạn
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed font-light">
                Bạn yêu thích một nốt hương ấm của gỗ thông hòa cùng chút ngọt thanh vỏ cam? Hay một mùi hương gợi nhắc ký ức tuổi thơ? Tại Glowcard, dịch vụ phối hương thủ công theo yêu cầu hoàn toàn không phụ thu thêm phí.
              </p>
              
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-4 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Quy trình chuẩn bị nến tuỳ chỉnh:
                </p>
                <p className="text-stone-600">
                  Thời gian chuẩn bị và giao hàng sẽ cần thêm từ 2 - 3 ngày làm việc để nghệ nhân điều chế và ủ sáp đạt độ tỏa hương hoàn hảo.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/products/nen-thom-glowcard-classic"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
                >
                  Thử phối mùi hương ngay
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-1">Sáp Đậu Nành Thuần Chay</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Đốt cháy êm đềm, không khói muội đen, an toàn cho cả phụ nữ mang thai và trẻ nhỏ.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-1">Rót Tay Từng Mẻ Nhỏ</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Mỗi sản phẩm đều được kiểm định chất lượng bấc nến và bề mặt sáp láng mịn trước khi đóng hộp.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-1">Đóng Gói Quà Nghệ Thuật</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Hộp quà kraft mộc mạc kèm ruy băng lụa và thiệp viết tay theo lời chúc bạn yêu cầu.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="py-14 px-6 rounded-3xl bg-stone-900 text-stone-100 space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-balance">
            Bắt đầu tìm kiếm mùi hương dành riêng cho bạn
          </h2>
          <p className="text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
            Dù là góc làm việc yên tĩnh hay một món quà bất ngờ gửi trao người thương, Glowcard luôn đồng hành cùng bạn.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-sm transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
