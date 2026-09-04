from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401


def init_db() -> None:
    """
    Initialize database tables defined in Base metadata.
    Does not drop or delete existing database data.
    """
    Base.metadata.create_all(bind=engine)
