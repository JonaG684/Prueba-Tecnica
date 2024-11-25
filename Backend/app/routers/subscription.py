from fastapi import APIRouter, Depends, HTTPException, status
from random import choice
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.constants import SUBSCRIPTION_PLANS
from app import models, schemas, database
from typing import List
from app.utils import get_current_user


router = APIRouter()


@router.post("/payment/subscribe")


def simulate_payment(
    request: schemas.SubscriptionRequest,  
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    
    """
    Simulates a payment process for activating a subscription plan.

    This endpoint checks if the authenticated user already has an active subscription.
    If not, it validates the requested plan, simulates a payment, and updates the user's
    subscription status upon successful payment.

    Parameters:
        - request (schemas.SubscriptionRequest): Contains the subscription plan requested by the user.
        - current_user (models.User): The currently authenticated user (injected via dependency).
        - db (Session): The database session (injected via dependency).

    Raises:
        - HTTPException (400): If the user already has an active subscription.
        - HTTPException (400): If the requested subscription plan is invalid.
        - HTTPException (402): If the simulated payment fails.

    Returns:
        - JSON response containing a success message and the subscription end date.
"""

    plan = request.plan  
    if current_user.is_subscribed and current_user.subscription_end_date > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active subscription."
        )

    if plan not in SUBSCRIPTION_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid subscription plan. Available plans are: {list(SUBSCRIPTION_PLANS.keys())}"
        )

    payment_successful = choice([True, False])
    if not payment_successful:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment failed. Please try again later."
        )

    duration_in_days = SUBSCRIPTION_PLANS[plan]
    current_user.is_subscribed = True
    current_user.subscription_end_date = datetime.utcnow() + timedelta(days=duration_in_days)

    db.commit()
    db.refresh(current_user)

    return {
        "message": f"Payment successful! Your {plan} subscription is now active.",
        "subscription_end_date": current_user.subscription_end_date
    }

@router.post("/unsubscribe", response_model=schemas.User)
def unsubscribe_user(
    current_user: models.User = Depends(get_current_user),  
    db: Session = Depends(database.get_db)
):
    """
    Allows the authenticated user to unsubscribe, setting `is_subscribed` to False
    and clearing the subscription expiration date.
    """
 
    if not current_user.is_subscribed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not subscribed."
        )

  
    current_user.is_subscribed = False
    current_user.subscription_end_date = None  

    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/subscription/status", response_model=schemas.SubscriptionStatus)
def get_subscription_status(current_user: models.User = Depends(get_current_user)):
    """
    Returns the subscription status of the authenticated user.
    """
    if current_user.is_subscribed and current_user.subscription_end_date:
        status = "active" if current_user.subscription_end_date > datetime.utcnow() else "expired"
    else:
        status = "expired"  

    return {
        "is_subscribed": current_user.is_subscribed,
        "subscription_end_date": current_user.subscription_end_date,
        "status": status
    }


