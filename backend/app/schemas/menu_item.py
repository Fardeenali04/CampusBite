
from decimal import Decimal

from pydantic import BaseModel, Field, HttpUrl


class MenuItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    category: str = Field(min_length=2, max_length=100)
    is_vegetarian: bool = False
    image_url: HttpUrl | None = None


class MenuItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    price: Decimal | None = Field(
        default=None, gt=0, max_digits=10, decimal_places=2
    )
    category: str | None = Field(default=None, min_length=2, max_length=100)
    is_vegetarian: bool | None = None
    image_url: HttpUrl | None = None
    is_available: bool | None = None


class MenuItemResponse(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str | None
    price: Decimal
    category: str
    is_vegetarian: bool
    image_url: str | None
    is_available: bool

    model_config = {"from_attributes": True}
