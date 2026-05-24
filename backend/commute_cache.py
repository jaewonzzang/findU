# backend/commute_cache.py
"""
주간 통근시간 캐시.
같은 주(월요일 00:00 KST 기준) 내 동일 (집 좌표, 대학, 교통수단) 조회는 캐시 응답.
월요일 자정이 지나면 dict 전체 자동 wipe → 새 주의 traffic으로 자연 갱신.
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple

from models import TransportMode

_KST = timezone(timedelta(hours=9))
_COORD_PRECISION = 3  # 약 110m 격자


def _week_anchor() -> str:
    """현재 주의 월요일 KST 날짜 (YYYY-MM-DD)."""
    now = datetime.now(_KST)
    monday = (now - timedelta(days=now.weekday())).date()
    return monday.isoformat()


CacheKey = Tuple[float, float, str, str]
CacheValue = Tuple[int, str]

_cache: Dict[CacheKey, CacheValue] = {}
_epoch: str = _week_anchor()


def _maybe_rotate() -> None:
    """월요일 자정 경계 통과 시 dict 전체 wipe."""
    global _epoch
    current = _week_anchor()
    if current != _epoch:
        _cache.clear()
        _epoch = current


def _make_key(start_lat: float, start_lng: float, uni_id: str, mode: TransportMode) -> CacheKey:
    return (round(start_lat, _COORD_PRECISION), round(start_lng, _COORD_PRECISION), uni_id, mode)


def get(start_lat: float, start_lng: float, uni_id: str, mode: TransportMode) -> Optional[CacheValue]:
    _maybe_rotate()
    return _cache.get(_make_key(start_lat, start_lng, uni_id, mode))


def put(start_lat: float, start_lng: float, uni_id: str, mode: TransportMode, duration: int, summary: str) -> None:
    _maybe_rotate()
    _cache[_make_key(start_lat, start_lng, uni_id, mode)] = (duration, summary)
