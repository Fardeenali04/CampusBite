
from fastapi import APIRouter, Depends, HTTPException, status , Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.menu_item import MenuItem
from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemResponse
)

router = APIRouter(prefix="/menu", tags=["Menu"])


# Add a menu item (Owner only)
@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    new_item = MenuItem(
        restaurant_id=restaurant.id,
        **item_data.model_dump()
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item



from fastapi import Query

# Browse and filter a restaurant's available menu (Public)
@router.get(
    "/restaurant/{restaurant_id}",
    response_model=list[MenuItemResponse]
)
def get_restaurant_menu(
    restaurant_id: int,
    search: str | None = None,
    category: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.is_available == True
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found or unavailable"
        )

    query = db.query(MenuItem).filter(
        MenuItem.restaurant_id == restaurant_id,
        MenuItem.is_available == True
    )

    if search:
        query = query.filter(
            MenuItem.name.ilike(f"%{search}%")
        )

    if category:
        query = query.filter(
            MenuItem.category.ilike(category)
        )

    return query.offset(skip).limit(limit).all()


# Update a menu item (Owner only)
@router.patch("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: int,
    item_data: MenuItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    item = db.query(MenuItem).join(Restaurant).filter(
        MenuItem.id == item_id,
        Restaurant.owner_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    update_data = item_data.model_dump(exclude_unset=True)

    if any(update_data.get(field) is None for field in ("name", "price", "category") if field in update_data):
        raise HTTPException(
            status_code=422,
            detail="Name, price and category cannot be null"
        )

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


# Delete a menu item (Owner only)
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    item = db.query(MenuItem).join(Restaurant).filter(
        MenuItem.id == item_id,
        Restaurant.owner_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    db.delete(item)
    db.commit()
