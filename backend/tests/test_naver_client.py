# backend/tests/test_naver_client.py
import asyncio

import pytest

import naver_client
from naver_client import AddressNotFoundError, get_direction_duration, get_geocode


class StubResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code
        self.text = ""

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}")

    def json(self):
        return self._payload


class StubClient:
    def __init__(self, payload, status_code=200):
        self._response = StubResponse(payload, status_code)

    async def get(self, *args, **kwargs):
        return self._response


@pytest.fixture(autouse=True)
def naver_keys(monkeypatch):
    monkeypatch.setattr(naver_client, "NAVER_CLIENT_ID", "test-id")
    monkeypatch.setattr(naver_client, "NAVER_CLIENT_SECRET", "test-secret")


def _directions_payload(duration_minutes: int):
    return {
        "code": 0,
        "route": {"trafast": [{"summary": {"duration": duration_minutes * 60 * 1000}}]},
    }


def test_transit_duration_is_estimated_from_driving():
    client = StubClient(_directions_payload(30))
    result = asyncio.run(
        get_direction_duration(client, start_lat=37.5, start_lng=127.0, end_lat=37.6, end_lng=127.1, mode="transit")
    )
    assert result is not None
    duration, summary = result
    assert duration == int(30 * 1.3 + 15)  # 54
    assert "추산" in summary


def test_car_duration_is_raw_driving_time():
    client = StubClient(_directions_payload(30))
    result = asyncio.run(
        get_direction_duration(client, start_lat=37.5, start_lng=127.0, end_lat=37.6, end_lng=127.1, mode="car")
    )
    assert result == (30, "차량 이동 약 30분")


def test_directions_missing_keys_returns_none(monkeypatch):
    monkeypatch.setattr(naver_client, "NAVER_CLIENT_ID", None)
    client = StubClient(_directions_payload(30))
    result = asyncio.run(
        get_direction_duration(client, start_lat=37.5, start_lng=127.0, end_lat=37.6, end_lng=127.1)
    )
    assert result is None


def test_directions_http_error_returns_none():
    client = StubClient({}, status_code=500)
    result = asyncio.run(
        get_direction_duration(client, start_lat=37.5, start_lng=127.0, end_lat=37.6, end_lng=127.1)
    )
    assert result is None


def test_geocode_returns_lat_lng():
    client = StubClient({"addresses": [{"y": "37.5665", "x": "126.9780"}]})
    result = asyncio.run(get_geocode(client, "서울시청"))
    assert result == (37.5665, 126.9780)


def test_geocode_no_match_raises_address_not_found():
    client = StubClient({"addresses": []})
    with pytest.raises(AddressNotFoundError):
        asyncio.run(get_geocode(client, "존재하지않는주소12345"))


def test_geocode_http_error_falls_back_to_none():
    client = StubClient({}, status_code=500)
    assert asyncio.run(get_geocode(client, "서울시청")) is None


def test_geocode_missing_keys_returns_none(monkeypatch):
    monkeypatch.setattr(naver_client, "NAVER_CLIENT_SECRET", None)
    client = StubClient({"addresses": [{"y": "37.5", "x": "127.0"}]})
    assert asyncio.run(get_geocode(client, "서울시청")) is None
