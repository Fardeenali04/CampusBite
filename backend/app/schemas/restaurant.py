
from pydantic import BaseModel, Field


class RestaurantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    address: str = Field(min_length=5)
    phone: str | None = Field(default=None, max_length=20)


class RestaurantResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    address: str
    phone: str | None
    is_available: bool

    model_config = {"from_attributes": True}


class RestaurantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    address: str | None = Field(default=None, min_length=5)
    phone: str | None = Field(default=None, max_length=20)
    is_available: bool | None = None