# backend/tests/test_api.py
import pytest
from fastapi.testclient import TestClient

import commute_cache
import commute_service
from main import app
from naver_client import AddressNotFoundError

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_cache():
    commute_cache._cache.clear()
    yield
    commute_cache._cache.clear()


def _search(address="서울시청", mode="transit", max_minutes=None):
    return client.post(
        "/api/commute",
        json={"address": address, "transport_mode": mode, "max_commute_minutes": max_minutes},
    )


def test_commute_success_sorted_by_duration(monkeypatch):
    async def fake_geocode(client, address):
        return 37.5665, 126.9780

    durations = iter(range(90, 0, -2))  # 일부러 내림차순으로 반환

    async def fake_direction(client, **kwargs):
        d = next(durations)
        return d, f"차량 이동 약 {d}분"

    monkeypatch.setattr(commute_service, "get_geocode", fake_geocode)
    monkeypatch.setattr(commute_service, "get_direction_duration", fake_direction)

    res = _search()
    assert res.status_code == 200
    body = res.json()
    assert body["home_location"] == {"lat": 37.5665, "lng": 126.9780}
    assert len(body["results"]) > 0
    result_durations = [r["duration_minutes"] for r in body["results"]]
    assert result_durations == sorted(result_durations)
    assert all(r["is_fallback"] is False for r in body["results"])


def test_commute_unknown_address_returns_404(monkeypatch):
    async def fake_geocode(client, address):
        raise AddressNotFoundError(address)

    monkeypatch.setattr(commute_service, "get_geocode", fake_geocode)

    res = _search(address="존재하지않는주소12345")
    assert res.status_code == 404
    assert "주소" in res.json()["detail"]


def test_commute_api_unavailable_falls_back(monkeypatch):
    async def fake_geocode(client, address):
        return None

    monkeypatch.setattr(commute_service, "get_geocode", fake_geocode)

    res = _search()
    assert res.status_code == 200
    body = res.json()
    assert body["home_location"] is None
    assert all(r["is_fallback"] is True for r in body["results"])


def test_commute_max_minutes_filters_results(monkeypatch):
    async def fake_geocode(client, address):
        return 37.5665, 126.9780

    durations = iter(range(10, 200, 5))

    async def fake_direction(client, **kwargs):
        d = next(durations)
        return d, f"차량 이동 약 {d}분"

    monkeypatch.setattr(commute_service, "get_geocode", fake_geocode)
    monkeypatch.setattr(commute_service, "get_direction_duration", fake_direction)

    res = _search(max_minutes=30)
    assert res.status_code == 200
    assert all(r["duration_minutes"] <= 30 for r in res.json()["results"])


def test_autocomplete_short_query_returns_empty_without_calling_kakao():
    res = client.get("/api/autocomplete", params={"query": "a"})
    assert res.status_code == 200
    assert res.json() == []


def test_universities_endpoint_returns_static_list():
    res = client.get("/api/universities")
    assert res.status_code == 200
    body = res.json()
    assert len(body) > 0
    assert {"id", "name", "address", "lat", "lng"} <= set(body[0].keys())
