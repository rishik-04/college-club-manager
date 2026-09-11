import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Ticket, Event, Club, User
from ..schemas import TicketResponse, CheckInRequest
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api", tags=["Event Ticketing & QR Check-in"])

@router.post("/events/{event_id}/rsvp", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def rsvp_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    # Check if already registered
    existing = db.query(Ticket).filter(
        Ticket.user_id == current_user.id,
        Ticket.event_id == event_id
    ).first()
    if existing:
        club = db.query(Club.name).filter(Club.id == event.club_id).first()
        return TicketResponse(
            id=existing.id,
            user_id=existing.user_id,
            event_id=existing.event_id,
            event_title=event.title,
            club_name=club[0] if club else "Club",
            event_date=event.event_date,
            location=event.location,
            ticket_code=existing.ticket_code,
            status=existing.status,
            checked_in_at=existing.checked_in_at,
            created_at=existing.created_at
        )

    # Generate unique ticket code
    ticket_code = f"CCM-{uuid.uuid4().hex[:8].upper()}"

    new_ticket = Ticket(
        user_id=current_user.id,
        event_id=event_id,
        ticket_code=ticket_code,
        status="REGISTERED",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    club = db.query(Club.name).filter(Club.id == event.club_id).first()

    return TicketResponse(
        id=new_ticket.id,
        user_id=new_ticket.user_id,
        event_id=new_ticket.event_id,
        event_title=event.title,
        club_name=club[0] if club else "Club",
        event_date=event.event_date,
        location=event.location,
        ticket_code=new_ticket.ticket_code,
        status=new_ticket.status,
        checked_in_at=new_ticket.checked_in_at,
        created_at=new_ticket.created_at
    )

@router.get("/users/me/tickets", response_model=List[TicketResponse])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tickets = db.query(Ticket).filter(Ticket.user_id == current_user.id).order_by(Ticket.created_at.desc()).all()
    results = []
    for t in tickets:
        event = db.query(Event).filter(Event.id == t.event_id).first()
        if not event:
            continue
        club = db.query(Club.name).filter(Club.id == event.club_id).first()
        results.append(
            TicketResponse(
                id=t.id,
                user_id=t.user_id,
                event_id=t.event_id,
                event_title=event.title,
                club_name=club[0] if club else "Club",
                event_date=event.event_date,
                location=event.location,
                ticket_code=t.ticket_code,
                status=t.status,
                checked_in_at=t.checked_in_at,
                created_at=t.created_at
            )
        )
    return results

@router.post("/events/{event_id}/check-in", response_model=TicketResponse)
def check_in_ticket(
    event_id: int,
    check_in_in: CheckInRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["SUPER_ADMIN", "CLUB_ADMIN"]))
):
    ticket = db.query(Ticket).filter(
        Ticket.ticket_code == check_in_in.ticket_code.strip(),
        Ticket.event_id == event_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket code '{check_in_in.ticket_code}' not found for this event."
        )

    if ticket.status == "CHECKED_IN":
        event = db.query(Event).filter(Event.id == event_id).first()
        club = db.query(Club.name).filter(Club.id == event.club_id).first()
        return TicketResponse(
            id=ticket.id,
            user_id=ticket.user_id,
            event_id=ticket.event_id,
            event_title=event.title,
            club_name=club[0] if club else "Club",
            event_date=event.event_date,
            location=event.location,
            ticket_code=ticket.ticket_code,
            status=ticket.status,
            checked_in_at=ticket.checked_in_at,
            created_at=ticket.created_at
        )

    ticket.status = "CHECKED_IN"
    ticket.checked_in_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    event = db.query(Event).filter(Event.id == event_id).first()
    club = db.query(Club.name).filter(Club.id == event.club_id).first()

    return TicketResponse(
        id=ticket.id,
        user_id=ticket.user_id,
        event_id=ticket.event_id,
        event_title=event.title,
        club_name=club[0] if club else "Club",
        event_date=event.event_date,
        location=event.location,
        ticket_code=ticket.ticket_code,
        status=ticket.status,
        checked_in_at=ticket.checked_in_at,
        created_at=ticket.created_at
    )
