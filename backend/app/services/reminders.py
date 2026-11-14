
import asyncio
import logging
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.models.order import Order
from app.models.reminder_log import ReminderLog

logger = logging.getLogger(__name__)


def generate_reminders():
    db = SessionLocal()

    try:
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=15)

        overdue_orders = db.query(Order).filter(
            Order.status.in_(["PLACED", "ACCEPTED"]),
            Order.updated_at <= cutoff_time
        ).all()

        created_count = 0

        for order in overdue_orders:
            existing = db.query(ReminderLog).filter(
                ReminderLog.order_id == order.id,
                ReminderLog.reminder_type == order.status
            ).first()

            if existing:
                continue

            reminder = ReminderLog(
                order_id=order.id,
                restaurant_id=order.restaurant_id,
                reminder_type=order.status,
                message=(
                    f"Order #{order.id} has remained in "
                    f"{order.status} for more than 15 minutes."
                )
            )

            db.add(reminder)
            created_count += 1

        if created_count:
            db.commit()

        return created_count

    except Exception:
        db.rollback()
        logger.exception("Failed to generate order reminders")
        raise

    finally:
        db.close()


async def reminder_loop():
    while True:
        try:
            count = await asyncio.to_thread(generate_reminders)

            if count:
                logger.info("Created %s order reminders", count)

        except Exception:
            logger.exception("Reminder background task failed")

        await asyncio.sleep(60)
