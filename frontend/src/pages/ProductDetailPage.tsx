import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductArtwork } from '../components/ProductArtwork';
import { useProductDetail } from '../hooks/useCatalog';
import { toProduct, toUiSize } from '../api/adapters';
import type { ProductDetail, ProductVariant } from '../api/types';
import type { ComboCandleSelection } from '../types';
import { formatVND } from '../utils/formatters';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Flame,
  Info,
} from 'lucide-react';

const CUSTOM = 'CUSTOM';
const CUSTOM_LABEL = 'Mùi hương tuỳ chỉnh';

interface ComboSlot {
  variantId: number | null;
  isCustom: boolean;
  text: string;
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useProductDetail(id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (error && error.status !== 404) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-red-600">{error.message}</p>
        <button
          onClick={reload}
          className="py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-stone-500">
          Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ.
        </p>
        <Link
          to="/products"
          className="inline-block py-2.5 px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
        >
          Quay lại danh mục sản phẩm
        </Link>
      </div>
    );
  }

  return <ProductDetailView key={data.slug} detail={data} />;
};

const ProductDetailView: React.FC<{ detail: ProductDetail }> = ({ detail }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, triggerLoginRequirement } = useAuth();

  const product = useMemo(() => toProduct(detail), [detail]);
  const variants = detail.variants;

  // ---------- Nến lẻ ----------
  const sizes = useMemo(
    () =>
      Array.from(
        new Set(variants.map((v) => v.size_ml).filter((s): s is number => s !== null))
      ).sort((a, b) => a - b),
    [variants]
  );
  const variantsAt = (size: number | null) =>
    variants.filter((v) => v.size_ml === size && v.scent !== null);
  const firstInStock = (list: ProductVariant[]) =>
    list.find((v) => v.stock_quantity > 0) ?? list[0];

  const initialSize =
    sizes.find((s) => variantsAt(s).some((v) => v.stock_quantity > 0)) ?? sizes[0] ?? null;
  const [selectedSize, setSelectedSize] = useState<number | null>(initialSize);
  const [selectedScentId, setSelectedScentId] = useState<number | null>(
    firstInStock(variantsAt(initialSize))?.scent?.id ?? null
  );
  const [isCustomScent, setIsCustomScent] = useState(false);
  const [customScentText, setCustomScentText] = useState('');

  const candleVariants = variantsAt(selectedSize);
  const selectedVariant =
    candleVariants.find((v) => v.scent?.id === selectedScentId) ?? null;
  const sizePrice = candleVariants.length ? Math.min(...candleVariants.map((v) => v.price)) : 0;

  const handleSizeChange = (size: number) => {
    setSelectedSize(size);
    const list = variantsAt(size);
    const same = list.find((v) => v.scent?.id === selectedScentId && v.stock_quantity > 0);
    setSelectedScentId((same ?? firstInStock(list))?.scent?.id ?? null);
  };

  // ---------- Thiệp ----------
  const cardVariant = product.type === 'wax_card' ? variants[0] ?? null : null;

  // ---------- Combo ----------
  const slotSizes = useMemo(
    () =>
      detail.components
        .filter((c) => c.component_type === 'CANDLE')
        .flatMap((c) => Array.from({ length: c.quantity }, () => c.size_ml)),
    [detail.components]
  );
  const optionsFor = (size: number | null) =>
    detail.candle_variants.filter((v) => v.size_ml === size);

  const [comboSlots, setComboSlots] = useState<ComboSlot[]>(() =>
    slotSizes.map((size, i) => {
      const all = optionsFor(size);
      const inStock = all.filter((v) => v.stock_quantity > 0);
      const pick = inStock.length ? inStock[i % inStock.length] : all[0];
      return { variantId: pick?.id ?? null, isCustom: false, text: '' };
    })
  );
  const updateSlot = (idx: number, patch: Partial<ComboSlot>) =>
    setComboSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const comboSummary = detail.components
    .map((c) =>
      c.component_type === 'CANDLE'
        ? `${c.quantity} nến ${c.size_ml}ml`
        : `${c.quantity} thiệp sáp thơm`
    )
    .join(' + ');

  // ---------- Chung ----------
  const [quantity, setQuantity] = useState(1);
  const [showAddedSuccess, setShowAddedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  let currentUnitPrice = product.price;
  if (product.type === 'candle') {
    currentUnitPrice = isCustomScent ? sizePrice : selectedVariant?.price ?? sizePrice;
  } else if (product.type === 'wax_card' && cardVariant) {
    currentUnitPrice = cardVariant.price;
  }

  let stockInfo: { ok: boolean; text: string } | null = null;
  if (product.type === 'candle' && !isCustomScent && selectedVariant) {
    const n = selectedVariant.stock_quantity;
    stockInfo = n > 0 ? { ok: true, text: `Còn hàng (${n})` } : { ok: false, text: 'Tạm hết hàng' };
  } else if (product.type === 'wax_card' && cardVariant) {
    const n = cardVariant.stock_quantity;
    stockInfo = n > 0 ? { ok: true, text: `Còn hàng (${n})` } : { ok: false, text: 'Tạm hết hàng' };
  } else if (product.type === 'combo') {
    stockInfo = detail.in_stock
      ? { ok: true, text: 'Còn hàng' }
      : { ok: false, text: 'Tạm hết hàng' };
  }

  const handleAddToCart = (isBuyNow: boolean = false) => {
    if (!isAuthenticated) {
      triggerLoginRequirement(
        'Vui lòng đăng nhập tài khoản khách hàng để thêm sản phẩm vào giỏ hàng và tiến hành thanh toán.'
      );
      return;
    }

    if (product.type === 'candle') {
      if (isCustomScent) {
        if (!customScentText.trim()) {
          setValidationError('Vui lòng nhập mô tả mùi hương bạn mong muốn phối chế.');
          return;
        }
      } else if (!selectedVariant || selectedVariant.stock_quantity <= 0) {
        setValidationError('Mùi hương này tạm hết hàng, vui lòng chọn mùi khác.');
        return;
      }
    }

    if (product.type === 'wax_card' && (!cardVariant || cardVariant.stock_quantity <= 0)) {
      setValidationError('Sản phẩm tạm hết hàng.');
      return;
    }

    if (product.type === 'combo') {
      for (let i = 0; i < comboSlots.length; i++) {
        const slot = comboSlots[i];
        if (slot.isCustom) {
          if (!slot.text.trim()) {
            setValidationError(`Vui lòng nhập mô tả mùi hương tuỳ chỉnh cho Nến số ${i + 1}.`);
            return;
          }
        } else {
          const v = detail.candle_variants.find((x) => x.id === slot.variantId);
          if (!v || v.stock_quantity <= 0) {
            setValidationError(`Nến số ${i + 1}: mùi đã chọn tạm hết hàng, vui lòng chọn mùi khác.`);
            return;
          }
        }
      }
    }

    setValidationError(null);

    // Giỏ hàng hiện vẫn là bản mock (localStorage), sẽ nối API ở đợt 4
    const comboSelections: ComboCandleSelection[] | undefined =
      product.type === 'combo'
        ? comboSlots.map((slot, i) => ({
            candleNumber: i + 1,
            scent: slot.isCustom
              ? CUSTOM_LABEL
              : detail.candle_variants.find((v) => v.id === slot.variantId)?.scent?.name_vi ?? '',
            isCustom: slot.isCustom,
            customScentText: slot.isCustom ? slot.text : '',
          }))
        : undefined;

    addToCart({
      productId: product.id,
      product,
      selectedSize:
        product.type === 'candle' && selectedSize !== null
          ? toUiSize(selectedSize)
          : product.comboConfig?.candleSize,
      selectedScent:
        product.type === 'candle'
          ? isCustomScent
            ? CUSTOM_LABEL
            : selectedVariant?.scent?.name_vi
          : undefined,
      isCustomScent: product.type === 'candle' ? isCustomScent : false,
      customScentNote: product.type === 'candle' && isCustomScent ? customScentText : undefined,
      comboSelections,
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

  const hasCustomScentActive =
    (product.type === 'candle' && isCustomScent) ||
    (product.type === 'combo' && comboSlots.some((s) => s.isCustom));

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: visual */}
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

        {/* Right: purchase module */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 pb-6 border-b border-stone-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider">
              <span>{product.categoryNameVi}</span>
              {stockInfo && (
                <span className={`font-medium ${stockInfo.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                  · {stockInfo.text}
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-900 font-normal leading-tight">
              {product.name}
            </h1>

            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-stone-900 tabular-nums">
                {formatVND(currentUnitPrice)}
              </span>
              {product.type === 'candle' && sizes.length > 1 && (
                <span className="text-xs text-stone-500">(Giá thay đổi theo dung tích hũ)</span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

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

          {/* 1. Size (nến lẻ) */}
          {product.type === 'candle' && sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                1. Chọn dung tích nến
              </label>
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((size) => {
                  const price = Math.min(...variantsAt(size).map((v) => v.price));
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <p className="font-semibold text-sm">{size}ml</p>
                      <p className="text-xs opacity-80 mt-0.5">{formatVND(price)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Mùi hương (nến lẻ) */}
          {product.type === 'candle' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                  2. Chọn mùi hương
                </label>
                <span className="text-[11px] text-stone-500">{candleVariants.length} mùi hương</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {candleVariants.map((v) => {
                  const soldOut = v.stock_quantity <= 0;
                  const isSelected = !isCustomScent && selectedScentId === v.scent?.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={soldOut}
                      onClick={() => {
                        setSelectedScentId(v.scent?.id ?? null);
                        setIsCustomScent(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        soldOut
                          ? 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-amber-800 bg-amber-50/80 text-amber-950 font-medium'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-semibold">
                        {v.scent?.name_vi}
                        {soldOut && <span className="ml-1.5 text-[11px] font-medium">(Hết hàng)</span>}
                      </span>
                      <span className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                        {v.scent?.description}
                      </span>
                    </button>
                  );
                })}
              </div>

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
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 accent-amber-800 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="candle-custom-scent-toggle"
                        className="text-xs font-semibold text-stone-900 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        Yêu cầu mùi hương phối chế riêng (Không phụ thu phí)
                      </label>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Bạn có thể tùy chọn kết hợp tinh dầu đặc biệt theo phong cách hoặc sở thích cá nhân.
                      </p>
                    </div>
                  </div>

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

          {/* Thiệp sáp: chưa có lựa chọn mùi vì business chưa chốt */}

          {/* Combo: chọn mùi cho từng cây nến */}
          {product.type === 'combo' && slotSizes.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                  Tùy chọn mùi hương cho từng nến ({slotSizes.length} nến)
                </label>
                <span className="text-[11px] text-stone-500">Mỗi nến có thể chọn 1 mùi riêng</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
                <p className="font-semibold text-stone-900 mb-1">Thành phần trong combo:</p>
                <p>{comboSummary}</p>
              </div>

              <div className="space-y-3">
                {comboSlots.map((slot, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-700" />
                        Nến số {idx + 1} ({slotSizes[idx]}ml)
                      </span>
                      {slot.isCustom && (
                        <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {CUSTOM_LABEL}
                        </span>
                      )}
                    </div>

                    <select
                      value={slot.isCustom ? CUSTOM : slot.variantId ?? ''}
                      onChange={(e) =>
                        e.target.value === CUSTOM
                          ? updateSlot(idx, { isCustom: true, variantId: null })
                          : updateSlot(idx, { isCustom: false, variantId: Number(e.target.value) })
                      }
                      className="w-full p-2.5 text-xs rounded-lg border border-stone-300 bg-stone-50 focus:bg-white text-stone-800"
                    >
                      {optionsFor(slotSizes[idx]).map((v) => (
                        <option key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
                          {v.scent?.name_vi}
                          {v.stock_quantity <= 0 ? ' (Hết hàng)' : ''}
                        </option>
                      ))}
                      {product.allowCustomScent && (
                        <option value={CUSTOM}>
                          ✨ Phối mùi hương riêng cho Nến số {idx + 1} (Miễn phí)
                        </option>
                      )}
                    </select>

                    {slot.isCustom && (
                      <div className="pt-1 space-y-1">
                        <input
                          type="text"
                          value={slot.text}
                          onChange={(e) => updateSlot(idx, { text: e.target.value })}
                          placeholder={`Mô tả mùi hương riêng cho nến số ${idx + 1}...`}
                          className="w-full p-2 text-xs rounded-lg border border-amber-300 text-stone-900 bg-amber-50/30 placeholder:text-stone-400"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {hasCustomScentActive && (
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

          {/* Số lượng + nút mua */}
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

          {/* Thông tin chi tiết */}
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