from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, History
from backend.schemas import GenerateRequest
from backend.auth.security import get_current_user
from backend.services.prompt_builder import build_prompt
from backend.services.LLM_service import generate_response

router = APIRouter(prefix="/api/generate", tags=["generate"])

@router.post("/")
def generate_content(request: GenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Build prompt using existing logic
        prompt = build_prompt(
            content_type=request.content_type,
            topic=request.topic,
            tone=request.tone,
            role=request.target_audience,
            length=request.content_length,
            format_type=request.output_format,
            keywords=request.keywords
        )
        
        # Call LLM service
        response_text = generate_response(prompt)
        
        if not response_text or response_text == "All models failed.":
            raise HTTPException(status_code=500, detail="Failed to generate content from AI models.")

        # Save to history if not guest
        if not current_user.is_guest:
            new_history = History(
                user_id=current_user.id,
                prompt=prompt,
                response=response_text
            )
            db.add(new_history)
            db.commit()
            db.refresh(new_history)

        return {"response": response_text, "prompt_used": prompt}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
