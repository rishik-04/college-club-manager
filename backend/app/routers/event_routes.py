from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Event, Club, User, EventRegistration
from ..schemas import EventResponse, EventCreate, EventUpdate
from ..auth import require_roles, get_optional_current_user, get_current_user
from .club_routes import check_club_permission

router = APIRouter(prefix="/api", tags=["Events"])

@router.get("/events", response_model=List[EventResponse])
def get_all_events(
    filter_type: Optional[str] = Query("all", description="'all', 'upcoming', or 'past'"),
    club_id: Optional[int] = Query(None, description="Filter events for a specific club"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Event)
    if club_id:
        query = query.filter(Event.club_id == club_id)

    now = datetime.datetime.utcnow()
    if filter_type == "upcoming":
        query = query.filter(Event.is_past == False, Event.event_date >= now).order_by(Event.event_date.asc())
    elif filter_type == "past":
        query = query.filter((Event.is_past == True) | (Event.event_date < now)).order_by(Event.event_date.desc())
    else:
        query = query.order_by(Event.event_date.desc())

    events = query.all()
    registered_event_ids = set()
    if current_user:
        registered_event_ids = {
            r.event_id for r in db.query(EventRegistration.event_id).filter(EventRegistration.student_id == current_user.id).all()
        }

    results = []
    for ev in events:
        club = db.query(Club.name).filter(Club.id == ev.club_id).first()
        results.append(
            EventResponse(
                id=ev.id,
                club_id=ev.club_id,
                title=ev.title,
                description=ev.description,
                event_date=ev.event_date,
                location=ev.location,
                image_url=ev.image_url,
                is_past=ev.is_past or (ev.event_date < now),
                registration_url=ev.registration_url,
                club_name=club[0] if club else None,
                is_registered=(ev.id in registered_event_ids)
            )
        )
    return results

@router.get("/events/my-registrations", response_model=List[int])
def get_my_event_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    regs = db.query(EventRegistration.event_id).filter(EventRegistration.student_id == current_user.id).all()
    return [r[0] for r in regs]

@router.post("/events/{event_id}/register")
def register_for_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    existing = db.query(EventRegistration).filter(
        EventRegistration.student_id == current_user.id,
        EventRegistration.event_id == event_id
    ).first()

    if existing:
        return {"registered": True, "message": "Already registered for this event."}

    new_reg = EventRegistration(student_id=current_user.id, event_id=event_id)
    db.add(new_reg)
    db.commit()

    return {"registered": True, "message": "Successfully registered for event!"}

@router.post("/clubs/{club_id}/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    club_id: int,
    event_in: EventCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    check_club_permission(admin, club_id, db)
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found.")

    new_event = Event(club_id=club_id, **event_in.dict())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return EventResponse(
        id=new_event.id,
        club_id=new_event.club_id,
        title=new_event.title,
        description=new_event.description,
        event_date=new_event.event_date,
        location=new_event.location,
        image_url=new_event.image_url,
        is_past=new_event.is_past,
        registration_url=new_event.registration_url,
        club_name=club.name
    )

@router.put("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    check_club_permission(admin, event.club_id, db)
    update_data = event_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)

    db.commit()
    db.refresh(event)

    club = db.query(Club.name).filter(Club.id == event.club_id).first()
    return EventResponse(
        id=event.id,
        club_id=event.club_id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        location=event.location,
        image_url=event.image_url,
        is_past=event.is_past,
        registration_url=event.registration_url,
        club_name=club[0] if club else None
    )

@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    check_club_permission(admin, event.club_id, db)
    db.delete(event)
    db.commit()
    return None
