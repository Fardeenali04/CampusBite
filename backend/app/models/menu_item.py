
from decimal import Decimal

from sqlalchemy import (
    String,
    Text,
    Boolean,
    Numeric,
    ForeignKey,
    CheckConstraint
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    __table_args__ = (
        CheckConstraint("price >= 0", name="check_menu_item_price"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    is_vegetarian: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )