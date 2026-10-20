import React, { useMemo, useState } from 'react';
import { useAsync } from '../../hooks/useCatalog';
import {
  addVariant,
  createProduct,
  createScent,
  getAdminProduct,
  hideProduct,
  listAdminProducts,
  listAdminScents,
  replaceComponents,
  updateProduct,
  updateScent,
  updateVariant,
} from '../../api/admin';
import { adminErrorMessage } from '../../api/errors';
import { toUiType } from '../../api/adapters';
import type {
  AdminProductOut,
  AdminScentOut,
  AdminVariantOut,
  ComponentIn,
  ProductCreateIn,
  VariantUpdateIn,
} from '../../api/types';
import { formatVND } from '../../utils/formatters';
import { ProductArtwork } from '../../components/ProductArtwork';
import {
  Plus,
  Edit2,
  EyeOff,
  Eye,
  X,
  Sparkles,
  AlertCircle,
  Check,
  Trash2,
} from 'lucide-react';

type Product = AdminProductOut;
type Variant = AdminVariantOut;
type Scent = AdminScentOut;
type ProductKind = 'CANDLE' | 'CARD' | 'COMBO';

const LOW_STOCK = 5;

const TYPE_LABEL: Record<string, string> = {
  CANDLE: 'Nến thơm',
  CARD: 'Thiệp sáp thơm',
  COMBO: 'Combo quà tặng',
};

const toInt = (s: string): number | null => {
  const t = s.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
};

const activeVariants = (p: Product) => p.variants.filter((v) => v.is_active);

const priceLabel = (p: Product) => {
  const prices = activeVariants(p).map((v) => v.price);
  if (prices.length === 0) return '—';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
};

const inputCls =
  'w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 text-stone-900 bg-white';

const ErrorBox: React.FC<{ message: string }> = ({ message }) =>
  message ? (
    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  ) : null;

const Modal: React.FC<{
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}> = ({ title, onClose, wide, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
    <div
      className={`w-full ${
        wide ? 'max-w-3xl' : 'max-w-xl'
      } bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="font-serif text-2xl text-stone-900 font-normal">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-stone-400 hover:text-stone-700"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ===========================================================================
// Trang chính
// ===========================================================================

export const AdminProductsPage: React.FC = () => {
  const [tab, setTab] = useState<'products' | 'scents'>('products');
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const products = useAsync(() => listAdminProducts(), [version]);
  const scents = useAsync(() => listAdminScents(), [version]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [scentModal, setScentModal] = useState<{ scent: Scent | null } | null>(null);
  const [pageError, setPageError] = useState('');

  const list = products.data ?? [];
  const scentList = scents.data ?? [];
  const activeScents = scentList.filter((s) => s.is_active);

  const candleSizes = useMemo(() => {
    const sizes = new Set<number>();
    for (const p of list) {
      if (p.product_type !== 'CANDLE') continue;
      for (const v of p.variants) if (v.size_ml !== null) sizes.add(v.size_ml);
    }
    return Array.from(sizes).sort((a, b) => a - b);
  }, [list]);

  const toggleProduct = async (p: Product) => {
    setPageError('');
    try {
      if (p.is_active) await hideProduct(p.id);
      else await updateProduct(p.id, { is_active: true });
      bump();
    } catch (e) {
      setPageError(adminErrorMessage(e));
    }
  };

  const toggleScent = async (s: Scent) => {
    setPageError('');
    try {
      await updateScent(s.id, { is_active: !s.is_active });
      bump();
    } catch (e) {
      setPageError(adminErrorMessage(e));
    }
  };

  const editingProduct = editingId !== null ? list.find((p) => p.id === editingId) ?? null : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900 font-normal">
            Quản Lý Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Thêm mới, sửa giá, tồn kho và quản lý các mùi hương của Glowcard
          </p>
        </div>

        {tab === 'products' ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm mới</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setScentModal({ scent: null })}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mùi hương mới</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-3 text-xs">
        {[
          { id: 'products' as const, label: `Sản phẩm (${list.length})` },
          { id: 'scents' as const, label: `Mùi hương (${scentList.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tab === t.id
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {pageError && <ErrorBox message={pageError} />}

      {/* ---------------- Tab sản phẩm ---------------- */}
      {tab === 'products' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {!products.data && products.loading ? (
            <p className="p-10 text-center text-xs text-stone-500">Đang tải sản phẩm...</p>
          ) : products.error ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs text-red-600">{products.error.message}</p>
              <button
                onClick={products.reload}
                className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4 font-medium">Sản phẩm</th>
                    <th className="py-3 px-4 font-medium">Phân loại</th>
                    <th className="py-3 px-4 font-medium">Giá bán</th>
                    <th className="py-3 px-4 font-medium">Tồn kho</th>
                    <th className="py-3 px-4 font-medium">Mùi hương riêng</th>
                    <th className="py-3 px-4 font-medium">Trạng thái</th>
                    <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {list.map((p) => {
                    const act = activeVariants(p);
                    const totalStock = act.reduce((s, v) => s + v.stock_quantity, 0);
                    const lowCount = act.filter((v) => v.stock_quantity <= LOW_STOCK).length;
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-stone-50/60 ${p.is_active ? '' : 'opacity-60'}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] overflow-hidden shrink-0 border border-stone-200">
                              <ProductArtwork type={toUiType(p.product_type)} title={p.name} imageUrl={p.image_url} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 truncate max-w-xs">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-stone-400 truncate max-w-xs">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
                            {TYPE_LABEL[p.product_type] ?? p.product_type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-nums whitespace-nowrap">
                          {priceLabel(p)}
                        </td>

                        <td className="py-3.5 px-4">
                          {p.product_type === 'COMBO' ? (
                            <span className="text-[11px] text-stone-400">Theo thành phần</span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="font-semibold tabular-nums text-stone-800">
                                {totalStock} sản phẩm
                              </span>
                              {lowCount > 0 && (
                                <p className="text-[11px] text-rose-600 font-medium">
                                  {lowCount} mục sắp hết
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {p.allow_custom_scent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              Có hỗ trợ
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400">Không</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              p.is_active
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}
                          >
                            {p.is_active ? 'Đang bán' : 'Đang ẩn'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(p.id)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Chỉnh sửa sản phẩm"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleProduct(p)}
                              className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                              title={
                                p.is_active
                                  ? 'Ẩn khỏi cửa hàng (không xóa dữ liệu)'
                                  : 'Hiện lại trên cửa hàng'
                              }
                            >
                              {p.is_active ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        Chưa có sản phẩm nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab mùi hương ---------------- */}
      {tab === 'scents' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {!scents.data && scents.loading ? (
            <p className="p-10 text-center text-xs text-stone-500">Đang tải mùi hương...</p>
          ) : scents.error ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs text-red-600">{scents.error.message}</p>
              <button
                onClick={scents.reload}
                className="py-2 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4 font-medium">Mùi hương</th>
                    <th className="py-3 px-4 font-medium">Tầng hương</th>
                    <th className="py-3 px-4 font-medium">Trạng thái</th>
                    <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {scentList.map((s) => (
                    <tr key={s.id} className={`hover:bg-stone-50/60 ${s.is_active ? '' : 'opacity-60'}`}>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-stone-900">{s.name_vi}</p>
                        <p className="text-[11px] text-stone-400">{s.name_en}</p>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 max-w-sm">
                        <p className="line-clamp-2">{s.notes || s.description || '—'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            s.is_active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {s.is_active ? 'Đang bán' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setScentModal({ scent: s })}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Chỉnh sửa mùi hương"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleScent(s)}
                            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title={s.is_active ? 'Ẩn mùi này khỏi cửa hàng' : 'Hiện lại mùi này'}
                          >
                            {s.is_active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {scentList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-400">
                        Chưa có mùi hương nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Các hộp thoại ---------------- */}
      {editingProduct && (
        <ProductEditor
          key={editingProduct.id}
          product={editingProduct}
          scents={activeScents}
          candleSizes={candleSizes}
          onClose={() => setEditingId(null)}
          onChanged={bump}
        />
      )}

      {creating && (
        <NewProductModal
          scents={activeScents}
          candleSizes={candleSizes}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            bump();
          }}
        />
      )}

      {scentModal && (
        <ScentModal
          scent={scentModal.scent}
          onClose={() => setScentModal(null)}
          onSaved={() => {
            setScentModal(null);
            bump();
          }}
        />
      )}
    </div>
  );
};

// ===========================================================================
// Sửa sản phẩm
// ===========================================================================

const ProductEditor: React.FC<{
  product: Product;
  scents: Scent[];
  candleSizes: number[];
  onClose: () => void;
  onChanged: () => void;
}> = ({ product, scents, candleSizes, onClose, onChanged }) => {
  const [current, setCurrent] = useState<Product>(product);
  const kind = current.product_type as ProductKind;

  const refresh = async () => {
    setCurrent(await getAdminProduct(current.id));
    onChanged();
  };

  // --- thông tin chung ---
  const [name, setName] = useState(current.name);
  const [description, setDescription] = useState(current.description);
  const [story, setStory] = useState(current.story ?? '');
  const [burnTime, setBurnTime] = useState(current.burn_time ?? '');
  const [ingredients, setIngredients] = useState(current.ingredients ?? '');
  const [imageUrl, setImageUrl] = useState(current.image_url ?? '');
  const [featured, setFeatured] = useState(current.featured);
  const [allowCustom, setAllowCustom] = useState(current.allow_custom_scent);
  const [infoBusy, setInfoBusy] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoBusy(true);
    setInfoError('');
    setInfoSaved(false);
    try {
      await updateProduct(current.id, {
        name: name.trim(),
        description: description.trim(),
        story: story.trim() || null,
        burn_time: burnTime.trim() || null,
        ingredients: ingredients.trim() || null,
        image_url: imageUrl.trim() || null,
        featured,
        allow_custom_scent: allowCustom,
      });
      await refresh();
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2500);
    } catch (err) {
      setInfoError(adminErrorMessage(err));
    } finally {
      setInfoBusy(false);
    }
  };

  // --- biến thể ---
  const [variantError, setVariantError] = useState('');

  const saveVariant = async (id: number, body: VariantUpdateIn) => {
    setVariantError('');
    try {
      await updateVariant(id, body);
      await refresh();
    } catch (err) {
      const msg = adminErrorMessage(err);
      setVariantError(msg);
      throw err;
    }
  };

  // --- thêm biến thể mới (nến) ---
  const [newScentId, setNewScentId] = useState<string>('');
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('0');
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState('');

  const submitAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const size = toInt(newSize);
    const price = toInt(newPrice);
    const stock = toInt(newStock);
    if (!newScentId || size === null || size <= 0 || price === null || stock === null) {
      setAddError('Vui lòng chọn mùi hương và nhập size, giá, tồn kho là số nguyên không âm.');
      return;
    }
    setAddBusy(true);
    try {
      await addVariant(current.id, {
        scent_id: Number(newScentId),
        size_ml: size,
        price,
        stock_quantity: stock,
      });
      await refresh();
      setNewScentId('');
      setNewSize('');
      setNewPrice('');
      setNewStock('0');
    } catch (err) {
      setAddError(adminErrorMessage(err));
    } finally {
      setAddBusy(false);
    }
  };

  // --- thành phần combo ---
  interface CompRow {
    component_type: 'CANDLE' | 'CARD';
    size_ml: string;
    quantity: string;
  }
  const toRows = (p: Product): CompRow[] =>
    p.components.map((c) => ({
      component_type: c.component_type as 'CANDLE' | 'CARD',
      size_ml: c.size_ml === null ? '' : String(c.size_ml),
      quantity: String(c.quantity),
    }));
  const [rows, setRows] = useState<CompRow[]>(() => toRows(current));
  const [compBusy, setCompBusy] = useState(false);
  const [compError, setCompError] = useState('');
  const [compSaved, setCompSaved] = useState(false);

  const updateRow = (idx: number, patch: Partial<CompRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const saveComponents = async () => {
    setCompError('');
    setCompSaved(false);
    const body: ComponentIn[] = [];
    for (const r of rows) {
      const qty = toInt(r.quantity);
      if (qty === null || qty <= 0) {
        setCompError('Số lượng mỗi thành phần phải là số nguyên lớn hơn 0.');
        return;
      }
      if (r.component_type === 'CANDLE') {
        const size = toInt(r.size_ml);
        if (size === null || size <= 0) {
          setCompError('Hãy chọn dung tích cho các thành phần nến.');
          return;
        }
        body.push({ component_type: 'CANDLE', size_ml: size, quantity: qty });
      } else {
        body.push({ component_type: 'CARD', quantity: qty });
      }
    }
    setCompBusy(true);
    try {
      const updated = await replaceComponents(current.id, body);
      setCurrent(updated);
      setRows(toRows(updated));
      onChanged();
      setCompSaved(true);
      setTimeout(() => setCompSaved(false), 2500);
    } catch (err) {
      setCompError(adminErrorMessage(err));
    } finally {
      setCompBusy(false);
    }
  };

  return (
    <Modal title={`Chỉnh Sửa: ${current.name}`} onClose={onClose} wide>
      {/* ---------- Thông tin chung ---------- */}
      <form onSubmit={saveInfo} className="space-y-4 text-xs">
        <h4 className="font-semibold text-stone-900 text-sm">Thông tin sản phẩm</h4>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Tên sản phẩm:</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Mô tả ngắn:</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Câu chuyện sản phẩm:</label>
          <textarea
            rows={2}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Thời gian tỏa hương:</label>
            <input
              type="text"
              value={burnTime}
              onChange={(e) => setBurnTime(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-stone-700 font-medium mb-1">Thành phần:</label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Đường dẫn ảnh sản phẩm:</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/images/ten-anh.jpg"
            className={inputCls}
          />
          <p className="text-[11px] text-stone-500 mt-1">
            Để trống thì web hiện hình minh họa vẽ sẵn. Ảnh phải được tải lên thư mục
            frontend/public/images của dự án trước, rồi nhập đường dẫn bắt đầu bằng /images/.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-stone-900"
            />
            <span className="text-stone-800">Hiển thị ở mục sản phẩm nổi bật trên trang chủ</span>
          </label>
          {kind !== 'CARD' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowCustom}
                onChange={(e) => setAllowCustom(e.target.checked)}
                className="accent-amber-800"
              />
              <span className="text-stone-800 font-medium">
                Cho phép khách yêu cầu mùi hương phối chế riêng (không phụ thu)
              </span>
            </label>
          )}
        </div>

        <ErrorBox message={infoError} />

        <div className="flex items-center justify-end gap-3">
          {infoSaved && (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Đã lưu
            </span>
          )}
          <button
            type="submit"
            disabled={infoBusy}
            className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-sm disabled:opacity-60"
          >
            {infoBusy ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </form>

      {/* ---------- Giá và tồn kho ---------- */}
      <div className="space-y-3 text-xs pt-2 border-t border-stone-100">
        <h4 className="font-semibold text-stone-900 text-sm">
          {kind === 'COMBO' ? 'Giá combo' : 'Giá & tồn kho'}
        </h4>

        {kind === 'COMBO' ? (
          <p className="text-stone-500">
            Combo không có kho riêng: khi khách mua, hệ thống trừ tồn kho của từng cây nến theo mùi
            đã chọn và của thiệp kèm theo.
          </p>
        ) : (
          <p className="text-stone-500">
            Đổi giá chỉ áp dụng cho đơn mới, đơn đã đặt giữ nguyên giá cũ. Khi lưu tồn kho, hệ thống
            cộng hoặc trừ phần chênh lệch nên không ghi đè các đơn vừa phát sinh.
          </p>
        )}

        <ErrorBox message={variantError} />

        <div className="space-y-2">
          {current.variants.map((v) => (
            <VariantRow
              key={`${v.id}-${v.price}-${v.stock_quantity}-${v.is_active}`}
              v={v}
              showStock={kind !== 'COMBO'}
              onSave={(body) => saveVariant(v.id, body)}
            />
          ))}
          {current.variants.length === 0 && (
            <p className="text-stone-400">Sản phẩm chưa có biến thể nào.</p>
          )}
        </div>

        {/* Thêm biến thể mới cho nến */}
        {kind === 'CANDLE' && (
          <form
            onSubmit={submitAddVariant}
            className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
          >
            <span className="font-semibold text-stone-900 block">
              Thêm biến thể (mùi + dung tích) còn thiếu
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-stone-600 mb-1">Mùi hương:</label>
                <select
                  value={newScentId}
                  onChange={(e) => setNewScentId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="">Chọn mùi...</option>
                  {scents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-600 mb-1">Dung tích (ml):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  list="glow-sizes"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                />
                <datalist id="glow-sizes">
                  {candleSizes.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-stone-600 mb-1">Giá (VND):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1">Tồn kho:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>
            </div>
            <ErrorBox message={addError} />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addBusy}
                className="py-2 px-4 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-60"
              >
                {addBusy ? 'Đang thêm...' : 'Thêm biến thể'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ---------- Thành phần combo ---------- */}
      {kind === 'COMBO' && (
        <div className="space-y-3 text-xs pt-2 border-t border-stone-100">
          <h4 className="font-semibold text-stone-900 text-sm">Thành phần combo</h4>

          <div className="space-y-2">
            {rows.map((r, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <label className="block text-stone-600 mb-1">Loại:</label>
                  <select
                    value={r.component_type}
                    onChange={(e) =>
                      updateRow(idx, {
                        component_type: e.target.value as 'CANDLE' | 'CARD',
                        size_ml: '',
                      })
                    }
                    className="p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="CANDLE">Nến thơm</option>
                    <option value="CARD">Thiệp sáp thơm</option>
                  </select>
                </div>

                {r.component_type === 'CANDLE' && (
                  <div>
                    <label className="block text-stone-600 mb-1">Dung tích:</label>
                    <select
                      value={r.size_ml}
                      onChange={(e) => updateRow(idx, { size_ml: e.target.value })}
                      className="p-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="">Chọn...</option>
                      {candleSizes.map((s) => (
                        <option key={s} value={s}>
                          {s}ml
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-stone-600 mb-1">Số lượng:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={r.quantity}
                    onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                    className="w-20 p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Xóa thành phần này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                { component_type: 'CANDLE', size_ml: '', quantity: '1' },
              ])
            }
            className="inline-flex items-center gap-1.5 text-amber-800 hover:text-amber-950 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm thành phần
          </button>

          <ErrorBox message={compError} />

          <div className="flex items-center justify-end gap-3">
            {compSaved && (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Đã lưu
              </span>
            )}
            <button
              type="button"
              disabled={compBusy}
              onClick={saveComponents}
              className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-sm disabled:opacity-60"
            >
              {compBusy ? 'Đang lưu...' : 'Lưu thành phần'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// Một dòng giá + tồn kho của biến thể
const VariantRow: React.FC<{
  v: Variant;
  showStock: boolean;
  onSave: (body: VariantUpdateIn) => Promise<void>;
}> = ({ v, showStock, onSave }) => {
  const [price, setPrice] = useState(String(v.price));
  const [stock, setStock] = useState(String(v.stock_quantity));
  const [active, setActive] = useState(v.is_active);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const changed =
    price !== String(v.price) ||
    (showStock && stock !== String(v.stock_quantity)) ||
    active !== v.is_active;

  const save = async () => {
    setErr('');
    const body: VariantUpdateIn = {};

    if (price !== String(v.price)) {
      const p = toInt(price);
      if (p === null) {
        setErr('Giá phải là số nguyên không âm.');
        return;
      }
      body.price = p;
    }
    if (showStock && stock !== String(v.stock_quantity)) {
      const s = toInt(stock);
      if (s === null) {
        setErr('Tồn kho phải là số nguyên không âm.');
        return;
      }
      body.stock_delta = s - v.stock_quantity;
    }
    if (active !== v.is_active) body.is_active = active;

    setBusy(true);
    try {
      await onSave(body);
    } catch {
      // lỗi đã được hiển thị ở khung báo lỗi phía trên
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${
        v.is_active ? 'border-stone-200 bg-white' : 'border-stone-200 bg-stone-50 opacity-70'
      }`}
    >
      <div className="flex-1 min-w-[140px]">
        <p className="font-medium text-stone-900">{v.label}</p>
        {showStock && v.stock_quantity <= LOW_STOCK && (
          <p className="text-[11px] text-rose-600 font-medium">
            {v.stock_quantity <= 0 ? 'Đã hết hàng' : 'Sắp hết hàng'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-[11px] text-stone-500 mb-0.5">Giá (VND)</label>
        <input
          type="text"
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-28 p-2 rounded-lg border border-stone-300 bg-white tabular-nums"
        />
      </div>

      {showStock && (
        <div>
          <label className="block text-[11px] text-stone-500 mb-0.5">Tồn kho</label>
          <input
            type="text"
            inputMode="numeric"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-20 p-2 rounded-lg border border-stone-300 bg-white tabular-nums"
          />
        </div>
      )}

      <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 pt-4">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="accent-stone-900"
        />
        <span>Đang bán</span>
      </label>

      <button
        type="button"
        disabled={!changed || busy}
        onClick={save}
        className="mt-4 py-2 px-3.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? 'Đang lưu...' : 'Lưu'}
      </button>

      {err && <p className="w-full text-[11px] text-red-600">{err}</p>}
    </div>
  );
};

// ===========================================================================
// Thêm sản phẩm mới
// ===========================================================================

interface SizeRow {
  size: string;
  price: string;
  stock: string;
}
interface NewCompRow {
  component_type: 'CANDLE' | 'CARD';
  size_ml: string;
  quantity: string;
}

const NewProductModal: React.FC<{
  scents: Scent[];
  candleSizes: number[];
  onClose: () => void;
  onCreated: () => void;
}> = ({ scents, candleSizes, onClose, onCreated }) => {
  const [type, setType] = useState<ProductKind>('CANDLE');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [burnTime, setBurnTime] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [featured, setFeatured] = useState(false);
  const [allowCustom, setAllowCustom] = useState(true);

  // Nến
  const [sizeRows, setSizeRows] = useState<SizeRow[]>([{ size: '30', price: '', stock: '20' }]);
  const [pickedScents, setPickedScents] = useState<Set<number>>(
    () => new Set(scents.map((s) => s.id))
  );

  // Thiệp và combo
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [compRows, setCompRows] = useState<NewCompRow[]>([
    { component_type: 'CANDLE', size_ml: String(candleSizes[0] ?? ''), quantity: '2' },
  ]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const updateSize = (idx: number, patch: Partial<SizeRow>) =>
    setSizeRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const updateComp = (idx: number, patch: Partial<NewCompRow>) =>
    setCompRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const base = {
      name: name.trim(),
      description: description.trim(),
      story: story.trim() || null,
      burn_time: burnTime.trim() || null,
      ingredients: ingredients.trim() || null,
      featured,
      allow_custom_scent: type === 'CARD' ? false : allowCustom,
      // Schema bắt buộc trường này; chỉ thiệp mới dùng giá trị thật (được ghi đè bên dưới)
      stock_quantity: 0,
    };
    let body: ProductCreateIn;

    if (type === 'CANDLE') {
      if (pickedScents.size === 0) {
        setError('Hãy chọn ít nhất một mùi hương.');
        return;
      }
      const variants = [];
      for (const r of sizeRows) {
        const size = toInt(r.size);
        const p = toInt(r.price);
        const s = toInt(r.stock);
        if (size === null || size <= 0 || p === null || s === null) {
          setError('Mỗi dòng dung tích cần có size, giá và tồn kho là số nguyên không âm.');
          return;
        }
        for (const scentId of pickedScents) {
          variants.push({ scent_id: scentId, size_ml: size, price: p, stock_quantity: s });
        }
      }
      if (variants.length === 0) {
        setError('Hãy thêm ít nhất một dòng dung tích.');
        return;
      }
      body = { ...base, product_type: 'CANDLE', variants };
    } else if (type === 'CARD') {
      const p = toInt(price);
      const s = toInt(stock);
      if (p === null || s === null) {
        setError('Giá và tồn kho phải là số nguyên không âm.');
        return;
      }
      body = { ...base, product_type: 'CARD', price: p, stock_quantity: s };
    } else {
      const p = toInt(price);
      if (p === null) {
        setError('Giá combo phải là số nguyên không âm.');
        return;
      }
      const components: ComponentIn[] = [];
      for (const r of compRows) {
        const qty = toInt(r.quantity);
        if (qty === null || qty <= 0) {
          setError('Số lượng mỗi thành phần phải là số nguyên lớn hơn 0.');
          return;
        }
        if (r.component_type === 'CANDLE') {
          const size = toInt(r.size_ml);
          if (size === null || size <= 0) {
            setError('Hãy chọn dung tích cho các thành phần nến.');
            return;
          }
          components.push({ component_type: 'CANDLE', size_ml: size, quantity: qty });
        } else {
          components.push({ component_type: 'CARD', quantity: qty });
        }
      }
      body = { ...base, product_type: 'COMBO', price: p, components };
    }

    setBusy(true);
    try {
      await createProduct(body);
      onCreated();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Thêm Sản Phẩm Mới" onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-stone-700 font-medium mb-1">Tên sản phẩm:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nến Thơm Nghệ Thuật Mini Glowcard"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-stone-700 font-medium mb-1">Loại sản phẩm:</label>
            <select
              value={type}
              onChange={(e) => {
                const t = e.target.value as ProductKind;
                setType(t);
                setAllowCustom(t !== 'CARD');
              }}
              className={inputCls}
            >
              <option value="CANDLE">Nến thơm</option>
              <option value="CARD">Thiệp sáp thơm</option>
              <option value="COMBO">Combo quà tặng</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Mô tả sản phẩm:</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">
            Câu chuyện sản phẩm (không bắt buộc):
          </label>
          <textarea
            rows={2}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Thời gian tỏa hương:</label>
            <input
              type="text"
              value={burnTime}
              onChange={(e) => setBurnTime(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-stone-700 font-medium mb-1">Thành phần:</label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* --- Nến --- */}
        {type === 'CANDLE' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="font-semibold text-stone-900 block">Dung tích, giá và tồn kho:</span>
              {sizeRows.map((r, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">Dung tích (ml):</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={r.size}
                      onChange={(e) => updateSize(idx, { size: e.target.value })}
                      className="w-24 p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Giá (VND):</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={r.price}
                      onChange={(e) => updateSize(idx, { price: e.target.value })}
                      className="w-32 p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Tồn kho mỗi mùi:</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={r.stock}
                      onChange={(e) => updateSize(idx, { stock: e.target.value })}
                      className="w-24 p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  {sizeRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSizeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSizeRows((prev) => [...prev, { size: '', price: '', stock: '20' }])}
                className="inline-flex items-center gap-1.5 text-amber-800 hover:text-amber-950 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dung tích
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="font-semibold text-stone-900 block">Các mùi hương bán kèm:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {scents.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pickedScents.has(s.id)}
                      onChange={(e) =>
                        setPickedScents((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(s.id);
                          else next.delete(s.id);
                          return next;
                        })
                      }
                      className="accent-stone-900"
                    />
                    <span className="text-stone-800">{s.name_en}</span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-stone-500">
                Hệ thống tạo sẵn một biến thể cho mỗi cặp (mùi, dung tích) được chọn.
              </p>
            </div>
          </div>
        )}

        {/* --- Thiệp --- */}
        {type === 'CARD' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Giá bán (VND):</label>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Tồn kho:</label>
              <input
                type="text"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputCls}
              />
            </div>
            <p className="col-span-2 text-[11px] text-stone-500">
              Hiện chỉ hỗ trợ một sản phẩm thiệp đang bán. Mùi hương của thiệp chưa được cấu hình.
            </p>
          </div>
        )}

        {/* --- Combo --- */}
        {type === 'COMBO' && (
          <div className="space-y-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Giá combo (VND):</label>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`${inputCls} sm:w-1/2`}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="font-semibold text-stone-900 block">Thành phần combo:</span>
              {compRows.map((r, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">Loại:</label>
                    <select
                      value={r.component_type}
                      onChange={(e) =>
                        updateComp(idx, {
                          component_type: e.target.value as 'CANDLE' | 'CARD',
                          size_ml: '',
                        })
                      }
                      className="p-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="CANDLE">Nến thơm</option>
                      <option value="CARD">Thiệp sáp thơm</option>
                    </select>
                  </div>
                  {r.component_type === 'CANDLE' && (
                    <div>
                      <label className="block text-stone-600 mb-1">Dung tích:</label>
                      <select
                        value={r.size_ml}
                        onChange={(e) => updateComp(idx, { size_ml: e.target.value })}
                        className="p-2 rounded-lg border border-stone-300 bg-white"
                      >
                        <option value="">Chọn...</option>
                        {candleSizes.map((s) => (
                          <option key={s} value={s}>
                            {s}ml
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-stone-600 mb-1">Số lượng:</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={r.quantity}
                      onChange={(e) => updateComp(idx, { quantity: e.target.value })}
                      className="w-20 p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  {compRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCompRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Xóa thành phần này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setCompRows((prev) => [
                    ...prev,
                    { component_type: 'CARD', size_ml: '', quantity: '1' },
                  ])
                }
                className="inline-flex items-center gap-1.5 text-amber-800 hover:text-amber-950 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm thành phần
              </button>
            </div>
          </div>
        )}

        {/* Tùy chọn chung */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-stone-900"
            />
            <span className="text-stone-800">Hiển thị ở mục sản phẩm nổi bật trên trang chủ</span>
          </label>
          {type !== 'CARD' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowCustom}
                onChange={(e) => setAllowCustom(e.target.checked)}
                className="accent-amber-800"
              />
              <span className="text-stone-800 font-medium">
                Cho phép khách yêu cầu mùi hương phối chế riêng (không phụ thu)
              </span>
            </label>
          )}
        </div>

        <ErrorBox message={error} />

        <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={busy}
            className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-sm disabled:opacity-60"
          >
            {busy ? 'Đang lưu...' : 'Lưu sản phẩm mới'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ===========================================================================
// Thêm / sửa mùi hương
// ===========================================================================

const ScentModal: React.FC<{
  scent: Scent | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ scent, onClose, onSaved }) => {
  const [nameVi, setNameVi] = useState(scent?.name_vi ?? '');
  const [nameEn, setNameEn] = useState(scent?.name_en ?? '');
  const [description, setDescription] = useState(scent?.description ?? '');
  const [notes, setNotes] = useState(scent?.notes ?? '');
  const [addToCandles, setAddToCandles] = useState(true);
  const [initialStock, setInitialStock] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (scent) {
        await updateScent(scent.id, {
          name_vi: nameVi.trim(),
          name_en: nameEn.trim(),
          description: description.trim() || null,
          notes: notes.trim() || null,
        });
      } else {
        const stock = toInt(initialStock);
        if (stock === null) {
          setError('Tồn kho ban đầu phải là số nguyên không âm.');
          setBusy(false);
          return;
        }
        await createScent({
          name_vi: nameVi.trim(),
          name_en: nameEn.trim(),
          description: description.trim() || null,
          notes: notes.trim() || null,
          add_to_candles: addToCandles,
          initial_stock: stock,
        });
      }
      onSaved();
    } catch (err) {
      setError(adminErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title={scent ? 'Chỉnh Sửa Mùi Hương' : 'Thêm Mùi Hương Mới'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Tên tiếng Việt:</label>
            <input
              type="text"
              required
              value={nameVi}
              onChange={(e) => setNameVi(e.target.value)}
              placeholder="Oải Hương (Lavender)"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-stone-700 font-medium mb-1">Tên tiếng Anh:</label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Lavender"
              className={inputCls}
            />
          </div>
        </div>
        {scent && (
          <p className="text-[11px] text-stone-500">
            Đổi tên tiếng Anh sẽ đổi luôn nhãn của các biến thể (ví dụ "30ml - Lavender").
          </p>
        )}

        <div>
          <label className="block text-stone-700 font-medium mb-1">Mô tả ngắn:</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Tầng hương:</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Hương đầu: ... · Hương giữa: ... · Hương cuối: ..."
            className={inputCls}
          />
        </div>

        {!scent && (
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addToCandles}
                onChange={(e) => setAddToCandles(e.target.checked)}
                className="accent-stone-900"
              />
              <span className="text-stone-800 font-medium">
                Tự thêm mùi này vào các sản phẩm nến đang bán (đủ mọi dung tích)
              </span>
            </label>
            {addToCandles && (
              <div>
                <label className="block text-stone-600 mb-1">Tồn kho ban đầu mỗi dung tích:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  className="w-28 p-2 rounded-lg border border-stone-300 bg-white"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Giá lấy theo giá hiện có của từng dung tích. Có thể chỉnh lại trong từng sản phẩm.
                </p>
              </div>
            )}
          </div>
        )}

        <ErrorBox message={error} />

        <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={busy}
            className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-sm disabled:opacity-60"
          >
            {busy ? 'Đang lưu...' : scent ? 'Cập nhật mùi hương' : 'Lưu mùi hương mới'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
