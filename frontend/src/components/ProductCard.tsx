import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatVND } from '../utils/formatters';
import { ProductArtwork } from './ProductArtwork';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-[#EADBCE] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Visual Slot - 65% - 75% height on clean neutral backdrop */}
      <div className="relative aspect-4/3 w-full bg-[#FAF6F0] overflow-hidden border-b border-[#F0E6DB]">
        <ProductArtwork type={product.type} title={product.name} />
        
        {/* Subtle unboxed metadata overlay */}
        {product.allowCustomScent && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium text-amber-900 border border-amber-200/60 shadow-2xs">
            Hỗ trợ mùi hương tuỳ chỉnh
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1">
          {/* Category - Clean unboxed text */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>{product.categoryNameVi}</span>
            {product.availableSizes && product.availableSizes.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.availableSizes.join(' / ')}</span>
              </>
            )}
            {product.comboConfig && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.comboConfig.candleCount} nến tự chọn</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-stone-400 block">Giá từ</span>
            <span className="text-base font-semibold text-stone-900 tabular-nums">
              {formatVND(product.price)}
            </span>
          </div>

          <span className="text-xs font-medium text-amber-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Xem chi tiết →
          </span>
        </div>
      </div>
    </Link>
  );
};
