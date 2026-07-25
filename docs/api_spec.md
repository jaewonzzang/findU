# findU API 명세

Base URL (로컬): `http://localhost:8000`
모든 엔드포인트는 `/api` 프리픽스. 인증은 세션 쿠키(`session`) 기반이며 `/api/me/*`는 로그인 필수.

## 공개 엔드포인트

### `GET /api/health`
연동 상태 확인(외부 호출 없음).

```json
{ "status": "ok", "naver_keys": true, "kakao_key": true, "favorites_store": true }
```

### `GET /api/universities`
정적 수도권 38개 대학 목록.

```json
[ { "id": "snu", "name": "서울대학교", "address": "...", "lat": 37.45, "lng": 126.95 } ]
```

### `POST /api/commute`
집 주소 → 각 대학 통학 시간(가까운 순 정렬). IP당 분당 10회 제한.

요청:
```json
{ "address": "서울시청", "transport_mode": "transit", "max_commute_minutes": 60 }
```
- `transport_mode`: `"transit"`(기본) | `"car"`. transit은 차량 시간 × 1.3 + 15분 추산.
- `max_commute_minutes`: `int | null`. null이면 전체 반환.

응답:
```json
{
  "results": [
    {
      "university_id": "snu",
      "university_name": "서울대학교",
      "university_address": "...",
      "duration_minutes": 42,
      "transport_mode": "transit",
      "route_summary": "차량 기준 추산 약 42분",
      "is_fallback": false
    }
  ],
  "home_location": { "lat": 37.5665, "lng": 126.9780 }
}
```
- `is_fallback: true` → API 키 없음/외부 API 실패로 추정치 사용. `home_location: null`도 동반.
- 주소 매칭 0건(입력 오류) → `404` + `{ "detail": "..." }` (폴백하지 않음).

### `GET /api/autocomplete?query=`
Kakao 로컬 키워드 검색 프록시. 2글자 미만이면 빈 배열. IP당 분당 60회.

## 인증 (Kakao OAuth)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/auth/kakao/login` | 카카오 인가 페이지로 리다이렉트 (`state`로 CSRF 방어) |
| GET | `/api/auth/kakao/callback` | 콜백. 성공 시 세션 쿠키 발급, 실패 시 `/?login=failed` |
| GET | `/api/auth/me` | 현재 사용자. 로그아웃 상태면 `401` |
| POST | `/api/auth/logout` | 세션 쿠키 삭제 |

세션 쿠키는 `SESSION_MAX_AGE`(기본 300초) 후 만료. 배포 시 `Secure`, 로컬 http는 `SESSION_HTTPS_ONLY=false`로 해제.

## 즐겨찾기 (로그인 필수 · Supabase)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET / POST | `/api/me/addresses` | 저장 주소 조회 / 추가 |
| DELETE | `/api/me/addresses/{id}` | 저장 주소 삭제 |
| GET | `/api/me/universities` | 관심 대학 조회 |
| PUT / DELETE | `/api/me/universities/{id}` | 관심 대학 추가 / 제거 |

로그아웃 상태로 호출 시 `401`.
