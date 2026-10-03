import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { STANDARD_SCENTS } from '../data/mockData';
import { ProductType, CandleSize } from '../types';
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles } from 'lucide-react';

export const ProductListingPage: React.FC = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>(
    (searchParams.get('category') as ProductType) || 'all'
  );
  const [selectedSize, setSelectedSize] = useState<CandleSize | 'all'>('all');
  const [selectedScent, setSelectedScent] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category param with filter state
  React.useEffect(() => {
    const cat = searchParams.get('category') as ProductType;
    if (cat && ['candle', 'wax_card', 'combo'].includes(cat)) {
      setSelectedType(cat);
    }
  }, [searchParams]);

  // Filtered & sorted product list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchScents = product.availableScents?.some((s) => s.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchScents) return false;
      }

      // 2. Type Filter
      if (selectedType !== 'all' && product.type !== selectedType) {
        return false;
      }

      // 3. Candle Size Filter (only applies to candles or combos with sizes)
      if (selectedSize !== 'all') {
        if (product.type === 'candle' && (!product.availableSizes || !product.availableSizes.includes(selectedSize))) {
          return false;
        }
        if (product.type === 'combo' && product.comboConfig?.candleSize !== selectedSize) {
          return false;
        }
      }

      // 4. Scent Filter
      if (selectedScent !== 'all') {
        const hasScent = product.availableScents?.some((s) =>
          s.toLowerCase().includes(selectedScent.toLowerCase())
        );
        if (!hasScent && !product.allowCustomScent) {
          return false;
        }
      }

      // 5. Price filter
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // Default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedType, selectedSize, selectedScent, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedSize('all');
    setSelectedScent('all');
    setMaxPrice(1000000);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'all' ||
    selectedSize !== 'all' ||
    selectedScent !== 'all' ||
    maxPrice < 1000000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header & Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Bộ Sưu Tập Glowcard
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Nến thơm hữu cơ, thiệp sáp hoa khô lưu hương và các combo quà tặng tùy phối
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#EADBCE] p-4 mb-8 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mùi hương (Jasmine, Peach...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 text-xs rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-stone-600 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <label htmlFor="sort-by-select" className="sr-only">Sắp xếp theo</label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer border-b border-stone-200 pb-0.5"
              >
                <option value="featured">Nổi bật nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Category Tabs (Segmented control) */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-400 mr-1 hidden sm:inline">Phân loại:</span>
          {[
            { id: 'all', label: 'Tất cả sản phẩm' },
            { id: 'candle', label: 'Nến thơm' },
            { id: 'wax_card', label: 'Thiệp sáp thơm' },
            { id: 'combo', label: 'Combo quà tặng' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedType(cat.id as any);
                if (cat.id === 'all') setSearchParams({});
                else setSearchParams({ category: cat.id });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === cat.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
            >
              <X className="w-3 h-3" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Catalog Layout (Responsive: Desktop Filter panel + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Filter Panel (Compact & Flexible, not forced to 1/3) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-[#EADBCE] h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif text-lg text-stone-900 font-normal">Bộ Lọc Tùy Chọn</h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-stone-500 hover:text-red-600 transition-colors"
              >
                Đặt lại
              </button>
            )}
          </div>

          {/* Candle Size Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
              Dung Tích Nến
            </label>
            <div className="space-y-1.5 text-xs text-stone-600">
              <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                <input
                  type="radio"
                  name="desktop-size"
                  checked={selectedSize === 'all'}
                  onChange={() => setSelectedSize('all')}
                  className="accent-stone-900"
                />
                <span>Tất cả dung tích</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                <input
                  type="radio"
                  name="desktop-size"
                  checked={selectedSize === '30ml'}
                  onChange={() => setSelectedSize('30ml')}
                  className="accent-stone-900"
                />
                <span>Hũ 30ml (nhỏ gọn)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                <input
                  type="radio"
                  name="desktop-size"
                  checked={selectedSize === '50ml'}
                  onChange={() => setSelectedSize('50ml')}
                  className="accent-stone-900"
                />
                <span>Hũ 50ml (tiêu chuẩn)</span>
              </label>
            </div>
          </div>

          {/* Scent Filter */}
          <div className="space-y-2.5 pt-4 border-t border-stone-100">
            <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
              Mùi Hương Nổi Bật
            </label>
            <div className="space-y-1 text-xs text-stone-600">
              <button
                onClick={() => setSelectedScent('all')}
                className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                  selectedScent === 'all'
                    ? 'bg-amber-100/70 font-semibold text-amber-950'
                    : 'hover:bg-stone-50'
                }`}
              >
                Tất cả mùi hương
              </button>
              {STANDARD_SCENTS.map((scent) => (
                <button
                  key={scent.id}
                  onClick={() => setSelectedScent(scent.nameEn)}
                  className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                    selectedScent === scent.nameEn
                      ? 'bg-amber-100/70 font-semibold text-amber-950'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  {scent.nameVi}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2.5 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-stone-800 uppercase tracking-wider">
                Mức Giá Tối Đa
              </label>
              <span className="font-semibold text-stone-900 tabular-nums">
                {maxPrice >= 1000000 ? 'Tất cả mức giá' : `${(maxPrice / 1000).toLocaleString('vi-VN')}k`}
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max="1000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-800 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>100k</span>
              <span>500k</span>
              <span>1.000k+</span>
            </div>
          </div>

          {/* Custom Scent Note Feature Box */}
          <div className="pt-4 border-t border-stone-100 bg-[#FAF6F0] p-3 rounded-xl border border-amber-200/50 text-[11px] text-amber-950 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Mùi hương tuỳ chỉnh
            </div>
            Glowcard hỗ trợ khách hàng tự phối mùi riêng theo ý thích, hoàn toàn không phụ thu thêm phí.
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-stone-800 font-normal">
                Không tìm thấy sản phẩm phù hợp
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bớt tiêu chí lọc để xem thêm sản phẩm.
              </p>
              <button
                onClick={resetFilters}
                className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between text-xs text-stone-500">
                <span>Hiển thị <strong className="text-stone-800 tabular-nums">{filteredProducts.length}</strong> sản phẩm</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </main>

      </div>

      {/* Mobile Filter Modal / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto p-6 space-y-6 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl text-stone-900 font-normal">Bộ Lọc Sản Phẩm</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
                Loại Sản Phẩm
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'candle', label: 'Nến thơm' },
                  { id: 'wax_card', label: 'Thiệp sáp' },
                  { id: 'combo', label: 'Combo quà' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedType(cat.id as any)}
                    className={`py-2 px-3 rounded-lg border text-center font-medium ${
                      selectedType === cat.id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candle Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
                Dung Tích Nến
              </label>
              <div className="flex gap-2 text-xs">
                {['all', '30ml', '50ml'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz as any)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-center font-medium ${
                      selectedSize === sz
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    {sz === 'all' ? 'Tất cả' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Scent */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
                Mùi Hương
              </label>
              <select
                value={selectedScent}
                onChange={(e) => setSelectedScent(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="all">Tất cả mùi hương</option>
                {STANDARD_SCENTS.map((scent) => (
                  <option key={scent.id} value={scent.nameEn}>
                    {scent.nameVi}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 text-xs font-medium text-stone-700 rounded-xl border border-stone-300"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 text-xs font-medium bg-stone-900 text-white rounded-xl"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
