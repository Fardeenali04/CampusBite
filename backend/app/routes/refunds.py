
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.order import Order
from app.models.payment import Payment
from app.models.refund import Refund
from app.schemas.refund import (
    RefundCreate,
    RefundReview,
    RefundResponse
)

router = APIRouter(prefix="/refunds", tags=["Refunds"])

# Customer: Request a refund
@router.post("/", response_model=RefundResponse, status_code=201)
def create_refund_request(
    refund_data: RefundCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("CUSTOMER"))
):
    order = db.query(Order).filter(
        Order.id == refund_data.order_id,
        Order.customer_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(404, "Order not found")

    if order.status != "DELIVERED":
        raise HTTPException(400, "Refunds can only be requested for delivered orders")

    existing_refund = db.query(Refund).filter(
        Refund.order_id == order.id
    ).first()

    if existing_refund:
        raise HTTPException(409, "A refund request already exists for this order")

    payment = db.query(Payment).filter(
        Payment.order_id == order.id
    ).first()

    if not payment or payment.status != "MOCK_PAID":
        raise HTTPException(400, "No eligible payment found for this order")

    refund = Refund(
        order_id=order.id,
        customer_id=current_user.id,
        amount=order.total_amount,
        reason=refund_data.reason,
        status="PENDING"
    )

    try:
        db.add(refund)
        db.commit()
        db.refresh(refund)
        return refund
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "A refund request already exists")

# Owner: View refund requests for their restaurant
@router.get("/owner-requests", response_model=list[RefundResponse])
def get_owner_refund_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    return (
        db.query(Refund)
        .join(Order, Refund.order_id == Order.id)
        .filter(Order.restaurant_id == restaurant.id)
        .order_by(Refund.created_at.desc())
        .all()
    )

# Owner: Approve or reject a refund request
@router.patch("/{refund_id}/decision", response_model=RefundResponse)
def review_refund_request(
    refund_id: int,
    decision: RefundReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    refund = (
        db.query(Refund)
        .join(Order, Refund.order_id == Order.id)
        .filter(
            Refund.id == refund_id,
            Order.restaurant_id == restaurant.id
        )
        .first()
    )

    if not refund:
        raise HTTPException(404, "Refund request not found")

    if refund.status != "PENDING":
        raise HTTPException(400, "This refund request has already been reviewed")

    order = db.query(Order).filter(
        Order.id == refund.order_id
    ).first()

    payment = db.query(Payment).filter(
        Payment.order_id == refund.order_id
    ).first()

    if not order or not payment:
        raise HTTPException(404, "Order or payment record not found")

    if decision.status == "APPROVED":
        if order.status != "DELIVERED" or payment.status != "MOCK_PAID":
            raise HTTPException(400, "Order or payment is no longer eligible for refund")

        refund.status = "APPROVED"
        order.status = "REFUNDED"
        payment.status = "REFUNDED"

    else:
        refund.status = "REJECTED"

    from datetime import datetime, timezone
    refund.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(refund)
    return refund