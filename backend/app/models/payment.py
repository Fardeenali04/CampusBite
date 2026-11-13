
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    String,
    Numeric,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING', 'MOCK_PAID', 'FAILED', 'REFUNDED')",
            name="check_payment_status"
        ),
        CheckConstraint("amount >= 0", name="check_payment_amount"),
        UniqueConstraint("order_id", name="unique_order_payment"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False,
        index=True
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )

    payment_method: Mapped[str] = mapped_column(
        String(50), nullable=False, default="DUMMY"
    )

    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="PENDING"
    )

    transaction_reference: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
