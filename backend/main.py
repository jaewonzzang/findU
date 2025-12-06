# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import SearchRequest, SearchResponse, University
from universities import UNIVERSITIES
from commute_service import get_commute_results

app = FastAPI(title="findU Prototype API")

# CORS: 개발 단계에서는 모두 허용, 나중에 프론트 주소만 남기면 됨
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발용: 전체 허용
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


@app.post("/api/commute", response_model=SearchResponse)
def calculate_commute(request: SearchRequest):
    """
    집 주소 + 교통수단 + 최대 통학시간을 받아
    각 명문대까지의 (가짜) 통학 시간 결과를 반환.
    """
    try:
        results, home_location = get_commute_results(
            address=request.address,
            transport_mode=request.transport_mode,
            max_commute_minutes=request.max_commute_minutes,
        )
        return SearchResponse(results=results, home_location=home_location)
    except Exception as e:
        # 실제 운영시엔 로깅 후 적절한 HTTP 에러 반환 필요
        print(f"Error calculating commute: {e}")
        return SearchResponse(results=[], home_location=None)


@app.get("/")
def root():
    return {"message": "findU prototype backend is running"}
