
from collections import Counter
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.menu_item import MenuItem
from app.schemas.ai import InsightRequest, InsightResponse

router = APIRouter(prefix="/ai", tags=["Order Insights"])


@router.post("/insights", response_model=InsightResponse)
def get_order_insights(
    request: InsightRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("CUSTOMER"))
):
    orders = (
        db.query(Order)
        .filter(Order.customer_id == current_user.id)
        .order_by(Order.placed_at.desc())
        .limit(50)
        .all()
    )

    if not orders:
        raise HTTPException(404, "You have no order history yet")

    order_ids = [order.id for order in orders]

    item_rows = (
        db.query(OrderItem, MenuItem)
        .join(MenuItem, MenuItem.id == OrderItem.menu_item_id)
        .filter(OrderItem.order_id.in_(order_ids))
        .all()
    )

    question = request.question.lower()

    total_spent = sum(
        (
            Decimal(str(order.total_amount))
            for order in orders
            if order.status != "REFUNDED"
        ),
        Decimal("0.00")
    )

    refunded_total = sum(
        (
            Decimal(str(order.total_amount))
            for order in orders
            if order.status == "REFUNDED"
        ),
        Decimal("0.00")
    )

    pending_orders = [
        order for order in orders
        if order.status in [
            "PLACED", "ACCEPTED", "PREPARING",
            "READY", "ASSIGNED", "OUT_FOR_DELIVERY"
        ]
    ]

    dish_counts = Counter()
    for order_item, menu_item in item_rows:
        dish_counts[menu_item.name] += order_item.quantity

    if any(word in question for word in ["spend", "spent", "cost", "money"]):
        answer = (
            f"Your total non-refunded order spending is ₹{total_spent:.2f}. "
            f"You also have ₹{refunded_total:.2f} in refunded orders."
        )

    elif any(word in question for word in ["most", "popular", "frequent", "favourite", "favorite"]):
        if dish_counts:
            name, quantity = dish_counts.most_common(1)[0]
            answer = f"Your most frequently ordered dish is {name}, ordered {quantity} times."
        else:
            answer = "No dish information is available."

    elif any(word in question for word in ["pending", "active", "not delivered", "processing"]):
        if pending_orders:
            details = [
                f"Order #{order.id}: {order.status}"
                for order in pending_orders
            ]
            answer = "Your active orders are: " + "; ".join(details)
        else:
            answer = "You currently have no active orders."

    elif any(word in question for word in ["refund", "refunded"]):
        refunded_orders = [
            order for order in orders
            if order.status == "REFUNDED"
        ]
        answer = (
            f"You have {len(refunded_orders)} refunded order(s), "
            f"totalling ₹{refunded_total:.2f}."
        )

    else:
        recent_orders = orders[:5]
        details = [
            f"Order #{order.id}: {order.status}, ₹{order.total_amount}"
            for order in recent_orders
        ]

        answer = (
            f"You have {len(orders)} orders in your recent order history. "
            f"Your non-refunded spending is ₹{total_spent:.2f}. "
            f"Your active orders: {len(pending_orders)}. "
            f"Recent orders: {'; '.join(details)}."
        )

    return InsightResponse(
        answer=answer,
        orders_analyzed=len(orders)
    )
