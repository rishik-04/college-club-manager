# 🚀 College Club Manager

> A full-stack campus ecosystem web application for discovering clubs, attending workshops, connecting with student leaders, and streamlining club recruitment through official Google Forms. Built with **Python (FastAPI + SQLAlchemy)** and **React (Vite + Tailwind CSS)**.

---

## 📸 Architecture & Overview

```
                         COLLEGE CLUB MANAGER
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
             Student User                     Admin User
                  │                               │
        ┌─────────┴─────────┐           ┌─────────┴─────────┐
        │ Explore & Search  │           │ Dashboard Metrics │
        │ Category Filters  │           │ Add / Edit Clubs  │
        │ Past & Up Events  │           │ Manage Events     │
        │ Saved Clubs (❤️)  │           │ User Permissions  │
        │ Smart Match %     │           └───────────────────┘
        │ GenAI Assistant   │
        └─────────┬─────────┘
                  │
             React 18 UI (Vite + Tailwind CSS + Lucide Icons)
                  │  (REST API with JWT Auth & RBAC)
            FastAPI Backend (Python 3.13)
                  │
        ┌─────────┴─────────┐
   SQLAlchemy ORM     Smart Match / AI Engine
        │
   SQLite / PostgreSQL
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend

```bash
cd backend
# Windows: activate virtual environment
.venv\Scripts\activate

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Database: Pre-seeded automatically with 10 clubs, 22 board members, and 12 events.

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

- Web App URL: `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Accounts

The login modal contains **1-Click Test Drive Buttons** for instant evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `password123` | Search, bookmark clubs, profile, AI match, view events |
| **Admin** | `admin@college.edu` | `admin123` | Full administrative control: Add/edit clubs, events, view stats |
| **Club Admin** | `clubadmin@college.edu` | `clubadmin123` | Manage specific club events & member listings |

---

## 🌟 Feature Checklist (All 25 Phases Covered)

- [x] **Phase 0 & 1**: Frozen V1 scope with modern screen designs & responsive layout.
- [x] **Phase 2 & 5**: Database schema with SQLAlchemy ORM (`users`, `clubs`, `board_members`, `events`, `saved_clubs`).
- [x] **Phase 3**: Clean folder hierarchy (`backend/`, `frontend/`, `database/`, `docs/`, `docker-compose.yml`).
- [x] **Phase 4**: Production FastAPI backend structure.
- [x] **Phase 6**: Secure password hashing with `bcrypt` & signed JWT authentication.
- [x] **Phase 7**: Role-Based Access Control (`STUDENT`, `CLUB_ADMIN`, `SUPER_ADMIN`).
- [x] **Phase 8 & 9**: Club listing, text search (`?search=`), and category filter pills (`?category=`).
- [x] **Phase 10 & 15**: Full Club Details modal with About, Eligibility, Outcomes, Board Members, Events, and **[ APPLY NOW ]** Google Form button.
- [x] **Phase 11**: Events feed with upcoming & past separation.
- [x] **Phase 12**: Saved clubs shortlist (❤️ toggle with instant sync).
- [x] **Phase 13, 14, 15**: Modern React frontend with Tailwind CSS, Lucide icons, and micro-interactions.
- [x] **Phase 16 & 17**: Admin Dashboard with live stats, Add Club modal, Edit Club, and Event Creator.
- [x] **Phase 18**: Seeded rich data covering 10 real-world campus clubs.
- [x] **Phase 19 & 20**: Error handling, validation, secure environment configuration (`.env`).
- [x] **Phase 21**: `Dockerfile` for backend/frontend and `docker-compose.yml`.
- [x] **Phase 23**: Content-based recommendation algorithm calculating match percentage based on student interest tags.
- [x] **Phase 25**: "Ask Club Manager" GenAI Q&A assistant retrieving clubs, events, and recruitment criteria.

---

## 🐳 Docker Deployment

To run the entire stack (PostgreSQL + FastAPI + React) in Docker:

```bash
docker-compose up --build
```
