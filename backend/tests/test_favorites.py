# backend/tests/test_favorites.py
import pytest
from fastapi.testclient import TestClient

import favorites
from main import app

client = TestClient(app)

USER_ID = 12345


@pytest.fixture
def logged_in():
    app.dependency_overrides[favorites.current_user_id] = lambda: USER_ID
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def sb_recorder(monkeypatch):
    """_sb 호출을 기록하고 미리 정한 응답을 돌려주는 페이크."""
    calls = []
    responses = {"rows": []}

    async def fake_sb(method, table, params, json=None):
        calls.append({"method": method, "table": table, "params": params, "json": json})
        return responses["rows"]

    monkeypatch.setattr(favorites, "_sb", fake_sb)
    return calls, responses


def test_addresses_require_login():
    assert client.get("/api/me/addresses").status_code == 401


def test_list_addresses_scoped_to_user(logged_in, sb_recorder):
    calls, responses = sb_recorder
    responses["rows"] = [{"id": 1, "address": "서울시청", "lat": 37.5, "lng": 127.0}]

    res = client.get("/api/me/addresses")
    assert res.status_code == 200
    assert res.json()[0]["address"] == "서울시청"
    assert calls[0]["params"]["kakao_user_id"] == f"eq.{USER_ID}"


def test_save_address_upserts(logged_in, sb_recorder):
    calls, responses = sb_recorder
    responses["rows"] = [{"id": 1, "address": "서울시청", "lat": 37.5, "lng": 127.0}]

    res = client.post("/api/me/addresses", json={"address": " 서울시청 ", "lat": 37.5, "lng": 127.0})
    assert res.status_code == 200
    assert res.json()["id"] == 1
    call = calls[0]
    assert call["method"] == "POST"
    assert call["params"]["on_conflict"] == "kakao_user_id,address"
    assert call["json"]["address"] == "서울시청"  # 공백 트림
    assert call["json"]["kakao_user_id"] == USER_ID


def test_save_blank_address_rejected(logged_in, sb_recorder):
    res = client.post("/api/me/addresses", json={"address": "   "})
    assert res.status_code == 422


def test_delete_address_scoped_to_user(logged_in, sb_recorder):
    calls, _ = sb_recorder
    res = client.delete("/api/me/addresses/7")
    assert res.status_code == 200
    assert calls[0]["params"] == {"id": "eq.7", "kakao_user_id": f"eq.{USER_ID}"}


def test_favorite_universities_roundtrip(logged_in, sb_recorder):
    calls, responses = sb_recorder
    responses["rows"] = [{"university_id": "snu"}, {"university_id": "yonsei"}]

    assert client.get("/api/me/universities").json() == ["snu", "yonsei"]
    assert client.put("/api/me/universities/korea").status_code == 200
    assert client.delete("/api/me/universities/snu").status_code == 200

    put_call = calls[1]
    assert put_call["json"] == {"kakao_user_id": USER_ID, "university_id": "korea"}
    delete_call = calls[2]
    assert delete_call["params"]["university_id"] == "eq.snu"


def test_storage_unconfigured_returns_503(logged_in, monkeypatch):
    monkeypatch.setattr(favorites, "SUPABASE_URL", None)
    res = client.get("/api/me/addresses")
    assert res.status_code == 503
