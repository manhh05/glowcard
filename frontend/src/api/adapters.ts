import type { CandleSize, Product, ProductType as UiProductType } from '../types';
import type { ProductDetail, ProductListItem, ProductType } from './types';

const TYPE_MAP: Record<ProductType, UiProductType> = {
  CANDLE: 'candle',
  CARD: 'wax_card',
  COMBO: 'combo',
};

const CATEGORY_NAME: Record<ProductType, string> = {
  CANDLE: 'Nến thơm',
  CARD: 'Thiệp sáp thơm',
  COMBO: 'Combo',
};

export const toUiSize = (ml: number) => `${ml}ml` as CandleSize;

type ApiProduct = ProductListItem &
  Partial<Pick<ProductDetail, 'story' | 'burn_time' | 'ingredients'>>;

export function toProduct(p: ApiProduct): Product {
  const apiType = p.product_type as ProductType;
  const isCombo = apiType === 'COMBO';
  const candleCount = p.combo_candle_count ?? 0;
  const cardCount = p.combo_card_count ?? 0;
  const candleSize = p.combo_candle_size ? toUiSize(p.combo_candle_size) : undefined;

  return {
    id: p.slug, // frontend dùng slug làm id trên URL
    name: p.name,
    type: TYPE_MAP[apiType],
    description: p.description,
    story: p.story ?? undefined,
    price: p.price_from,
    image: p.image_url ?? '',
    stock: p.in_stock ? 1 : 0,
    inStock: p.in_stock,
    availableSizes: apiType === 'CANDLE' ? p.available_sizes.map(toUiSize) : undefined,
    availableScents: p.scents.map((s) => s.name_vi),
    allowCustomScent: p.allow_custom_scent,
    comboConfig: isCombo
      ? {
          candleCount,
          candleSize,
          waxCardCount: cardCount,
          descriptionVi:
            `${candleCount} nến${candleSize ? ` ${candleSize}` : ''}` +
            (cardCount ? ` + ${cardCount} thiệp sáp thơm` : ''),
        }
      : undefined,
    burnTime: p.burn_time ?? undefined,
    ingredients: p.ingredients ?? undefined,
    featured: p.featured,
    categoryNameVi: CATEGORY_NAME[apiType],
  };
}