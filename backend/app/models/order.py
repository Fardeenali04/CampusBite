
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.order_item import OrderItem

from sqlalchemy import (
    String,
    Numeric,
    DateTime,
    ForeignKey,
    CheckConstraint
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    __table_args__ = (
        CheckConstraint(
            "status IN ('PLACED', 'ACCEPTED', 'PREPARING', "
            "'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY', "
            "'DELIVERED', 'CANCELLED', 'REFUNDED')",
            name="check_order_status"
        ),
        CheckConstraint("total_amount >= 0", name="check_order_total"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id"),
        nullable=False,
        index=True
    )

    delivery_partner_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    delivery_address: Mapped[str] = mapped_column(
        String(500), nullable=False
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30), default="PLACED", nullable=False, index=True
    )

    placed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    items: Mapped[list["OrderItem"]] = relationship(
    "OrderItem",
    cascade="all, delete-orphan"
    )