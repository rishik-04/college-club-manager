import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import (
    auth_routes,
    club_routes,
    event_routes,
    saved_routes,
    admin_routes,
    ai_routes
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed default data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="College Club Manager API",
    description="Backend API for College Club Manager with authentication, role-based access control, events, bookmarks, analytics, and AI assistant.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_routes.router)
app.include_router(club_routes.router)
app.include_router(event_routes.router)
app.include_router(saved_routes.router)
app.include_router(admin_routes.router)
app.include_router(ai_routes.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to College Club Manager API",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "college-club-manager-backend"}
