# backend/auth.py
import logging
import os
import secrets

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

load_dotenv()

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/auth")

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")
KAKAO_CLIENT_SECRET = os.getenv("KAKAO_CLIENT_SECRET")  # 콘솔에서 활성화한 경우만
KAKAO_REDIRECT_URI = os.getenv(
    "KAKAO_REDIRECT_URI", "http://localhost:8000/api/auth/kakao/callback"
)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"


@router.get("/kakao/login")
def kakao_login(request: Request):
    """카카오 로그인 시작: 인가 코드 요청 페이지로 리다이렉트."""
    if not KAKAO_REST_API_KEY:
        raise HTTPException(status_code=500, detail="KAKAO_REST_API_KEY not configured")

    state = secrets.token_urlsafe(16)
    request.session["oauth_state"] = state

    params = httpx.QueryParams(
        {
            "client_id": KAKAO_REST_API_KEY,
            "redirect_uri": KAKAO_REDIRECT_URI,
            "response_type": "code",
            "state": state,
        }
    )
    return RedirectResponse(f"{KAKAO_AUTHORIZE_URL}?{params}")


@router.get("/kakao/callback")
async def kakao_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    """
    카카오 인가 코드 콜백.
    코드를 액세스 토큰으로 교환하고 사용자 정보를 세션에 저장한 뒤
    프론트엔드로 리다이렉트.
    """
    if error or not code:
        logger.error(f"Kakao OAuth error: {error}")
        return RedirectResponse(f"{FRONTEND_URL}?login=failed")

    saved_state = request.session.pop("oauth_state", None)
    if not saved_state or saved_state != state:
        logger.error("Kakao OAuth state mismatch")
        return RedirectResponse(f"{FRONTEND_URL}?login=failed")

    token_data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_REST_API_KEY,
        "redirect_uri": KAKAO_REDIRECT_URI,
        "code": code,
    }
    if KAKAO_CLIENT_SECRET:
        token_data["client_secret"] = KAKAO_CLIENT_SECRET

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            token_res = await client.post(KAKAO_TOKEN_URL, data=token_data)
            token_res.raise_for_status()
            access_token = token_res.json()["access_token"]

            user_res = await client.get(
                KAKAO_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_res.raise_for_status()
            profile = user_res.json()
    except (httpx.HTTPStatusError, httpx.RequestError, KeyError) as e:
        logger.error(f"Kakao token/userinfo failed: {e}")
        return RedirectResponse(f"{FRONTEND_URL}?login=failed")

    account = profile.get("kakao_account") or {}
    kakao_profile = account.get("profile") or {}
    request.session["user"] = {
        "id": profile["id"],
        "nickname": kakao_profile.get("nickname", ""),
        "profile_image": kakao_profile.get("profile_image_url", ""),
    }
    return RedirectResponse(FRONTEND_URL)


@router.get("/me")
def me(request: Request):
    """현재 로그인한 사용자 반환. 미로그인 시 401."""
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
    return user


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"ok": True}
