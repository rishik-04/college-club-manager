import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database

print("Resetting database...")
try:
    engine.dispose()
    Base.metadata.drop_all(bind=engine)
    print("Dropped existing tables.")
except Exception as e:
    print(f"Drop error: {e}")

Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed_database(db)
    print("Database re-created and seeded successfully!")
finally:
    db.close()
