from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, History
from backend.schemas import HistoryResponse
from backend.auth.security import get_current_user

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("/", response_model=List[HistoryResponse])
def get_user_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_guest:
        return []
    
    # Return history ordered by most recent first
    histories = db.query(History).filter(History.user_id == current_user.id).order_by(History.created_at.desc()).all()
    return histories

@router.delete("/{history_id}")
def delete_history_item(history_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_guest:
        raise HTTPException(status_code=403, detail="Guests cannot delete history")
        
    history_item = db.query(History).filter(History.id == history_id, History.user_id == current_user.id).first()
    if not history_item:
        raise HTTPException(status_code=404, detail="History not found")
        
    db.delete(history_item)
    db.commit()
    return {"detail": "Successfully deleted"}
