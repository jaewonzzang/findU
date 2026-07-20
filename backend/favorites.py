# backend/favorites.py
"""
로그인 사용자의 저장 주소 / 관심 대학.
저장소는 Supabase Postgres — 백엔드가 service role 키로 PostgREST REST API를 직접 호출한다.
(클라이언트 라이브러리 없이 httpx 재사용. 테이블은 RLS로 잠겨 있어 service role만 접근 가능.)
"""

import os

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

router = APIRouter(prefix="/api/me")


def current_user_id(request: Request) -> int:
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
    return user["id"]


async def _sb(method: str, table: str, params: dict, json: dict | list | None = None) -> list:
    """Supabase PostgREST 호출. 항상 row 리스트를 반환."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=503, detail="즐겨찾기 저장소가 설정되지 않았어요.")

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Prefer": "return=representation,resolution=merge-duplicates",
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.request(
                method, f"{SUPABASE_URL}/rest/v1/{table}", params=params, json=json, headers=headers
            )
            res.raise_for_status()
            return res.json() if res.content else []
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        raise HTTPException(status_code=502, detail="즐겨찾기 저장소 요청에 실패했어요.") from e


class SavedAddressIn(BaseModel):
    address: str
    lat: float | None = None
    lng: float | None = None


@router.get("/addresses")
async def list_addresses(user_id: int = Depends(current_user_id)):
    return await _sb(
        "GET",
        "saved_addresses",
        {
            "kakao_user_id": f"eq.{user_id}",
            "select": "id,address,lat,lng",
            "order": "created_at.desc",
        },
    )


@router.post("/addresses")
async def save_address(body: SavedAddressIn, user_id: int = Depends(current_user_id)):
    address = body.address.strip()
    if not address:
        raise HTTPException(status_code=422, detail="주소가 비어 있어요.")
    rows = await _sb(
        "POST",
        "saved_addresses",
        {"on_conflict": "kakao_user_id,address", "select": "id,address,lat,lng"},
        json={"kakao_user_id": user_id, "address": address, "lat": body.lat, "lng": body.lng},
    )
    return rows[0] if rows else {}


@router.delete("/addresses/{address_id}")
async def delete_address(address_id: int, user_id: int = Depends(current_user_id)):
    await _sb(
        "DELETE",
        "saved_addresses",
        {"id": f"eq.{address_id}", "kakao_user_id": f"eq.{user_id}"},
    )
    return {"ok": True}


@router.get("/universities")
async def list_favorite_universities(user_id: int = Depends(current_user_id)):
    rows = await _sb(
        "GET",
        "favorite_universities",
        {"kakao_user_id": f"eq.{user_id}", "select": "university_id"},
    )
    return [row["university_id"] for row in rows]


@router.put("/universities/{university_id}")
async def add_favorite_university(university_id: str, user_id: int = Depends(current_user_id)):
    await _sb(
        "POST",
        "favorite_universities",
        {"on_conflict": "kakao_user_id,university_id", "select": "university_id"},
        json={"kakao_user_id": user_id, "university_id": university_id},
    )
    return {"ok": True}


@router.delete("/universities/{university_id}")
async def remove_favorite_university(university_id: str, user_id: int = Depends(current_user_id)):
    await _sb(
        "DELETE",
        "favorite_universities",
        {"university_id": f"eq.{university_id}", "kakao_user_id": f"eq.{user_id}"},
    )
    return {"ok": True}
