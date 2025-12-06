# backend/commute_service.py

from typing import List, Tuple, Dict
from universities import UNIVERSITIES
from models import CommuteResult, TransportMode
from naver_client import get_geocode, get_direction_duration


def fake_duration_minutes(address: str, university_name: str, mode: TransportMode) -> int:
    """
    Fallback for when API keys are missing or API fails.
    """
    base = len(address) + len(university_name)
    if mode == "transit":
        factor = 2
    else:  # car
        factor = 1
    minutes = base * factor
    return max(10, min(minutes, 90))


def get_commute_results(
    address: str,
    transport_mode: TransportMode,
    max_commute_minutes: int | None = None,
) -> Tuple[List[CommuteResult], Dict | None]:
    results: List[CommuteResult] = []

    # 1. Geocode user address
    user_coords = get_geocode(address)
    
    # If geocoding fails, we might want to return empty or error, 
    # but for prototype resilience, we can just proceed with fake data if we want,
    # OR better: if geocoding fails, we can't calculate real paths.
    # Let's try to use real API if coords exist, otherwise fallback to fake.
    use_real_api = user_coords is not None
    
    if use_real_api:
        start_lat, start_lng = user_coords

    for uni in UNIVERSITIES:
        duration = 0
        summary = ""
        
        if use_real_api:
            duration, summary = get_direction_duration(
                start_lat=start_lat,
                start_lng=start_lng,
                end_lat=uni["lat"],
                end_lng=uni["lng"],
                mode=transport_mode
            )
        
        # Fallback if API failed or keys missing (duration == 0)
        if duration == 0:
            duration = fake_duration_minutes(address, uni["name"], transport_mode)
            summary = f"{transport_mode} 기준 약 {duration}분 (예상)"

        if max_commute_minutes is not None and duration > max_commute_minutes:
            continue

        result = CommuteResult(
            university_id=uni["id"],
            university_name=uni["name"],
            university_address=uni["address"],
            duration_minutes=duration,
            transport_mode=transport_mode,
            route_summary=summary,
        )
        results.append(result)

    results.sort(key=lambda r: r.duration_minutes)
    
    home_location = None
    if use_real_api:
        home_location = {"lat": start_lat, "lng": start_lng}
        
    return results, home_location
