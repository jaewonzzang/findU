# backend/naver_client.py
import os
import requests
from typing import Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

def get_geocode(address: str) -> Optional[Tuple[float, float]]:
    """
    주소를 입력받아 (lat, lng) 튜플을 반환.
    실패 시 None 반환.
    """
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        print("Naver API keys are missing.")
        return None

    url = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode"
    headers = {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
    }
    params = {"query": address}

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        if data.get("addresses"):
            first_result = data["addresses"][0]
            # Naver API returns string, convert to float
            # x: longitude, y: latitude
            return float(first_result["y"]), float(first_result["x"])
        return None
    except Exception as e:
        print(f"Geocoding error for {address}: {e}")
        return None


def get_direction_duration(
    start_lat: float, start_lng: float, end_lat: float, end_lng: float, mode: str = "transit"
) -> Tuple[int, str]:
    """
    출발지 -> 도착지 소요시간(분) 및 경로 요약 반환.
    mode: 'transit' (대중교통) | 'car' (자동차)
    
    Note: Directions 5 API (Driving) is for cars.
    For public transit, Naver doesn't provide a free public API easily accessible 
    via the same console usually (requires different setup or scraping).
    
    HOWEVER, for this prototype, we will use:
    - Driving API (Directions 5) for 'car'
    - For 'transit', since there is no open free API, we might have to mock it 
      OR use the Driving API and multiply by a factor (e.g. 1.5x) if we can't get real transit data.
      
    Let's try to use Directions 5 for car.
    """
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        return 0, "API Key Missing"

    # 자동차 (Driving)
    if mode == "car":
        url = "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"
    else:
        # 대중교통 API는 별도 제휴가 필요하거나 복잡하므로,
        # 프로토타입에서는 자동차 경로(Driving)를 구해서 * 1.5배 하는 식으로 추정하거나
        # 혹은 TMAP 등 다른 API를 써야 함.
        # 여기서는 "자동차 시간 * 1.3 + 10분" 정도로 근사치를 계산하여 반환하는 전략 사용.
        url = "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"

    headers = {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
    }
    
    start_str = f"{start_lng},{start_lat}"
    end_str = f"{end_lng},{end_lat}"
    
    params = {
        "start": start_str,
        "goal": end_str,
        "option": "trafast" # 실시간 빠른길
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        if data.get("code") == 0 and data.get("route") and data.get("route").get("trafast"):
            # milliseconds
            duration_ms = data["route"]["trafast"][0]["summary"]["duration"]
            duration_min = int(duration_ms / 1000 / 60)
            
            if mode == "transit":
                # Mocking transit based on driving time
                # 대중교통은 보통 운전보다 오래 걸림 (환승, 도보 포함)
                duration_min = int(duration_min * 1.3 + 15)
                return duration_min, f"대중교통 약 {duration_min}분 (차량 기준 추산)"
            
            return duration_min, f"차량 이동 약 {duration_min}분"
            
        return 0, "경로 없음"
    except Exception as e:
        print(f"Direction error: {e}")
        return 0, "API Error"
