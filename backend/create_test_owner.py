
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User


db = SessionLocal()

try:
    existing_user = db.query(User).filter(
        User.email == "owner@campusbite.com"
    ).first()

    if existing_user:
        print("Test owner already exists.")
    else:
        owner = User(
            full_name="Test Restaurant Owner",
            email="owner@campusbite.com",
            password_hash=hash_password("OwnerPass123!"),
            phone="9876543211",
            role="OWNER"
        )

        db.add(owner)
        db.commit()

        print("Test owner created successfully!")

finally:
    db.close()
