
from datetime import datetime
from pydantic import BaseModel


class ReminderResponse(BaseModel):
    id: int
    order_id: int
    restaurant_id: int
    reminder_type: str
    message: str
    sent_at: datetime

    model_config = {"from_attributes": True}
