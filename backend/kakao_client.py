# backend/kakao_client.py
import logging
import os
from typing import List, Dict

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("uvicorn.error")

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")

KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"


class KakaoKeyMissingError(RuntimeError):
    """KAKAO_REST_API_KEY 환경변수가 설정되지 않았을 때."""


async def search_keyword(query: str) -> List[Dict]:
    """
    Kakao 로컬 키워드 검색 API로 장소 후보를 조회.

    Args:
        query: 검색어. 호출자가 2글자 미만 필터링은 끝낸 상태로 전달.

    Returns:
        최대 5개의 후보 리스트. 각 항목:
            {name, address, lat, lng}
        결과 없으면 빈 리스트.

    Raises:
        KakaoKeyMissingError: API 키 미설정.
        httpx.HTTPStatusError: Kakao가 4xx/5xx 응답.
        httpx.RequestError / TimeoutException: 네트워크/타임아웃.
    """
    if not KAKAO_REST_API_KEY:
        logger.error("KAKAO_REST_API_KEY not configured")
        raise KakaoKeyMissingError("KAKAO_REST_API_KEY not configured")

    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": query, "size": 5}

    async with httpx.AsyncClient(timeout=3.0) as client:
        response = await client.get(KAKAO_KEYWORD_URL, headers=headers, params=params)
        if response.status_code != 200:
            logger.error(
                f"Kakao keyword search failed: {response.status_code} {response.text[:200]}"
            )
        response.raise_for_status()
        data = response.json()

    documents = data.get("documents") or []
    results: List[Dict] = []
    for doc in documents[:5]:
        # Kakao 좌표 규약: x = 경도(lng), y = 위도(lat).
        # NCP Directions/Geocoding은 (lat, lng) 분리 인자를 받으므로
        # 여기서 x->lng, y->lat 으로 매핑해 두면 그대로 전달 가능.
        # category: Kakao category_name("대분류 > 중분류 > 소분류")의
        # 마지막 세그먼트만 사용(네이버 칩 스타일). 없거나 빈 값이면 "".
        category_name = doc.get("category_name") or ""
        category = category_name.split(" > ")[-1].strip() if category_name else ""
        results.append(
            {
                "name": doc.get("place_name", ""),
                "address": doc.get("road_address_name") or doc.get("address_name", ""),
                "lat": float(doc["y"]),  # y = 위도
                "lng": float(doc["x"]),  # x = 경도
                "category": category,
            }
        )

    return results
