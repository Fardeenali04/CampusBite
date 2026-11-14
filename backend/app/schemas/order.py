
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    menu_item_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=50)


class OrderCreate(BaseModel):
    restaurant_id: int = Field(gt=0)
    delivery_address: str = Field(min_length=5, max_length=500)
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    restaurant_id: int
    delivery_address: str
    total_amount: Decimal
    status: str
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}



class OrderStatusUpdate(BaseModel):
    status: Literal["ACCEPTED", "PREPARING", "READY"]


class DeliveryStatusUpdate(BaseModel):
    status: Literal["OUT_FOR_DELIVERY", "DELIVERED"]


class DeliveryPartnerAssign(BaseModel):
    delivery_partner_id: int = Field(gt=0)