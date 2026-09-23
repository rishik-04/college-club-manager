import re
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Club, Event, SavedClub, User
from ..schemas import (
    RecommendationRequest, RecommendationItem, ClubListResponse,
    AskRequest, AskResponse
)
from ..auth import get_optional_current_user

router = APIRouter(prefix="/api/ai", tags=["AI & Recommendations"])

@router.post("/recommend", response_model=List[RecommendationItem])
def recommend_clubs(
    req: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    """
    Content-based recommendation engine (Phase 23)
    Computes overlap between student interest tokens and club profile (description, outcomes, category).
    """
    clubs = db.query(Club).all()
    user_tokens = [token.strip().lower() for token in req.interests if token.strip()]

    if not user_tokens and current_user and current_user.interests:
        user_tokens = [t.strip().lower() for t in current_user.interests.split(",") if t.strip()]

    scored_items = []

    # Get user saved clubs for personalization bonus
    saved_club_ids = set()
    if current_user:
        saved_club_ids = {s.club_id for s in db.query(SavedClub.club_id).filter(SavedClub.user_id == current_user.id).all()}

    for c in clubs:
        if c.is_active is False:
            continue

        text_corpus = f"{c.name} {c.category} {c.description} {c.eligibility} {c.outcomes}".lower()
        score = 0
        matched_reasons = []

        if not user_tokens:
            score = 65
            matched_reasons.append(f"Popular {c.category} organization on campus")
            matched_reasons.append("Complete your preferences to get more personalized recommendations.")
        else:
            for token in user_tokens:
                if token in c.category.lower():
                    score += 25
                    matched_reasons.append(f"Matches your interest in {token.title()}")
                elif token in c.name.lower():
                    score += 25
                    matched_reasons.append(f"Matches your interest in {token.title()}")
                elif token in text_corpus:
                    count = text_corpus.count(token)
                    score += min(count * 8, 20)
                    matched_reasons.append(f"Aligns with your preference for {token}")

            if not matched_reasons:
                matched_reasons.append("Recommended based on your selected preferences.")

        # Category bonus or saved club category synergy
        if c.id in saved_club_ids:
            score += 10
            matched_reasons.append("Already in your saved list")

        # Clamp match score between 40 and 98
        final_score = min(max(int(score), 40), 98) if user_tokens else 60

        saved_count = db.query(SavedClub).filter(SavedClub.club_id == c.id).count()
        events_count = db.query(Event).filter(Event.club_id == c.id).count()

        club_schema = ClubListResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            category=c.category,
            logo_url=c.logo_url,
            cover_url=c.cover_url,
            google_form_url=c.google_form_url,
            is_active=c.is_active if c.is_active is not None else True,
            saved_count=saved_count,
            is_saved=(c.id in saved_club_ids),
            events_count=events_count
        )

        scored_items.append(
            RecommendationItem(
                club=club_schema,
                match_score=final_score,
                reasons=list(dict.fromkeys(matched_reasons))[:3]
            )
        )

    # Sort descending by match score
    scored_items.sort(key=lambda x: x.match_score, reverse=True)
    return scored_items[:6]

@router.post("/ask", response_model=AskResponse)
def ask_club_manager(
    req: AskRequest,
    db: Session = Depends(get_db)
):
    """
    RAG & Knowledge Retrieval Assistant (Phase 25)
    Answers student questions about campus clubs, upcoming events, eligibility, and recruitment.
    """
    question = req.question.strip().lower()
    clubs = db.query(Club).all()
    events = db.query(Event).all()

    related_clubs = []
    sources = []

    # 1. Event specific queries
    if any(k in question for k in ["event", "upcoming", "bootcamp", "hackathon", "workshop", "competition"]):
        upcoming = [e for e in events if not e.is_past]
        if upcoming:
            events_str = ", ".join([f"'{e.title}' on {e.event_date.strftime('%b %d')}" for e in upcoming[:4]])
            answer = f"Here are the major upcoming events scheduled across campus clubs: {events_str}. You can view the full schedule and register directly from the Events tab!"
            for e in upcoming[:3]:
                c = db.query(Club).filter(Club.id == e.club_id).first()
                if c and c.name not in [rc["name"] for rc in related_clubs]:
                    related_clubs.append({"id": c.id, "name": c.name, "category": c.category})
                    sources.append(f"{c.name} - Event: {e.title}")
            return AskResponse(answer=answer, related_clubs=related_clubs, sources=sources)

    # 2. Eligibility queries
    if any(k in question for k in ["eligib", "who can", "first year", "beginner", "allowed", "join", "freshman"]):
        answer = "Most clubs on campus welcome students from all academic branches and years! Specifically, technical guilds like the AI & ML Club, Web & Mobile Dev Guild, and Robotics Society have dedicated beginner cohorts. You don't need prior experience—just curiosity and willingness to learn!"
        for c in clubs[:4]:
            related_clubs.append({"id": c.id, "name": c.name, "category": c.category})
            sources.append(f"{c.name} Recruitment Criteria")
        return AskResponse(answer=answer, related_clubs=related_clubs, sources=sources)

    # 3. Application / Form queries
    if any(k in question for k in ["apply", "google form", "recruitment", "how to join", "link", "register"]):
        answer = "You can apply to any club by opening its club profile and clicking the green 'Apply Now' button, which links directly to their official Google Form recruitment questionnaire. Applications are reviewed on a rolling basis."
        for c in clubs[:3]:
            related_clubs.append({"id": c.id, "name": c.name, "category": c.category})
        return AskResponse(answer=answer, related_clubs=related_clubs, sources=["Campus Student Affairs Guidelines"])

    # 4. Keyword search across clubs (AI, Web, Robotics, Design, E-Cell, Sports, Photo, Dance)
    matched = []
    for c in clubs:
        searchable = f"{c.name} {c.category} {c.description} {c.outcomes}".lower()
        words = re.findall(r'\w+', question)
        matches = [w for w in words if len(w) > 2 and w in searchable]
        if matches:
            matched.append((c, len(matches)))

    if matched:
        matched.sort(key=lambda x: x[1], reverse=True)
        top_matches = [m[0] for m in matched[:3]]
        club_names = " and ".join([f"**{c.name}** ({c.category})" for c in top_matches])
        answer = f"Based on your query, the best matching clubs on campus are {club_names}. They conduct regular hands-on sessions, peer mentorship, and competitive projects in this area."
        for c in top_matches:
            related_clubs.append({"id": c.id, "name": c.name, "category": c.category})
            sources.append(f"{c.name} Official Registry")
        return AskResponse(answer=answer, related_clubs=related_clubs, sources=sources)

    # Fallback
    answer = f"Our college hosts {len(clubs)} active clubs across Technical, Cultural, Sports, Social, and Entrepreneurship categories. You can explore them in the Explore tab or check out personalized recommendations based on your specific skills and interests!"
    for c in clubs[:3]:
        related_clubs.append({"id": c.id, "name": c.name, "category": c.category})
    return AskResponse(answer=answer, related_clubs=related_clubs, sources=["College Club Directory"])
