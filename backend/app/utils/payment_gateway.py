from typing import Dict, Optional
import httpx
from fastapi import HTTPException
import json
import os

class PaymentGateway:
    def __init__(self):
        self.api_key = os.getenv("PAYMENT_GATEWAY_API_KEY")
        self.api_secret = os.getenv("PAYMENT_GATEWAY_API_SECRET")
        self.base_url = os.getenv("PAYMENT_GATEWAY_URL")

    async def request_payment(
        self,
        payment_id: int,
        amount: float,
        payment_method: str,
        payment_details: Optional[Dict] = None
    ) -> Dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/payments",
                    json={
                        "payment_id": payment_id,
                        "amount": amount,
                        "method": payment_method,
                        "details": payment_details
                    },
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail="결제 게이트웨이 요청 실패"
                    )
                
                return response.json()
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"결제 게이트웨이 통신 중 오류 발생: {str(e)}"
            )

    async def request_refund(
        self,
        transaction_id: str,
        amount: float
    ) -> Dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/refunds",
                    json={
                        "transaction_id": transaction_id,
                        "amount": amount
                    },
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail="환불 요청 실패"
                    )
                
                return response.json()
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"환불 처리 중 오류 발생: {str(e)}"
            ) 