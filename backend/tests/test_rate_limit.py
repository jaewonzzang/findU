# backend/tests/test_rate_limit.py
from fastapi.testclient import TestClient

import commute_service
import rate_limit
from main import app

client = TestClient(app)


def _search():
    return client.post("/api/commute", json={"address": "서울시청", "transport_mode": "car"})


def test_commute_rate_limited_after_max_requests(monkeypatch):
    async def fake_geocode(client, address):
        return None  # 폴백 경로로 외부 호출 없이 빠르게

    monkeypatch.setattr(commute_service, "get_geocode", fake_geocode)

    for _ in range(rate_limit.MAX_REQUESTS):
        assert _search().status_code == 200

    res = _search()
    assert res.status_code == 429
    assert "잠시 후" in res.json()["detail"]


def test_rate_limit_is_per_ip(monkeypatch):
    async def fake_geocode(client, address):
        return None

    monkeypatch.setattr(commute_service, "get_geocode", fake_geocode)

    for _ in range(rate_limit.MAX_REQUESTS):
        assert _search().status_code == 200

    # 다른 IP(X-Forwarded-For)는 별도 카운터
    res = client.post(
        "/api/commute",
        json={"address": "서울시청", "transport_mode": "car"},
        headers={"X-Forwarded-For": "203.0.113.9"},
    )
    assert res.status_code == 200


def _autocomplete():
    # 2글자 미만이라 Kakao를 호출하지 않지만 리밋은 그대로 적용된다
    return client.get("/api/autocomplete?query=a")


def test_autocomplete_limit_is_separate_from_commute(monkeypatch):
    async def fake_geocode(client, address):
        return None

    monkeypatch.setattr(commute_service, "get_geocode", fake_geocode)

    for _ in range(rate_limit.MAX_REQUESTS):
        assert _search().status_code == 200
    assert _search().status_code == 429

    # 검색 한도를 다 써도 자동완성은 자기 카운터를 쓴다
    assert _autocomplete().status_code == 200


def test_autocomplete_rate_limited_at_its_own_max():
    for _ in range(rate_limit.AUTOCOMPLETE_MAX_REQUESTS):
        assert _autocomplete().status_code == 200
    assert _autocomplete().status_code == 429
