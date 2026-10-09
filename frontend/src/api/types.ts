import type { components } from './schema';

type Schemas = components['schemas'];

export type ProductListItem = Schemas['ProductListItem'];
export type ProductDetail = Schemas['ProductDetail'];
export type ProductVariant = Schemas['VariantOut'];
export type Scent = Schemas['ScentOut'];
export type ComboComponent = Schemas['ComboComponentOut'];

export type ProductType = 'CANDLE' | 'CARD' | 'COMBO';