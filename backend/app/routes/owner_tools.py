
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.menu_item import MenuItem

router = APIRouter(prefix="/owner-tools", tags=["Owner Tools"])


def get_owner_restaurant(db: Session, owner_id: int):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == owner_id
    ).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return restaurant


@router.get("/menu")
def get_owner_menu(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER")),
):
    restaurant = get_owner_restaurant(db, current_user.id)

    return db.query(MenuItem).filter(
        MenuItem.restaurant_id == restaurant.id
    ).order_by(MenuItem.id.desc()).all()


@router.get("/delivery-partners")
def get_delivery_partners(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER")),
):
    get_owner_restaurant(db, current_user.id)

    partners = db.query(User).filter(
        User.role == "DELIVERY_PARTNER",
        User.is_active.is_(True),
    ).order_by(User.full_name).all()

    return [
        {
            "id": partner.id,
            "full_name": partner.full_name,
            "phone": partner.phone,
        }
        for partner in partners
    ]
