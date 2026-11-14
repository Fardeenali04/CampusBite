
from pydantic import BaseModel, Field
from typing import Literal


class RefundCreate(BaseModel):
    order_id: int = Field(gt=0)
    reason: str = Field(min_length=5, max_length=1000)


class RefundReview(BaseModel):
    status: Literal["APPROVED", "REJECTED"]


class RefundResponse(BaseModel):
    id: int
    order_id: int
    customer_id: int
    amount: float
    reason: str
    status: str

    model_config = {"from_attributes": True}
