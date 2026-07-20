# backend/rate_limit.py
"""
외부 API 쿼터 보호용 IP당 레이트 리밋.
/api/commute 는 검색 1회가 Naver Directions 호출 최대 38건을 유발하고,
/api/autocomplete 는 타이핑마다 Kakao 를 호출하므로 둘 다 상한을 둔다.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

WINDOW_SECONDS = 60
MAX_REQUESTS = 10
# 자동완성은 타이핑마다 호출되므로 한도를 넉넉히 잡되, 무제한으로 두지는 않는다.
AUTOCOMPLETE_MAX_REQUESTS = 60

# ponytail: 단일 프로세스 인메모리 리미터. 인스턴스가 늘면 Redis 등으로 교체.
_hits: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    # Railway/Vercel 프록시 뒤에서는 X-Forwarded-For의 첫 IP가 실제 클라이언트.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check(bucket: str, request: Request, max_requests: int) -> None:
    """엔드포인트별로 별도 카운터를 쓴다 — 검색 한도가 자동완성 때문에 소진되면 안 된다."""
    now = time.monotonic()
    hits = _hits[f"{bucket}:{_client_ip(request)}"]
    while hits and now - hits[0] > WINDOW_SECONDS:
        hits.popleft()
    if len(hits) >= max_requests:
        raise HTTPException(
            status_code=429, detail="요청이 너무 많아요. 잠시 후 다시 시도해 주세요."
        )
    hits.append(now)

    # ponytail: 빈 엔트리 정리(무한 IP 누적 방지). 트래픽 커지면 LRU로 교체.
    if len(_hits) > 10_000:
        for key in [key for key, h in _hits.items() if not h]:
            del _hits[key]


def commute_rate_limit(request: Request) -> None:
    _check("commute", request, MAX_REQUESTS)


def autocomplete_rate_limit(request: Request) -> None:
    _check("autocomplete", request, AUTOCOMPLETE_MAX_REQUESTS)
