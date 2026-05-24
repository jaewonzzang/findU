# backend/naver_client.py
import logging
import os
import httpx
from typing import Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("uvicorn.error")

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")


async def get_geocode(client: httpx.AsyncClient, address: str) -> Optional[Tuple[float, float]]:
    """
    주소를 입력받아 (lat, lng) 튜플을 반환.
    실패 시 None 반환.
    """
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        logger.error(
            f"Naver API keys missing. ID set: {bool(NAVER_CLIENT_ID)}, Secret set: {bool(NAVER_CLIENT_SECRET)}"
        )
        return None

    url = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode"
    headers = {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
    }
    params = {"query": address}

    try:
        response = await client.get(url, headers=headers, params=params)
        logger.info(f"Geocoding response status: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"Geocoding failed: {response.status_code} {response.text[:200]}")
        response.raise_for_status()
        data = response.json()

        if data.get("addresses"):
            first_result = data["addresses"][0]
            return float(first_result["y"]), float(first_result["x"])
        return None
    except Exception as e:
        print(f"Geocoding error for {address}: {e}")
        return None


async def get_direction_duration(
    client: httpx.AsyncClient,
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    mode: str = "transit",
) -> Optional[Tuple[int, str]]:
    """
    출발지 -> 도착지 소요시간(분) 및 경로 요약 반환.
    transit 모드는 driving 시간을 1.3배 + 15분으로 추산.

    Returns:
        Tuple[duration_min, summary]: NCP 정상 응답.
            duration_min == 0도 정상 가능 (start ≈ goal로 NCP가 0초 반환하는 경우).
        None: NCP 실패 (키 누락, HTTP 오류, code != 0, route empty, network/parse 예외).
    """
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        logger.error(
            f"Naver API keys missing (Directions). ID set: {bool(NAVER_CLIENT_ID)}, Secret set: {bool(NAVER_CLIENT_SECRET)}"
        )
        return None

    url = "https://maps.apigw.ntruss.com/map-direction/v1/driving"
    headers = {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
    }

    params = {
        "start": f"{start_lng},{start_lat}",
        "goal": f"{end_lng},{end_lat}",
        "option": "trafast",
    }

    try:
        response = await client.get(url, headers=headers, params=params)
        logger.info(f"Directions response status: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"Directions failed: {response.status_code} {response.text[:200]}")
        response.raise_for_status()
        data = response.json()

        if data.get("code") == 0 and data.get("route") and data.get("route").get("trafast"):
            duration_ms = data["route"]["trafast"][0]["summary"]["duration"]
            duration_min = int(duration_ms / 1000 / 60)

            if mode == "transit":
                duration_min = int(duration_min * 1.3 + 15)
                return duration_min, f"대중교통 약 {duration_min}분 (차량 기준 추산)"

            return duration_min, f"차량 이동 약 {duration_min}분"

        return None
    except Exception as e:
        print(f"Direction error: {e}")
        return None
