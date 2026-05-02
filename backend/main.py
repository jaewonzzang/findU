# backend/main.py

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import CommuteRequest, CommuteResponse, University
from universities import UNIVERSITIES
from commute_service import get_commute_results

app = FastAPI(title="findU Prototype API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/universities", response_model=list[University])
def get_universities():
    """
    정적 명문대 리스트 반환.
    프론트에서 대학 목록을 지도 마커용으로 쓸 때 사용.
    """
    return UNIVERSITIES


@app.post("/api/commute", response_model=CommuteResponse)
def calculate_commute(request: CommuteRequest):
    """
    집 주소 + 교통수단 + 최대 통학시간을 받아
    각 명문대까지의 통학 시간 결과를 반환.
    """
    try:
        results, home_location = get_commute_results(
            address=request.address,
            transport_mode=request.transport_mode,
            max_commute_minutes=request.max_commute_minutes,
        )
        return CommuteResponse(results=results, home_location=home_location)
    except Exception as e:
        print(f"Error calculating commute: {e}")
        return CommuteResponse(results=[], home_location=None)


@app.get("/")
def root():
    return {"message": "findU prototype backend is running"}
