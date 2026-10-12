import type { components } from './schema';

type Schemas = components['schemas'];

export type ProductListItem = Schemas['ProductListItem'];
export type ProductDetail = Schemas['ProductDetail'];
export type ProductVariant = Schemas['VariantOut'];
export type Scent = Schemas['ScentOut'];
export type ComboComponent = Schemas['ComboComponentOut'];

export type ProductType = 'CANDLE' | 'CARD' | 'COMBO';
export type ScentBrief = Schemas['ScentBrief'];

export type TokenOut = Schemas['TokenOut'];
export type UserOut = Schemas['UserOut'];
export type UserUpdate = Schemas['UserUpdate'];
export type AddressOut = Schemas['AddressOut'];
export type AddressIn = Schemas['AddressIn'];
export type AddressUpdate = Schemas['AddressUpdate'];
export type RegisterIn = Schemas['RegisterIn'];
export type LoginIn = Schemas['LoginIn'];
export type AdminLoginIn = Schemas['AdminLoginIn'];
export type AdminMeOut = Schemas['AdminMeOut'];