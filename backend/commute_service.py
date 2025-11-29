# backend/commute_service.py

from typing import List
from universities import UNIVERSITIES
from models import CommuteResult, TransportMode


def fake_duration_minutes(address: str, university_name: str, mode: TransportMode) -> int:
    """
    네이버 API 대신 사용하는 간단한 가짜 통학 시간 계산 함수.
    - 주소 길이, 대학 이름 길이를 이용해서 대충 시간을 만든다.
    - mode에 따라 약간의 가중치를 준다.
    실제 프로젝트에서는 이 부분을 네이버 Directions API 호출로 교체하면 된다.
    """
    base = len(address) + len(university_name)

    if mode == "transit":
        factor = 2
    else:  # car
        factor = 1

    minutes = base * factor

    # 너무 작거나 크지 않게 범위 제한 (예: 10분 ~ 90분)
    if minutes < 10:
        minutes = 10
    if minutes > 90:
        minutes = 90

    return minutes


def get_commute_results(
    address: str,
    transport_mode: TransportMode,
    max_commute_minutes: int | None = None,
) -> List[CommuteResult]:
    results: List[CommuteResult] = []

    for uni in UNIVERSITIES:
        duration = fake_duration_minutes(address, uni["name"], transport_mode)

        if max_commute_minutes is not None and duration > max_commute_minutes:
            # 최대 통학 시간 초과한 대학은 제외
            continue

        summary = f"{transport_mode} 기준 약 {duration}분 소요 (단순 계산값)"

        result = CommuteResult(
            university_id=uni["id"],
            university_name=uni["name"],
            university_address=uni["address"],
            duration_minutes=duration,
            transport_mode=transport_mode,
            route_summary=summary,
        )
        results.append(result)

    # 소요 시간 기준 정렬
    results.sort(key=lambda r: r.duration_minutes)
    return results
