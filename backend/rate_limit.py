# backend/rate_limit.py
"""
/api/commute 남용 방지용 IP당 레이트 리밋.
검색 1회가 Naver Directions 호출 최대 38건을 유발하므로 외부 API 쿼터 보호가 목적.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

WINDOW_SECONDS = 60
MAX_REQUESTS = 10

# ponytail: 단일 프로세스 인메모리 리미터. 인스턴스가 늘면 Redis 등으로 교체.
_hits: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    # Railway/Vercel 프록시 뒤에서는 X-Forwarded-For의 첫 IP가 실제 클라이언트.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def commute_rate_limit(request: Request) -> None:
    now = time.monotonic()
    hits = _hits[_client_ip(request)]
    while hits and now - hits[0] > WINDOW_SECONDS:
        hits.popleft()
    if len(hits) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429, detail="요청이 너무 많아요. 잠시 후 다시 시도해 주세요."
        )
    hits.append(now)

    # ponytail: 빈 엔트리 정리(무한 IP 누적 방지). 트래픽 커지면 LRU로 교체.
    if len(_hits) > 10_000:
        for ip in [ip for ip, h in _hits.items() if not h]:
            del _hits[ip]
