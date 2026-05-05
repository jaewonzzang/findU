# backend/commute_service.py

import asyncio
from typing import List, Tuple, Dict

import httpx

from universities import UNIVERSITIES
from models import CommuteResult, TransportMode
from naver_client import get_geocode, get_direction_duration


def fake_duration_minutes(address: str, university_name: str, mode: TransportMode) -> int:
    """
    Fallback for when API keys are missing or API fails.
    """
    base = len(address) + len(university_name)
    factor = 2 if mode == "transit" else 1
    minutes = base * factor
    return max(10, min(minutes, 90))


async def get_commute_results(
    address: str,
    transport_mode: TransportMode,
    max_commute_minutes: int | None = None,
) -> Tuple[List[CommuteResult], Dict | None]:
    use_real_api = False
    start_lat = start_lng = 0.0
    api_results: List[Tuple[int, str]] = []

    async with httpx.AsyncClient(timeout=15.0) as client:
        user_coords = await get_geocode(client, address)
        use_real_api = user_coords is not None

        if use_real_api:
            start_lat, start_lng = user_coords
            tasks = [
                get_direction_duration(
                    client,
                    start_lat=start_lat,
                    start_lng=start_lng,
                    end_lat=uni["lat"],
                    end_lng=uni["lng"],
                    mode=transport_mode,
                )
                for uni in UNIVERSITIES
            ]
            api_results = await asyncio.gather(*tasks)

    results: List[CommuteResult] = []
    for idx, uni in enumerate(UNIVERSITIES):
        duration, summary = api_results[idx] if use_real_api else (0, "")

        if duration == 0:
            duration = fake_duration_minutes(address, uni["name"], transport_mode)
            summary = f"{transport_mode} 기준 약 {duration}분 (예상)"

        if max_commute_minutes is not None and duration > max_commute_minutes:
            continue

        results.append(
            CommuteResult(
                university_id=uni["id"],
                university_name=uni["name"],
                university_address=uni["address"],
                duration_minutes=duration,
                transport_mode=transport_mode,
                route_summary=summary,
            )
        )

    results.sort(key=lambda r: r.duration_minutes)

    home_location = {"lat": start_lat, "lng": start_lng} if use_real_api else None
    return results, home_location
