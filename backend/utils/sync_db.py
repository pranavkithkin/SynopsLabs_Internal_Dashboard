from sqlalchemy.orm import Session
from models.user import User
from models.api_key import ApiKey
from config import settings

def sync_user_to_db(mock_user: dict, db: Session) -> User:
    """
    Syncs a mock user from main.py to the SQLite database.
    This ensures that services relying on the DB (like Alfred) can find the user.
    """
    db_user = db.query(User).filter(User.email == mock_user["email"]).first()
    
    role_str = mock_user["role"].lower()
    if "ceo" in role_str:
        role = "ceo"
    elif "founder" in role_str:
        role = "ceo" # Treat founder as CEO for permissions
    else:
        role = role_str.replace(" ", "_")

    if not db_user:
        db_user = User(
            id=mock_user["id"],
            email=mock_user["email"],
            name=mock_user["name"],  # User model uses 'name' not 'full_name'
            role=role,
            password_hash="mock_password_hash",  # User model uses 'password_hash' not 'hashed_password'
            is_active=mock_user["is_active"]
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Also sync API key if present in settings
        if settings.OPENAI_API_KEY:
            # Check if key exists
            api_key = db.query(ApiKey).filter(
                ApiKey.user_id == db_user.id,
                ApiKey.service == "openai"
            ).first()
            
            if not api_key:
                # In a real app we would encrypt this. For now, storing as is or dummy.
                # AlfredService checks settings.OPENAI_API_KEY directly too.
                pass

    return db_user
