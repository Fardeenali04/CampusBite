
from fastapi import APIRouter, Depends, HTTPException, status , Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.restaurant import Restaurant
from app.schemas.restaurant import (
    RestaurantCreate,
    RestaurantResponse,
    RestaurantUpdate
)

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.post(
    "/",
    response_model=RestaurantResponse,
    status_code=status.HTTP_201_CREATED
)
def create_restaurant(
    restaurant_data: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    # Check whether this owner already has a restaurant.
    existing_restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if existing_restaurant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a registered restaurant"
        )

    new_restaurant = Restaurant(
        owner_id=current_user.id,
        name=restaurant_data.name,
        description=restaurant_data.description,
        address=restaurant_data.address,
        phone=restaurant_data.phone
    )

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    return new_restaurant


@router.get("/my-restaurant", response_model=RestaurantResponse)
def get_my_restaurant(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    return restaurant


@router.patch("/my-restaurant", response_model=RestaurantResponse)
def update_my_restaurant(
    restaurant_data: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    update_data = restaurant_data.model_dump(exclude_unset=True)

    if any(
        update_data.get(field) is None
        for field in ("name", "address")
        if field in update_data
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Name and address cannot be null"
        )

    for field, value in update_data.items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)

    return restaurant



# Browse available restaurants (Public)
@router.get("/", response_model=list[RestaurantResponse])
def get_restaurants(
    search: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant).filter(
        Restaurant.is_available == True
    )

    if search:
        query = query.filter(
            Restaurant.name.ilike(f"%{search}%")
        )

    return query.offset(skip).limit(limit).all()


# Get restaurant details (Public)
@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(
    restaurant_id: int,
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

    return restaurant
