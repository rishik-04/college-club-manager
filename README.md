# 🎓 College Club Manager

A full-stack web application built to streamline campus club discovery, event management, recruitment pipelines, and membership administration for college campuses.

---

## ✅ Status: Completed

This project is fully completed and ready to run locally or deploy. All core features including student club discovery, recruitment workflows, event QR ticketing, club admin dashboards, and super admin management are fully implemented and tested.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ & npm

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv .venv

# Activate Virtual Environment
# On Windows PowerShell:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- **API Docs**: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
- **Web App**: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@college.edu` | `admin123` | System-wide statistics, Club approvals, Student directory management |
| **Club Admin** | `clubadmin@college.edu` | `clubadmin123` | Specific club recruitment Kanban, event creation, member roster |
| **Student** | `student@college.edu` | `password123` | Discover clubs, apply to memberships, register for events, get event QR passes |

---

## ✨ Features

### 🎓 Student Portal
- **Explore & Filter Clubs**: Search campus clubs by name, category (Technical, Cultural, Sports, Social, Entrepreneurship, Creative), or keyword.
- **Club Match**: Simple interest-based recommendation tool that suggests clubs matching student preferences.
- **Recruitment Applications**: Apply to clubs with academic details (Roll Number, Branch, Year, Section) and payment proof upload / UTR tracking.
- **Events & QR Gate Passes**: View upcoming club workshops and hackathons, register, and generate digital QR passes for event entry.
- **Personalized Dashboard & Bookmarks**: Save favorite clubs and track application status.
- **Campus AI Assistant**: Interactive Q&A for quick answers regarding club rules and event schedules.

### 🏢 Club Admin Portal
- **Recruitment Kanban Pipeline**: Manage candidate applications across stages (*Submitted ➔ Shortlisted ➔ Interview ➔ Selected*).
- **Roster & Member Management**: Add, view, filter, and manage official club members.
- **Event Creation**: Schedule and publish new events for students.

### 🛡️ Super Admin Portal
- **Campus Analytics Dashboard**: Real-time overview of total students, active clubs, overall applications, and club membership summaries.
- **Club-Wise Student Directory**: Search and filter all registered students by branch, year, section, roll number, and enrolled clubs.
- **System Announcement Center**: Post broadcast or club-specific announcements.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React Icons, Axios
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Database**: SQLite (default for development) / PostgreSQL
- **Authentication**: JWT Tokens & bcrypt password hashing

---

## 📂 Project Structure

```text
college-club-manager/
├── backend/
│   ├── app/
│   │   ├── models.py           # Database models (User, Club, Member, Event, Application, Ticket)
│   │   ├── schemas.py          # Pydantic request/response validation schemas
│   │   ├── database.py         # DB connection & session configuration
│   │   ├── seed_data.py        # Database seeder with sample clubs & users
│   │   └── routers/            # API endpoints (Auth, Clubs, Admin, Membership, Events)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # Modals, Navbar, Kanban Board, Club Cards
│   │   ├── pages/              # SuperAdmin, ClubAdmin, Student Portal pages
│   │   ├── context/            # AuthContext & global state
│   │   └── services/           # Axios API services
│   └── package.json
└── README.md
```

---

## 👨‍💻 Author

**Rishik Kotagiri**  
- GitHub: [@rishik-04](https://github.com/rishik-04)
