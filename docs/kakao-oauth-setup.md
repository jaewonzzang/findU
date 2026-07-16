# 카카오 OAuth 설정 가이드

코드는 전부 구현 완료. 아래만 하면 로그인 동작함.

## 1. Kakao Developers 콘솔 (https://developers.kakao.com)

1. **내 애플리케이션** → 기존 findU 앱 선택 (autocomplete에 쓰는 REST API 키 그대로 재사용)
2. **제품 설정 → 카카오 로그인** → 활성화 ON
3. **카카오 로그인 → Redirect URI** 등록:
   - 개발: `http://localhost:8000/api/auth/kakao/callback`
   - 배포 시: `https://<railway-backend-domain>/api/auth/kakao/callback` 추가
4. **카카오 로그인 → 동의항목**:
   - 닉네임 → 필수 동의
   - 프로필 사진 → 선택 동의
5. (선택) **카카오 로그인 → 보안 → Client Secret** 생성 후 "사용함" 설정
   - 켰으면 `.env`의 `KAKAO_CLIENT_SECRET`에 값 입력. 안 켰으면 비워둠.

## 2. backend/.env 추가

```
KAKAO_REST_API_KEY=  # 이미 있음 (autocomplete용과 동일 키)
KAKAO_CLIENT_SECRET=           # 콘솔에서 활성화한 경우만
KAKAO_REDIRECT_URI=http://localhost:8000/api/auth/kakao/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=<랜덤 문자열>    # python -c "import secrets; print(secrets.token_hex(32))"
SESSION_SAMESITE=lax
```

## 3. 의존성 설치

```bash
cd backend
pip install -r requirements.txt   # itsdangerous 추가됨
```

## 흐름 요약

1. 프론트 "카카오 로그인" 버튼 → `GET /api/auth/kakao/login` → 카카오 동의 화면
2. 카카오 → `GET /api/auth/kakao/callback?code=...` → 토큰 교환 + 유저 조회 → 세션 쿠키 발급 → `FRONTEND_URL`로 리다이렉트
3. 프론트 `useAuth` 훅이 `GET /api/auth/me`로 로그인 상태 확인 (쿠키 기반)
4. 로그아웃: `POST /api/auth/logout`

## 배포 시 주의

- 프론트(Vercel 등)와 백엔드(Railway) 도메인이 다르면 쿠키가 cross-site →
  `SESSION_SAMESITE=none` 필요 (자동으로 Secure 쿠키 됨, https 필수)
- `FRONTEND_URL`, `KAKAO_REDIRECT_URI`, `ALLOWED_ORIGINS`을 배포 도메인으로 변경
- 실패 시 프론트로 `?login=failed` 쿼리와 함께 리다이렉트됨 (현재 UI는 조용히 무시)
