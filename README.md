# 🎓 College Club Manager

> A production-grade enterprise campus platform for discovering student organizations, events, recruitment, personalized club recommendations, and AI-powered assistance. Built with **Python (FastAPI + SQLAlchemy)** and **React (Vite + Tailwind CSS)**.

---

## 🚀 Demo

Currently configured for local development and demonstration:

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Interactive OpenAPI Docs**: `http://localhost:8000/docs`

---

## 📸 Screenshots

| 🖥️ Student Dashboard | 🔍 Explore & Search Clubs |
| :---: | :---: |
| *(Personalized greeting, campus stats & active filters)* | *(3-column grid with dynamic counter & event teasers)* |

| 🏢 Club Profile Details | ✨ Club Match (Find My Club) |
| :---: | :---: |
| *(Back button, Visual Why Join grid, Board & Events)* | *(Checkbox interest picker & match score breakdown)* |

| 💬 Club Assistant ✨ | 👨‍💼 Admin Recruitment Kanban |
| :---: | :---: |
| *(AI Q&A drawer for campus guidelines & events)* | *(Applicant kanban pipeline & candidate inspection)* |

---

## 🎯 Problem Statement

Campus club discovery and recruitment in colleges are often fragmented across scattered messaging groups and manual spreadsheets. Students miss key recruitment deadlines, while club admins struggle to manage candidate applications and track membership dues.

## 💡 Solution

**College Club Manager** provides a single, unified campus platform for:
1. **Students**: Discovering 48 official campus organizations, saving favorite clubs, applying via an in-app recruitment wizard with payment scanner verification, and receiving AI club recommendations.
2. **Club Admins & Faculty**: Managing recruitment pipelines with a drag-and-drop Kanban board, publishing events, generating entrance QR tickets, and overseeing club leadership rosters.

---

## ✨ Features

### 🎓 Student Features
- **48 Campus Clubs**: 48 campus clubs with board members and events are included across Technical, Cultural, Sports, Social, Entrepreneurship, and Creative categories.
- **Dynamic Search & Filters**: Live search by name, technology, or mission with category filter pills and dynamic club counter (`Showing 48 Clubs`).
- **Unified Recruitment Wizard**: In-app application form capturing Roll Number, academic branch, T-Shirt size, statement, and integrated UPI QR payment scanner.
- **Club Match ✨**: Interest compatibility engine calculating match scores (`92% Match`) with reason breakdowns (`Why: ✓ AI ✓ Python`).
- **Club Assistant ✨**: AI-powered conversational assistant for instant answers on club guidelines, bootcamps, and application deadlines.
- **Events & QR Gate Passes**: Browse upcoming workshops/hackathons and generate instant digital QR entrance passes.
- **Shortlist & Bookmarks**: Explicit bookmarking system (`🔖 Save` / `🔖 Saved`) with instant state sync.

### 👨‍💼 Admin & Leadership Features
- **Recruitment Kanban Board**: Drag-and-drop applicant pipeline (*Submitted ➔ Shortlisted ➔ Interview Scheduled ➔ Selected ➔ Joined*).
- **Candidate Inspection Drawer**: View Roll Number, academic branch, T-Shirt size, WhatsApp click-to-chat link, and verified UPI transaction UTR ID.
- **Analytics Dashboard**: Campus statistics on student registration, top-saved clubs, and category distributions.
- **Club & Event Management**: Full CRUD endpoints to create, edit, and archive club details and event listings.

---

## 🧠 AI & Data Science Layer

- **Content-Based Recommendation Engine**: Matches student interest vectors against club outcome tags and activity categories to compute exact compatibility scores (`92% Match`).
- **Club Assistant ✨**: Natural language Q&A retriever indexing campus club guidelines, eligibility rules, and event schedules.

---

## 🏗️ Architecture

```text
                 ┌─────────────────────┐
                 │       STUDENT       │
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │   React + Vite UI   │
                 │    Tailwind CSS     │
                 └──────────┬──────────┘
                            │ REST API / JWT
                 ┌──────────▼──────────┐
                 │   FastAPI Backend   │
                 └──────────┬──────────┘
                            │
            ┌───────────────┼────────────────┐
            │               │                │
            ▼               ▼                ▼
       SQLAlchemy       Auth / RBAC       AI Layer
            │                                │
            ▼                         ┌──────┴──────┐
     SQLite / Postgres           Club Match   Club Assistant
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.11+ / FastAPI
- **ORM**: SQLAlchemy
- **Authentication**: JWT Tokens + bcrypt password hashing

### Database
- **Development**: SQLite (`college_clubs.db`)
- **Production Ready**: PostgreSQL

### AI & Data Science
- **Matching Algorithm**: Content-based filtering & vector similarity
- **Retrieval Engine**: Fast schema retriever for campus Q&A

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git & GitHub

---

## 📂 Project Structure

```text
college-club-manager/
├── backend/
│   ├── app/
│   │   ├── models.py             # SQLAlchemy models (User, Club, BoardMember, Event, Application, Ticket)
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── database.py           # Database connection configuration
│   │   ├── seed_data.py          # Database seeder (48 clubs dataset)
│   │   └── routers/              # API Route Handlers
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, ClubCard, ClubSlideshow, KanbanBoard, ApplicationModal
│   │   ├── pages/                # ExplorePage, EventsPage, SavedClubsPage, ProfilePage
│   │   ├── context/              # AuthContext & state management
│   │   └── services/             # Axios API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Backend Setup

```bash
cd backend
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows CMD:
.venv\Scripts\activate.bat
# Windows PowerShell:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🔐 Pre-Seeded Demo Accounts

> [!NOTE]
> These are demo-only accounts automatically generated by the database seed script. Do not use real college credentials.

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `password123` | Search, bookmark clubs, Club Match, apply, view events |
| **Admin** | `admin@college.edu` | `admin123` | Full control: Recruitment Kanban, Admin Dashboard, Add/Edit Clubs |
| **Club Admin** | `clubadmin@college.edu` | `clubadmin123` | Manage specific club applicants & events |

---

## 🌟 Implementation Progress

- **Phases 0–21**: Core Architecture, Database Schemas, Auth/RBAC, 48 Clubs Dataset, Kanban Board, Payment Scanner, Docker Containers ✅
- **Phase 22**: Analytics Dashboard & Metrics Export ⏳
- **Phase 23**: Content-Based Club Recommendation Engine ("Club Match ✨") ✅
- **Phase 24**: Real-Time WebSockets Notifications ⏳
- **Phase 25**: Conversational GenAI Campus Assistant ("Club Assistant ✨") ✅

---

## 🐳 Docker Deployment

To launch the full stack (PostgreSQL + FastAPI + React) with a single command:

```bash
docker-compose up --build
```

---

## 👨‍💻 Author

**Rishik Kotagiri**
- GitHub: [@rishik-04](https://github.com/rishik-04)

