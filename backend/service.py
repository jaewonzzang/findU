# backend/service.py
import json
from typing import List
from models import SearchRequest, UniversityResult
from naver_client import geocode, get_route_time_and_distance

# 앱이 켜질 때 한 번만 universities.json 읽기
with open("universities.json", "r", encoding="utf-8") as f:
    UNIVERSITIES = json.load(f)

def search_universities(req: SearchRequest) -> List[UniversityResult]:
    # 1) 집 주소 → 좌표 변환
    home_lat, home_lng = geocode(req.address)

    # 2) 명문대 필터 적용
    universities = UNIVERSITIES
    if req.eliteOnly:
        universities = [u for u in UNIVERSITIES if u.get("elite")]

    results: List[UniversityResult] = []

    # 3) 각 대학에 대해 시간/거리 계산
    for uni in universities:
        uni_lat = uni["lat"]
        uni_lng = uni["lng"]
        time_minutes, distance_km = get_route_time_and_distance(
            home_lat, home_lng, uni_lat, uni_lng, req.transportMode
        )

        # maxTimeMinutes 조건이 있다면 필터링
        if req.maxTimeMinutes is not None and time_minutes > req.maxTimeMinutes:
            continue

        result = UniversityResult(
            name=uni["name"],
            timeMinutes=time_minutes,
            distanceKm=distance_km,
            lat=uni_lat,
            lng=uni_lng,
        )
        results.append(result)

    # 4) 소요시간 기준 정렬
    results.sort(key=lambda x: x.timeMinutes)
    return results
