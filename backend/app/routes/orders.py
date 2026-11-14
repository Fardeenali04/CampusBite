
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    DeliveryStatusUpdate,
    DeliveryPartnerAssign
)

router = APIRouter(prefix="/orders", tags=["Orders"])


# Customer: Place an order
@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("CUSTOMER"))
):
    from app.models.menu_item import MenuItem
    from decimal import Decimal
    from uuid import uuid4

    try:
        restaurant = db.query(Restaurant).filter(
            Restaurant.id == order_data.restaurant_id,
            Restaurant.is_available.is_(True)
        ).first()

        if not restaurant:
            raise HTTPException(404, "Restaurant not found or unavailable")

        quantities = {}
        for entry in order_data.items:
            quantities[entry.menu_item_id] = (
                quantities.get(entry.menu_item_id, 0) + entry.quantity
            )

        menu_items = db.query(MenuItem).filter(
            MenuItem.restaurant_id == restaurant.id,
            MenuItem.id.in_(quantities.keys()),
            MenuItem.is_available.is_(True)
        ).all()

        if len(menu_items) != len(quantities):
            raise HTTPException(400, "Invalid or unavailable menu items")

        total_amount = sum(
            (item.price * quantities[item.id] for item in menu_items),
            Decimal("0.00")
        )

        new_order = Order(
            customer_id=current_user.id,
            restaurant_id=restaurant.id,
            delivery_address=order_data.delivery_address,
            total_amount=total_amount,
            status="PLACED"
        )

        db.add(new_order)
        db.flush()

        for item in menu_items:
            db.add(OrderItem(
                order_id=new_order.id,
                menu_item_id=item.id,
                quantity=quantities[item.id],
                unit_price=item.price
            ))

        db.add(Payment(
            order_id=new_order.id,
            amount=total_amount,
            payment_method="DUMMY",
            status="MOCK_PAID",
            transaction_reference=f"MOCK-{uuid4().hex[:12].upper()}"
        ))

        db.commit()
        db.refresh(new_order)
        return new_order

    except Exception:
        db.rollback()
        raise


# Customer: View own orders
@router.get("/my-orders", response_model=list[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("CUSTOMER"))
):
    return db.query(Order).filter(
        Order.customer_id == current_user.id
    ).order_by(Order.placed_at.desc()).all()


# Owner: View restaurant orders
@router.get("/owner-orders", response_model=list[OrderResponse])
def get_owner_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    return db.query(Order).filter(
        Order.restaurant_id == restaurant.id
    ).order_by(Order.placed_at.desc()).all()


# Owner: Accept, prepare or mark order ready
@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == restaurant.id
    ).first()

    if not order:
        raise HTTPException(404, "Order not found")

    allowed_transitions = {
        "PLACED": "ACCEPTED",
        "ACCEPTED": "PREPARING",
        "PREPARING": "READY"
    }

    if allowed_transitions.get(order.status) != status_data.status:
        raise HTTPException(400, f"Invalid transition from {order.status} to {status_data.status}")

    order.status = status_data.status
    db.commit()
    db.refresh(order)
    return order


# Owner: Assign delivery partner
@router.patch("/{order_id}/assign", response_model=OrderResponse)
def assign_delivery_partner(
    order_id: int,
    assignment: DeliveryPartnerAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == restaurant.id
    ).first()

    if not order:
        raise HTTPException(404, "Order not found")

    if order.status != "READY":
        raise HTTPException(400, "Only READY orders can be assigned")

    partner = db.query(User).filter(
        User.id == assignment.delivery_partner_id,
        User.role == "DELIVERY_PARTNER",
        User.is_active.is_(True)
    ).first()

    if not partner:
        raise HTTPException(404, "Active delivery partner not found")

    order.delivery_partner_id = partner.id
    order.status = "ASSIGNED"

    db.commit()
    db.refresh(order)
    return order


# Delivery partner: View assigned orders
@router.get("/delivery-orders", response_model=list[OrderResponse])
def get_delivery_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("DELIVERY_PARTNER"))
):
    return db.query(Order).filter(
        Order.delivery_partner_id == current_user.id
    ).order_by(Order.placed_at.desc()).all()


# Delivery partner: Update delivery status
@router.patch("/{order_id}/delivery-status", response_model=OrderResponse)
def update_delivery_status(
    order_id: int,
    status_data: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("DELIVERY_PARTNER"))
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.delivery_partner_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(404, "Assigned order not found")

    allowed_transitions = {
        "ASSIGNED": "OUT_FOR_DELIVERY",
        "OUT_FOR_DELIVERY": "DELIVERED"
    }

    if allowed_transitions.get(order.status) != status_data.status:
        raise HTTPException(400, f"Invalid transition from {order.status} to {status_data.status}")

    order.status = status_data.status
    db.commit()
    db.refresh(order)
    return order


# Customer: Cancel an order only while PLACED
@router.patch("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("CUSTOMER"))
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(404, "Order not found")

    if order.status != "PLACED":
        raise HTTPException(400, "Only PLACED orders can be cancelled")

    order.status = "CANCELLED"

    db.commit()
    db.refresh(order)
    return order
