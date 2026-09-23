from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import AdminUser
from ..auth import verify_password, hash_password, create_access_token, get_current_admin
from ..schemas.schemas import LoginRequest, TokenResponse, ChangePasswordRequest, AdminUserResponse

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == req.username).first()
    if not admin or not verify_password(req.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    token = create_access_token(data={"sub": admin.username})
    return TokenResponse(access_token=token, token_type="bearer", username=admin.username)

@router.post("/logout")
def logout(current_admin: AdminUser = Depends(get_current_admin)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=AdminUserResponse)
def get_me(current_admin: AdminUser = Depends(get_current_admin)):
    return current_admin

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, current_admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    if not verify_password(req.old_password, current_admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")
    current_admin.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
