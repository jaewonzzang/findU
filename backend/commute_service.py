# backend/commute_service.py

import asyncio
from typing import List, Optional, Tuple, Dict

import httpx

import commute_cache
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
    api_results: List[Optional[Tuple[int, str]]] = [None for _ in UNIVERSITIES]

    async with httpx.AsyncClient(timeout=15.0) as client:
        user_coords = await get_geocode(client, address)
        use_real_api = user_coords is not None

        if use_real_api:
            start_lat, start_lng = user_coords

            fetch_indices: List[int] = []
            for idx, uni in enumerate(UNIVERSITIES):
                cached = commute_cache.get(start_lat, start_lng, uni["id"], transport_mode)
                if cached is not None:
                    api_results[idx] = cached
                else:
                    fetch_indices.append(idx)

            if fetch_indices:
                tasks = [
                    get_direction_duration(
                        client,
                        start_lat=start_lat,
                        start_lng=start_lng,
                        end_lat=UNIVERSITIES[idx]["lat"],
                        end_lng=UNIVERSITIES[idx]["lng"],
                        mode=transport_mode,
                    )
                    for idx in fetch_indices
                ]
                fetched = await asyncio.gather(*tasks)
                for idx, value in zip(fetch_indices, fetched):
                    api_results[idx] = value
                    if value is not None:
                        duration, summary = value
                        commute_cache.put(
                            start_lat, start_lng, UNIVERSITIES[idx]["id"], transport_mode, duration, summary
                        )

    results: List[CommuteResult] = []
    for idx, uni in enumerate(UNIVERSITIES):
        value = api_results[idx]
        if value is None:
            duration = fake_duration_minutes(address, uni["name"], transport_mode)
            summary = f"{transport_mode} 기준 약 {duration}분 (예상)"
            is_fallback = True
        else:
            duration, summary = value
            is_fallback = False

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
                is_fallback=is_fallback,
            )
        )

    results.sort(key=lambda r: r.duration_minutes)

    home_location = {"lat": start_lat, "lng": start_lng} if use_real_api else None
    return results, home_location
