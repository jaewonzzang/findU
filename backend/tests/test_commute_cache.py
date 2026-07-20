# backend/tests/test_commute_cache.py
import pytest

import commute_cache


@pytest.fixture(autouse=True)
def clean_cache():
    commute_cache._cache.clear()
    commute_cache._epoch = commute_cache._week_anchor()
    yield
    commute_cache._cache.clear()


def test_put_then_get_returns_value():
    commute_cache.put(37.5665, 126.9780, "snu", "transit", 42, "약 42분")
    assert commute_cache.get(37.5665, 126.9780, "snu", "transit") == (42, "약 42분")


def test_nearby_coords_share_grid_cell():
    # 소수점 3자리 반올림(약 110m 격자) → 같은 셀이면 캐시 히트
    commute_cache.put(37.5665, 126.9780, "snu", "transit", 42, "약 42분")
    assert commute_cache.get(37.56649, 126.97801, "snu", "transit") == (42, "약 42분")


def test_far_coords_miss():
    commute_cache.put(37.5665, 126.9780, "snu", "transit", 42, "약 42분")
    assert commute_cache.get(37.5765, 126.9880, "snu", "transit") is None


def test_university_and_mode_are_part_of_key():
    commute_cache.put(37.5665, 126.9780, "snu", "transit", 42, "약 42분")
    assert commute_cache.get(37.5665, 126.9780, "yonsei", "transit") is None
    assert commute_cache.get(37.5665, 126.9780, "snu", "car") is None


def test_week_rotation_wipes_cache(monkeypatch):
    commute_cache.put(37.5665, 126.9780, "snu", "transit", 42, "약 42분")
    # 다음 주 월요일로 시간 이동한 것처럼 앵커 변경
    monkeypatch.setattr(commute_cache, "_week_anchor", lambda: "2099-01-04")
    assert commute_cache.get(37.5665, 126.9780, "snu", "transit") is None
    assert commute_cache._cache == {}
