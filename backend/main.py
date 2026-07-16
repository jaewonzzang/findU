# backend/main.py

import os

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from models import CommuteRequest, CommuteResponse, University
from universities import UNIVERSITIES
from commute_service import get_commute_results
from kakao_client import search_keyword, KakaoKeyMissingError
from auth import router as auth_router

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

# 배포(프론트/백엔드 도메인 분리) 시 SESSION_SAMESITE=none 필요(https 전제).
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "dev-insecure-change-me"),
    same_site=os.getenv("SESSION_SAMESITE", "lax"),
    https_only=os.getenv("SESSION_SAMESITE", "lax") == "none",
)

app.include_router(auth_router)


@app.get("/api/universities", response_model=list[University])
def get_universities():
    """
    정적 명문대 리스트 반환.
    프론트에서 대학 목록을 지도 마커용으로 쓸 때 사용.
    """
    return UNIVERSITIES


@app.post("/api/commute", response_model=CommuteResponse)
async def calculate_commute(request: CommuteRequest):
    """
    집 주소 + 교통수단 + 최대 통학시간을 받아
    각 명문대까지의 통학 시간 결과를 반환.
    """
    try:
        results, home_location = await get_commute_results(
            address=request.address,
            transport_mode=request.transport_mode,
            max_commute_minutes=request.max_commute_minutes,
        )
        return CommuteResponse(results=results, home_location=home_location)
    except Exception as e:
        print(f"Error calculating commute: {e}")
        return CommuteResponse(results=[], home_location=None)


@app.get("/api/autocomplete")
async def autocomplete(query: str = ""):
    """
    Kakao 로컬 키워드 검색 프록시.
    검색어가 2글자 미만이면 Kakao를 호출하지 않고 빈 리스트 반환(쿼터 절약).
    각 후보: {name, address, lat, lng} (lat=Kakao y, lng=Kakao x).
    """
    if len(query.strip()) < 2:
        return []

    try:
        return await search_keyword(query.strip())
    except KakaoKeyMissingError:
        raise HTTPException(status_code=500, detail="KAKAO_REST_API_KEY not configured")
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        # Kakao 비정상 응답/네트워크 오류는 빈 결과로 처리해
        # 프론트 자동완성이 조용히 비도록 함(검색 흐름 차단 방지).
        print(f"Kakao autocomplete error: {e}")
        return []


@app.get("/")
def root():
    return {"message": "findU prototype backend is running"}
