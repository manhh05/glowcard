from pydantic import BaseModel, ConfigDict


class ScentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name_vi: str
    name_en: str
    description: str | None
    notes: str | None


class ScentBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name_vi: str
    name_en: str


class VariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    size_ml: int | None
    price: int
    stock_quantity: int
    scent: ScentOut | None


class ComboComponentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    component_type: str
    size_ml: int | None
    quantity: int


class ProductListItem(BaseModel):
    id: int
    slug: str
    name: str
    product_type: str
    description: str
    image_url: str | None
    featured: bool
    allow_custom_scent: bool
    price_from: int
    in_stock: bool
    available_sizes: list[int]
    scents: list[ScentBrief]
    combo_candle_count: int | None
    combo_candle_size: int | None
    combo_card_count: int | None


class ProductDetail(ProductListItem):
    story: str | None
    burn_time: str | None
    ingredients: str | None
    variants: list[VariantOut]
    components: list[ComboComponentOut]
    # Chỉ có với combo: các nến (đúng size của combo) để chọn mùi cho từng cây
    candle_variants: list[VariantOut]