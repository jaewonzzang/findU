# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import SearchRequest, SearchResponse
from service import search_universities

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello"}

# 프론트엔드 도메인에서 호출 허용 (개발 단계용: 모두 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 나중에는 프론트 URL만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/search", response_model=SearchResponse)
def search(request: SearchRequest):
    return SearchResponse(results=results)
    results = search_universities(request)