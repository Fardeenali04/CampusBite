
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    order_id: int = Field(gt=0)
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class ReviewResponse(BaseModel):
    id: int
    order_id: int
    customer_id: int
    restaurant_id: int
    rating: int
    comment: str | None

    model_config = {"from_attributes": True}
