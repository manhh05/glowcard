import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductArtwork } from '../components/ProductArtwork';
import { STANDARD_SCENTS, WAX_CARD_SCENT_CONFIG } from '../data/mockData';
import { CandleSize, ComboCandleSelection } from '../types';
import { formatVND } from '../utils/formatters';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Check, 
  AlertCircle, 
  Plus, 
  Minus,
  ShoppingBag,
  ArrowRight,
  Flame,
  Info
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const { addToCart } = useCart();
  const { isAuthenticated, triggerLoginRequirement } = useAuth();

  const product = getProductById(id || '');

  // Selection states
  const [selectedSize, setSelectedSize] = useState<CandleSize>('30ml');
  const [selectedScent, setSelectedScent] = useState<string>(
    product?.type === 'wax_card'
      ? WAX_CARD_SCENT_CONFIG.defaultScent
      : STANDARD_SCENTS[0].nameVi
  );
  const [isCustomScent, setIsCustomScent] = useState<boolean>(false);
  const [customScentText, setCustomScentText] = useState<string>('');

  // Combo specific per-candle selections
  const candleCount = product?.comboConfig?.candleCount || 0;
  const [comboCandleSelections, setComboCandleSelections] = useState<ComboCandleSelection[]>(() => {
    const list: ComboCandleSelection[] = [];
    const count = product?.comboConfig?.candleCount || 2;
    for (let i = 1; i <= count; i++) {
      list.push({
        candleNumber: i,
        scent: STANDARD_SCENTS[(i - 1) % STANDARD_SCENTS.length].nameVi,
        isCustom: false,
        customScentText: '',
      });
    }
    return list;
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [showAddedSuccess, setShowAddedSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-stone-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ.</p>
        <Link
          to="/products"
          className="inline-block py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          Quay lại danh mục sản phẩm
        </Link>
      </div>
    );
  }

  // Calculate dynamic unit price
  let currentUnitPrice = product.price;
  if (product.type === 'candle') {
    currentUnitPrice = selectedSize === '50ml' ? 250000 : 180000;
  }

  const handleComboScentChange = (index: number, scent: string) => {
    setComboCandleSelections((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        scent,
        isCustom: scent === 'CUSTOM',
      };
      return updated;
    });
  };

  const handleComboCustomTextChange = (index: number, text: string) => {
    setComboCandleSelections((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        customScentText: text,
      };
      return updated;
    });
  };

  const handleAddToCart = (isBuyNow: boolean = false) => {
    // 1. Guest Check: Guest users cannot purchase products
    if (!isAuthenticated) {
      triggerLoginRequirement(
        'Vui lòng đăng nhập tài khoản khách hàng để thêm sản phẩm vào giỏ hàng và tiến hành thanh toán.'
      );
      return;
    }

    // 2. Validate custom scent input if selected
    if (product.type === 'candle' && isCustomScent && !customScentText.trim()) {
      setValidationError('Vui lòng nhập mô tả mùi hương bạn mong muốn phối chế.');
      return;
    }

    if (product.type === 'combo') {
      const emptyCustomIndex = comboCandleSelections.findIndex(
        (c) => c.isCustom && (!c.customScentText || !c.customScentText.trim())
      );
      if (emptyCustomIndex > -1) {
        setValidationError(`Vui lòng nhập mô tả mùi hương tuỳ chỉnh cho Nến số ${emptyCustomIndex + 1}.`);
        return;
      }
    }

    setValidationError(null);

    // 3. Add to Cart
    addToCart({
      productId: product.id,
      product,
      selectedSize: product.type === 'candle' ? selectedSize : product.comboConfig?.candleSize,
      selectedScent: product.type !== 'combo' ? (isCustomScent ? 'Mùi hương tuỳ chỉnh' : selectedScent) : undefined,
      isCustomScent: product.type === 'candle' ? isCustomScent : false,
      customScentNote: product.type === 'candle' && isCustomScent ? customScentText : undefined,
      comboSelections: product.type === 'combo' ? comboCandleSelections : undefined,
      quantity,
      unitPrice: currentUnitPrice,
    });

    if (isBuyNow) {
      navigate('/checkout');
    } else {
      setShowAddedSuccess(true);
      setTimeout(() => setShowAddedSuccess(false), 3000);
    }
  };

  // Has any custom scent chosen?
  const hasCustomScentActive =
    (product.type === 'candle' && isCustomScent) ||
    (product.type === 'combo' && comboCandleSelections.some((c) => c.isCustom));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn trang" className="mb-6 flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-800">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-stone-800">Sản phẩm</Link>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Sticky Gallery (Left) + Contiguous Purchase Module (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Visual Asset & Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#EADBCE] bg-[#FAF6F0] aspect-4/3 w-full shadow-2xs">
            <ProductArtwork type={product.type} title={product.name} />
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] text-xs text-stone-600 space-y-2">
            <div className="flex items-center gap-2 font-medium text-stone-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Cam kết chất lượng Glowcard</span>
            </div>
            <p className="leading-relaxed text-stone-500">
              Sáp thực vật tự nhiên 100%, không chứa paraben hay phẩm màu độc hại. Thời gian lưu hương đậm đà và an toàn cho sức khỏe hô hấp.
            </p>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Info */}
          <div className="space-y-2 pb-6 border-b border-stone-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider">
              <span>{product.categoryNameVi}</span>
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-medium">· Còn hàng ({product.stock})</span>
              ) : (
                <span className="text-red-600 font-medium">· Tạm hết hàng</span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-900 font-normal leading-tight">
              {product.name}
            </h1>

            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-stone-900 tabular-nums">
                {formatVND(currentUnitPrice)}
              </span>
              {product.type === 'candle' && (
                <span className="text-xs text-stone-500">
                  (Giá thay đổi theo dung tích hũ)
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Success Banner */}
          {showAddedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã thêm sản phẩm vào giỏ hàng thành công!</span>
              </div>
              <Link to="/cart" className="font-semibold underline hover:text-emerald-950">
                Xem giỏ hàng →
              </Link>
            </div>
          )}

          {/* 1. Size Selection (If Candle) */}
          {product.type === 'candle' && product.availableSizes && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                1. Chọn dung tích nến
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSize('30ml')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedSize === '30ml'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                  }`}
                >
                  <p className="font-semibold text-sm">30ml (Mini)</p>
                  <p className="text-xs opacity-80 mt-0.5">180.000₫ · ~15-20h cháy</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSize('50ml')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedSize === '50ml'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                  }`}
                >
                  <p className="font-semibold text-sm">50ml (Tiêu chuẩn)</p>
                  <p className="text-xs opacity-80 mt-0.5">250.000₫ · ~30-35h cháy</p>
                </button>
              </div>
            </div>
          )}

          {/* 2. Scent Selection for Single Candle */}
          {product.type === 'candle' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                  2. Chọn mùi hương
                </label>
                <span className="text-[11px] text-stone-500">6 mùi hương cao cấp</span>
              </div>

              {/* Standard Scents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {STANDARD_SCENTS.map((scent) => {
                  const isSelected = !isCustomScent && selectedScent === scent.nameVi;
                  return (
                    <button
                      key={scent.id}
                      type="button"
                      onClick={() => {
                        setSelectedScent(scent.nameVi);
                        setIsCustomScent(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-800 bg-amber-50/80 text-amber-950 font-medium'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-semibold">{scent.nameVi}</span>
                      <span className="text-[11px] text-stone-500 mt-1 line-clamp-1">{scent.description}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Scent Request Option */}
              {product.allowCustomScent && (
                <div className="pt-2">
                  <div
                    onClick={() => setIsCustomScent(!isCustomScent)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isCustomScent
                        ? 'border-amber-800 bg-amber-50/60 ring-1 ring-amber-800'
                        : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="candle-custom-scent-toggle"
                      checked={isCustomScent}
                      onChange={(e) => setIsCustomScent(e.target.checked)}
                      className="mt-1 accent-amber-800 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <label htmlFor="candle-custom-scent-toggle" className="text-xs font-semibold text-stone-900 flex items-center gap-1.5 cursor-pointer">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        Yêu cầu mùi hương phối chế riêng (Không phụ thu phí)
                      </label>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Bạn có thể tùy chọn kết hợp tinh dầu đặc biệt theo phong cách hoặc sở thích cá nhân.
                      </p>
                    </div>
                  </div>

                  {/* Custom Scent Text Input & Prominent Time Warning */}
                  {isCustomScent && (
                    <div className="mt-3 p-4 rounded-xl bg-white border border-amber-300 space-y-3 animate-in fade-in duration-200">
                      <div>
                        <label className="text-xs font-medium text-stone-800 block mb-1">
                          Mô tả mùi hương bạn muốn Glowcard phối chế:
                        </label>
                        <textarea
                          rows={3}
                          value={customScentText}
                          onChange={(e) => setCustomScentText(e.target.value)}
                          placeholder="Ví dụ: Hương gỗ thông đà lạt hòa quyện chút vỏ quýt ấm và vani dịu ngọt..."
                          className="w-full p-2.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-amber-800 text-stone-900 placeholder:text-stone-400"
                        />
                      </div>

                      {/* CLEAR MANDATORY WARNING NOTE */}
                      <div className="p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-0.5">Lưu ý về thời gian chuẩn bị:</p>
                          <p className="text-stone-700 leading-relaxed">
                            Mùi hương tuỳ chỉnh không phụ thu thêm phí. Tuy nhiên, thời gian chuẩn bị và giao hàng sẽ <strong>cần thêm từ 2 - 3 ngày làm việc</strong> để nghệ nhân ủ sáp và phối chế đạt độ lan tỏa tối ưu nhất.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Scent Selection for Scented Wax Card (Configurable business rule) */}
          {product.type === 'wax_card' && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                Mùi hương thiệp sáp
              </label>
              {WAX_CARD_SCENT_CONFIG.allowScentSelection ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {WAX_CARD_SCENT_CONFIG.availableScents.map((scentName) => (
                    <button
                      key={scentName}
                      type="button"
                      onClick={() => setSelectedScent(scentName)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedScent === scentName
                          ? 'border-amber-800 bg-amber-50/80 font-medium text-amber-950'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {scentName}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                  Mùi hương mặc định: <strong>{WAX_CARD_SCENT_CONFIG.defaultScent}</strong> (Hoa khô lưu hương tự nhiên)
                </div>
              )}
            </div>
          )}

          {/* 4. Per-Candle Scent Selection for Combos (Individually selectable!) */}
          {product.type === 'combo' && product.comboConfig && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                  Tùy chọn mùi hương cho từng nến ({candleCount} nến)
                </label>
                <span className="text-[11px] text-stone-500">Mỗi nến có thể chọn 1 mùi riêng</span>
              </div>

              {/* Combo component breakdown summary */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
                <p className="font-semibold text-stone-900 mb-1">Thành phần trong combo:</p>
                <p>{product.comboConfig.descriptionVi}</p>
              </div>

              {/* Individual Candle Selectors */}
              <div className="space-y-3">
                {comboCandleSelections.map((cand, idx) => (
                  <div key={cand.candleNumber} className="p-4 rounded-xl bg-white border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-700" />
                        Nến số {cand.candleNumber} ({product.comboConfig?.candleSize})
                      </span>
                      {cand.isCustom && (
                        <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Mùi hương tuỳ chỉnh
                        </span>
                      )}
                    </div>

                    <select
                      value={cand.isCustom ? 'CUSTOM' : cand.scent}
                      onChange={(e) => handleComboScentChange(idx, e.target.value)}
                      className="w-full p-2.5 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:bg-white text-stone-800"
                    >
                      {STANDARD_SCENTS.map((s) => (
                        <option key={s.id} value={s.nameVi}>
                          {s.nameVi}
                        </option>
                      ))}
                      <option value="CUSTOM">
                        ✨ Phối mùi hương riêng cho Nến số {cand.candleNumber} (Miễn phí)
                      </option>
                    </select>

                    {/* Custom text field if selected for this candle */}
                    {cand.isCustom && (
                      <div className="pt-1 space-y-1">
                        <input
                          type="text"
                          value={cand.customScentText || ''}
                          onChange={(e) => handleComboCustomTextChange(idx, e.target.value)}
                          placeholder={`Mô tả mùi hương riêng cho nến số ${cand.candleNumber}...`}
                          className="w-full p-2 text-xs rounded-lg border border-amber-300 text-stone-900 bg-amber-50/30 placeholder:text-stone-400"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Combo Custom Warning */}
              {comboCandleSelections.some((c) => c.isCustom) && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Lưu ý chuẩn bị combo chứa mùi hương riêng:</p>
                    <p className="text-stone-700 leading-relaxed">
                      Đơn hàng combo chứa nến tuỳ chỉnh sẽ cần thêm từ <strong>2 - 3 ngày làm việc</strong> để nghệ nhân hoàn thiện trước khi đóng hộp và giao hàng.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity Stepper & Buy Buttons */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            
            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                Số lượng:
              </label>
              <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-semibold text-stone-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-stone-900 text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                Thêm vào giỏ hàng
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold transition-colors shadow-sm active:scale-[0.99]"
              >
                Mua ngay
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {!isAuthenticated && (
              <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Bạn đang duyệt với tư cách khách. Đăng nhập để hoàn tất đơn hàng.
              </p>
            )}

          </div>

          {/* Product Specifications & Details */}
          <div className="pt-6 border-t border-stone-200 space-y-3 text-xs text-stone-600">
            {product.ingredients && (
              <div className="flex items-start gap-2">
                <strong className="text-stone-900 w-28 shrink-0">Thành phần:</strong>
                <span>{product.ingredients}</span>
              </div>
            )}
            {product.burnTime && (
              <div className="flex items-start gap-2">
                <strong className="text-stone-900 w-28 shrink-0">Thời gian tỏa:</strong>
                <span>{product.burnTime}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <strong className="text-stone-900 w-28 shrink-0">Vận chuyển:</strong>
              <span>Giao hàng toàn quốc · Đóng gói chống sốc an toàn</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
