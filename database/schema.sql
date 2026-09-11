-- College Club Manager PostgreSQL / SQLite DDL Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'STUDENT' NOT NULL,
    branch VARCHAR(100),
    year VARCHAR(50),
    interests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    eligibility TEXT NOT NULL,
    outcomes TEXT NOT NULL,
    logo_url VARCHAR(500),
    cover_url VARCHAR(500),
    google_form_url VARCHAR(500) NOT NULL,
    instagram_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS board_members (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    position VARCHAR(100) NOT NULL,
    photo_url VARCHAR(500),
    email VARCHAR(150),
    linkedin_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(150) NOT NULL,
    image_url VARCHAR(500),
    is_past BOOLEAN DEFAULT FALSE,
    registration_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS saved_clubs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_club UNIQUE (user_id, club_id)
);
