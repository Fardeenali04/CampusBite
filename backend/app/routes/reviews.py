
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.order import Order
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# Customer: Review a delivered order
@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("CUSTOMER"))
):
    order = db.query(Order).filter(
        Order.id == review_data.order_id,
        Order.customer_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(404, "Order not found")

    if order.status != "DELIVERED":
        raise HTTPException(400, "You can review only delivered orders")

    existing_review = db.query(Review).filter(
        Review.order_id == order.id,
        Review.customer_id == current_user.id
    ).first()

    if existing_review:
        raise HTTPException(409, "You have already reviewed this order")

    review = Review(
        order_id=order.id,
        customer_id=current_user.id,
        restaurant_id=order.restaurant_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    try:
        db.add(review)
        db.commit()
        db.refresh(review)
        return review
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "A review for this order already exists")

# Public: View reviews for a restaurant
@router.get(
    "/restaurant/{restaurant_id}",
    response_model=list[ReviewResponse]
)
def get_restaurant_reviews(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Review).filter(
        Review.restaurant_id == restaurant_id
    ).order_by(Review.created_at.desc()).all()