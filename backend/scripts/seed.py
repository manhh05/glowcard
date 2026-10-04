from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import ComboComponent, Product, ProductVariant, Scent

DEFAULT_STOCK = 20  # tồn kho tạm, sửa sau trong admin

CANDLE_PRICES = {30: 35000, 50: 39000}
CARD_PRICE = 29000

SCENTS = [
    ("gardenia", "Hoa Dành Dành (Gardenia)", "Gardenia",
     "Hương hoa trắng thuần khiết, thanh tao và dịu ngọt quyến rũ.",
     "Hương đầu: Cam bergamot · Hương giữa: Hoa dành dành, Huệ tây · Hương cuối: Gỗ tuyết tùng"),
    ("jasmine", "Hoa Nhài Tinh Khiết (Jasmine)", "Jasmine",
     "Hương hoa nhài ban mai thơm ngát, tạo cảm giác thư giãn và an yên tâm hồn.",
     "Hương đầu: Trà xanh · Hương giữa: Nhài sambac · Hương cuối: Xạ hương trắng"),
    ("peach", "Đào Ngọt Mọng Nước (Peach)", "Peach",
     "Vị ngọt mọng, tươi vui và ấm áp của trái đào chín mọng dưới ánh nắng.",
     "Hương đầu: Mơ chín · Hương giữa: Quả đào, Mật ong · Hương cuối: Vani mềm mại"),
    ("sweet_orange", "Cam Ngọt Ấm Nắng (Sweet Orange)", "Sweet Orange",
     "Năng lượng tươi mới từ tinh dầu vỏ cam, kích thích sự sáng tạo và phấn chấn.",
     "Hương đầu: Vỏ cam vàng · Hương giữa: Hoa cam Neroli · Hương cuối: Hổ phách"),
    ("ebonywood", "Gỗ Mun Trầm Lắng (Ebonywood)", "Ebonywood",
     "Mùi hương gỗ trầm ấm, sang trọng, mang lại chiều sâu và tĩnh tại cho không gian.",
     "Hương đầu: Tiêu hồng · Hương giữa: Gỗ mun, Khói nhẹ · Hương cuối: Đàn hương, Hoắc hương"),
    ("sakura", "Hoa Anh Đào (Sakura)", "Sakura",
     "Hương phấn hoa anh đào mùa xuân phảng phất nhẹ nhàng, nữ tính và trong trẻo.",
     "Hương đầu: Quả mọng đỏ · Hương giữa: Hoa anh đào, Hoa hồng trắng · Hương cuối: Gỗ xạ"),
]

COMBOS = [
    dict(
        slug="combo-1-hai-nen-30ml-mot-thiep-sap",
        name="Combo Yêu Thương: 2 Nến 30ml + 1 Thiệp Sáp Thơm",
        description="Bộ quà tặng hài hòa gồm 2 nến thơm 30ml tự chọn mùi riêng biệt cho từng nến và 1 thiệp sáp thơm treo hoa khô tinh xảo, kèm hộp quà kraft mộc mạc.",
        story="Lựa chọn lý tưởng để trải nghiệm nhiều tầng hương hoặc làm quà sinh nhật, kỷ niệm đầy ý nghĩa.",
        image_url="/images/combo-1.svg",
        ingredients="Hộp quà kraft cao cấp, ruy băng lụa, diêm đốt nến an toàn, thiệp viết tay",
        featured=True,
        price=69000,
        components=[("CANDLE", 30, 2), ("CARD", None, 1)],
    ),
    dict(
        slug="combo-2-hai-nen-50ml-mot-thiep-sap",
        name="Combo Trọn Vẹn: 2 Nến 50ml + 1 Thiệp Sáp Thơm",
        description="Set quà cao cấp với 2 hũ nến lớn 50ml cho thời gian thắp lâu dài và 1 thiệp sáp thơm treo sang trọng. Tự do phối 2 nốt hương theo gu sở thích.",
        story="Mang đến không gian ấm áp sang trọng cho ngôi nhà của bạn, hoặc món quà đẳng cấp dành cho đối tác và người thương.",
        image_url="/images/combo-2.svg",
        ingredients="Hộp quà cứng nam châm cao cấp, ruy băng nhung, que diêm dài tiện lợi",
        featured=True,
        price=99000,
        components=[("CANDLE", 50, 2), ("CARD", None, 1)],
    ),
    dict(
        slug="combo-3-bon-nen-30ml",
        name="Combo Khám Phá: 4 Nến Thơm 30ml",
        description="Bộ sưu tập 4 mùi hương nến 30ml khác biệt. Quý khách có thể tự do phối 4 nốt hương yêu thích hoặc yêu cầu mùi hương phối chế riêng biệt.",
        story="Thích hợp cho những ai thích thay đổi hương thơm theo từng tâm trạng và thời điểm trong tuần.",
        image_url="/images/combo-3.svg",
        ingredients="Set 4 hũ nến trong khay định hình giấy chống sốc thân thiện môi trường",
        featured=False,
        price=89000,
        components=[("CANDLE", 30, 4)],
    ),
    dict(
        slug="combo-4-bon-nen-50ml",
        name="Combo Thượng Hạng: 4 Nến Thơm 50ml",
        description="Bộ sưu tập thượng hạng gồm 4 nến thơm dung tích lớn 50ml. Tùy chọn 4 mùi hương riêng biệt cho từng nến, đóng gói hộp quà nghệ thuật.",
        story="Món quà trọn vẹn và trang trọng nhất của Glowcard, thắp sáng không gian sống của bạn suốt nhiều tháng.",
        image_url="/images/combo-4.svg",
        ingredients="Hộp quà cứng cao cấp, lót lụa mềm, túi giấy Glowcard và thiệp chúc mừng",
        featured=True,
        price=139000,
        components=[("CANDLE", 50, 4)],
    ),
]


def seed() -> None:
    with SessionLocal() as db:
        # 1. Scents
        scents: dict[str, Scent] = {}
        for slug, name_vi, name_en, desc, notes in SCENTS:
            scent = db.scalar(select(Scent).where(Scent.slug == slug))
            if scent is None:
                scent = Scent(
                    slug=slug, name_vi=name_vi, name_en=name_en,
                    description=desc, notes=notes,
                )
                db.add(scent)
            scents[slug] = scent
        db.flush()

        # 2. Candle: 1 sản phẩm, 12 variant (size x mùi)
        if not db.scalar(select(Product).where(Product.slug == "nen-thom-glowcard")):
            candle = Product(
                slug="nen-thom-glowcard",
                name="Nến Thơm Hũ Thủy Tinh Hổ Phách Glowcard",
                product_type="CANDLE",
                description="Nến thơm thủ công từ 100% sáp đậu nành tự nhiên phối hợp cùng tinh dầu cao cấp. Hũ thủy tinh nâu cổ điển giúp ánh nến dịu êm và khuếch tán hương thơm ấm cúng.",
                story="Mỗi hũ nến Glowcard được rót tay thủ công cẩn trọng, bấc cotton tự nhiên không khói đen, an toàn cho không gian sống và giấc ngủ của bạn.",
                image_url="/images/candle-classic.svg",
                burn_time="15-20 giờ (30ml) / 30-35 giờ (50ml)",
                ingredients="100% sáp đậu nành thiên nhiên, tinh dầu nhập khẩu cao cấp, bấc cotton",
                featured=True,
                allow_custom_scent=True,
            )
            db.add(candle)
            db.flush()
            for size, price in CANDLE_PRICES.items():
                for scent in scents.values():
                    db.add(ProductVariant(
                        product_id=candle.id, scent_id=scent.id, size_ml=size,
                        label=f"{size}ml - {scent.name_en}",
                        price=price, stock_quantity=DEFAULT_STOCK,
                    ))

        # 3. Card: 1 sản phẩm, 1 variant. Scent của thiệp chưa chốt nên scent_id = NULL.
        if not db.scalar(select(Product).where(Product.slug == "thiep-sap-thom")):
            card = Product(
                slug="thiep-sap-thom",
                name="Thiệp Sáp Thơm Treo Trang Trí Hoa Khô",
                product_type="CARD",
                description="Thiệp sáp thơm nghệ thuật phối hoa khô tự nhiên, thích hợp treo tủ quần áo, góc bàn làm việc, ô tô hoặc đính kèm hộp quà tặng sang trọng.",
                story="Sự hòa quyện giữa hương thơm tinh dầu và vẻ đẹp vĩnh cửu của những nhành hoa bất tử, giúp lưu hương tự nhiên từ 2 đến 3 tháng.",
                image_url="/images/wax-card.svg",
                burn_time="Lưu hương 60-90 ngày",
                ingredients="Sáp đậu nành kết tinh, tinh dầu thơm, hoa khô tự nhiên ép thủ công",
                featured=True,
                allow_custom_scent=False,
            )
            db.add(card)
            db.flush()
            db.add(ProductVariant(
                product_id=card.id, label="Thiệp sáp thơm",
                price=CARD_PRICE, stock_quantity=DEFAULT_STOCK,
            ))

        # 4. Combos: giá riêng, không có kho riêng (stock = 0, không dùng)
        for c in COMBOS:
            if db.scalar(select(Product).where(Product.slug == c["slug"])):
                continue
            combo = Product(
                slug=c["slug"], name=c["name"], product_type="COMBO",
                description=c["description"], story=c["story"],
                image_url=c["image_url"], ingredients=c["ingredients"],
                featured=c["featured"], allow_custom_scent=True,
            )
            db.add(combo)
            db.flush()
            db.add(ProductVariant(
                product_id=combo.id, label=c["name"], price=c["price"],
                stock_quantity=0,
            ))
            for ctype, size, qty in c["components"]:
                db.add(ComboComponent(
                    combo_product_id=combo.id, component_type=ctype,
                    size_ml=size, quantity=qty,
                ))

        db.commit()
        print("Seed xong.")


if __name__ == "__main__":
    seed()