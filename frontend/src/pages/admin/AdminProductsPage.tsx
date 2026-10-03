import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Product, ProductType, CandleSize } from '../../types';
import { STANDARD_SCENTS } from '../../data/mockData';
import { formatVND } from '../../utils/formatters';
import { ProductArtwork } from '../../components/ProductArtwork';
import { Plus, Edit2, Trash2, X, Check, Package, Sparkles } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('candle');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(180000);
  const [stock, setStock] = useState<number>(30);
  const [sizes, setSizes] = useState<CandleSize[]>(['30ml', '50ml']);
  const [allowCustom, setAllowCustom] = useState(true);
  
  // Combo specific fields
  const [comboCandleCount, setComboCandleCount] = useState<number>(2);
  const [comboCandleSize, setComboCandleSize] = useState<CandleSize>('30ml');
  const [comboWaxCount, setComboWaxCount] = useState<number>(1);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setType('candle');
    setDescription('');
    setPrice(180000);
    setStock(30);
    setSizes(['30ml', '50ml']);
    setAllowCustom(true);
    setComboCandleCount(2);
    setComboCandleSize('30ml');
    setComboWaxCount(1);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setType(p.type);
    setDescription(p.description);
    setPrice(p.price);
    setStock(p.stock);
    setSizes(p.availableSizes || ['30ml', '50ml']);
    setAllowCustom(p.allowCustomScent || false);
    if (p.comboConfig) {
      setComboCandleCount(p.comboConfig.candleCount);
      setComboCandleSize(p.comboConfig.candleSize || '30ml');
      setComboWaxCount(p.comboConfig.waxCardCount || 0);
    }
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryNameVi =
      type === 'candle' ? 'Nến thơm' : type === 'wax_card' ? 'Thiệp sáp thơm' : 'Combo';

    const comboConfig =
      type === 'combo'
        ? {
            candleCount: comboCandleCount,
            candleSize: comboCandleSize,
            waxCardCount: comboWaxCount,
            descriptionVi: `${comboCandleCount} nến ${comboCandleSize} + ${comboWaxCount} thiệp sáp`,
          }
        : undefined;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        type,
        description,
        price,
        stock,
        availableSizes: type === 'candle' ? sizes : undefined,
        allowCustomScent: allowCustom,
        comboConfig,
        categoryNameVi,
      });
    } else {
      addProduct({
        name,
        type,
        description,
        price,
        stock,
        image: '/images/default.svg',
        availableSizes: type === 'candle' ? sizes : undefined,
        availableScents: STANDARD_SCENTS.map((s) => s.nameVi),
        allowCustomScent: allowCustom,
        comboConfig,
        categoryNameVi,
        featured: false,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900 font-normal">
            Quản Lý Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Thêm mới, sửa giá, tồn kho và cấu hình quy tắc mùi hương cho các sản phẩm Glowcard
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-medium">Sản phẩm</th>
                <th className="py-3 px-4 font-medium">Phân loại</th>
                <th className="py-3 px-4 font-medium">Giá bán cơ sở</th>
                <th className="py-3 px-4 font-medium">Tồn kho</th>
                <th className="py-3 px-4 font-medium">Mùi hương riêng</th>
                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/60">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] overflow-hidden shrink-0 border border-stone-200">
                        <ProductArtwork type={p.type} title={p.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 truncate max-w-xs">{p.name}</p>
                        <p className="text-[11px] text-stone-400 truncate max-w-xs">{p.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
                      {p.categoryNameVi}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums">
                    {formatVND(p.price)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-semibold tabular-nums ${p.stock < 15 ? 'text-rose-600' : 'text-stone-800'}`}>
                      {p.stock} sản phẩm
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {p.allowCustomScent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Có hỗ trợ
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400">Không</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa "${p.name}" không?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-2xl text-stone-900 font-normal">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Tên sản phẩm:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nến Thơm Nghệ Thuật Mini Glowcard"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Loại sản phẩm:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ProductType)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 text-stone-900 bg-white"
                  >
                    <option value="candle">Nến thơm</option>
                    <option value="wax_card">Thiệp sáp thơm</option>
                    <option value="combo">Combo quà tặng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Giá bán cơ sở (VND):</label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Số lượng tồn kho:</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Mô tả sản phẩm:</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 text-stone-900"
                />
              </div>

              {/* Specific Options for Candle */}
              {type === 'candle' && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <label className="block text-stone-700 font-medium">Dung tích hỗ trợ:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sizes.includes('30ml')}
                        onChange={(e) => {
                          if (e.target.checked) setSizes([...sizes, '30ml']);
                          else setSizes(sizes.filter((s) => s !== '30ml'));
                        }}
                        className="accent-stone-900"
                      />
                      <span>30ml (Mini - 180.000₫)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sizes.includes('50ml')}
                        onChange={(e) => {
                          if (e.target.checked) setSizes([...sizes, '50ml']);
                          else setSizes(sizes.filter((s) => s !== '50ml'));
                        }}
                        className="accent-stone-900"
                      />
                      <span>50ml (Tiêu chuẩn - 250.000₫)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Specific Options for Combo */}
              {type === 'combo' && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="font-semibold text-stone-900 block">Cấu hình thành phần Combo:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-stone-600 mb-1">Số lượng nến:</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={comboCandleCount}
                        onChange={(e) => setComboCandleCount(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Dung tích từng nến:</label>
                      <select
                        value={comboCandleSize}
                        onChange={(e) => setComboCandleSize(e.target.value as CandleSize)}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      >
                        <option value="30ml">30ml</option>
                        <option value="50ml">50ml</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Số thiệp sáp kèm theo:</label>
                      <input
                        type="number"
                        min="0"
                        max="4"
                        value={comboWaxCount}
                        onChange={(e) => setComboWaxCount(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Allow Custom Scent Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCustom}
                    onChange={(e) => setAllowCustom(e.target.checked)}
                    className="accent-amber-800"
                  />
                  <span className="text-stone-800 font-medium">
                    Cho phép khách hàng yêu cầu mùi hương phối chế riêng cho sản phẩm này
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-sm"
                >
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
