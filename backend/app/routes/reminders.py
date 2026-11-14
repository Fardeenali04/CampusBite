
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.reminder_log import ReminderLog
from app.schemas.reminder import ReminderResponse

router = APIRouter(prefix="/reminders", tags=["Reminders"])


# Owner: View reminders for their restaurant
@router.get("/owner", response_model=list[ReminderResponse])
def get_owner_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("OWNER"))
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    return db.query(ReminderLog).filter(
        ReminderLog.restaurant_id == restaurant.id
    ).order_by(ReminderLog.sent_at.desc()).all()
