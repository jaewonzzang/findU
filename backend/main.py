# backend/main.py

import logging
import os

import httpx
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from models import CommuteRequest, CommuteResponse, University
from universities import UNIVERSITIES
from commute_service import get_commute_results
from kakao_client import search_keyword, KakaoKeyMissingError
from naver_client import AddressNotFoundError
from rate_limit import autocomplete_rate_limit, commute_rate_limit
from auth import router as auth_router
from favorites import router as favorites_router

logger = logging.getLogger("uvicorn.error")

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
    # 기본값을 켜 둬서 배포 환경이 별도 설정 없이도 https 전용 쿠키를 쓴다.
    # http 로 도는 로컬 개발에서만 SESSION_HTTPS_ONLY=false 로 내린다.
    https_only=os.getenv("SESSION_HTTPS_ONLY", "true").lower() != "false",
    # 쿠키 수명과 서명 만료를 함께 제한한다. 기본 5분이라 방치된 세션은 알아서 끊긴다.
    max_age=int(os.getenv("SESSION_MAX_AGE", "300")),
)

app.include_router(auth_router)
app.include_router(favorites_router)


@app.get("/api/universities", response_model=list[University])
def get_universities():
    """
    정적 명문대 리스트 반환.
    프론트에서 대학 목록을 지도 마커용으로 쓸 때 사용.
    """
    return UNIVERSITIES


@app.post(
    "/api/commute",
    response_model=CommuteResponse,
    dependencies=[Depends(commute_rate_limit)],
)
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
    except AddressNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="주소를 찾을 수 없어요. 도로명 주소나 지번 주소를 다시 확인해 주세요.",
        )
    return CommuteResponse(results=results, home_location=home_location)


@app.get("/api/autocomplete", dependencies=[Depends(autocomplete_rate_limit)])
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
        logger.error(f"Kakao autocomplete error: {e}")
        return []


@app.get("/api/health")
def health():
    """플랫폼 헬스체크용. 외부 API를 호출하지 않아 쿼터를 쓰지 않는다."""
    return {
        "status": "ok",
        "naver_keys": bool(os.getenv("NAVER_CLIENT_ID") and os.getenv("NAVER_CLIENT_SECRET")),
        "kakao_key": bool(os.getenv("KAKAO_REST_API_KEY")),
        "favorites_store": bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
    }


@app.get("/")
def root():
    return {"message": "findU prototype backend is running"}
