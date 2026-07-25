# findU

# findU · 집 주소로 찾는 통학 가능 대학
> **집 주소 하나로, 수도권 38개 대학까지의 실제 통학 시간을 계산해 가까운 순으로 보여주는 웹 앱** <br/> **개발기간: 2025.11 ~ 2026.07**

[![CI](https://github.com/jaewonzzang/findU/actions/workflows/ci.yml/badge.svg)](https://github.com/jaewonzzang/findU/actions/workflows/ci.yml)

## 배포 주소

> **Live:** https://find-u-iota.vercel.app/ <br>
> 프론트엔드 Vercel · 백엔드 Railway 2서비스 구성. <br>
> 세션·즐겨찾기 기능은 로그인해야 나타나고, 로그인 없이도 주소 검색은 그대로 쓸 수 있다.

## 만든 사람

|      김재원       |
| :------------------------------: |
| 기획 · 백엔드 · 프론트 · 배포 전부 단독 개발 |

이 리포의 전 커밋을 작성했다.

## 프로젝트 소개

수험생이 대학을 고를 때 "우리 집에서 통학 가능한가"는 중요한 기준이지만, 대학마다 지도 앱을 열어 일일이 길찾기를 돌려봐야 알 수 있다. findU는 집 주소를 **한 번 입력**하면 수도권 주요 대학 38곳(분캠 포함)까지의 통학 시간을 한 번에 계산해 **정렬된 목록과 지도**로 돌려준다.

동작 방식: 입력 주소를 Naver Geocoding으로 좌표로 바꾸고, 각 대학까지 소요 시간을 Naver Directions 5로 병렬 계산한 뒤, 사용자가 설정한 최대 통학 시간으로 필터링해 가까운 순으로 정렬한다.

- **검색** — 주소 입력 → 38개 대학까지 통학 시간 정렬 + 지도 마커
- **자동완성** — Kakao 로컬 키워드 검색으로 도로명 주소 유도
- **로그인(선택)** — Kakao OAuth, 집 주소 저장 · 관심 대학 찜
- **폴백 투명성** — 실측 실패 시 추정치로 계산하되 `is_fallback` 플래그로 실측/추정을 구분

## 시작 가이드

### Requirements

- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) / npm

### Installation

```bash
$ git clone https://github.com/jaewonzzang/findU.git
$ cd findU
```

#### Backend

```bash
$ cd backend
$ pip install -r requirements.txt
$ uvicorn main:app --reload
# → http://localhost:8000/api/health · http://localhost:8000/docs (Swagger)
```

환경 변수는 `backend/.env.example` 참고. Naver 키가 없으면 추정치로 폴백해 그대로 돈다. Kakao OAuth 설정 절차는 [`docs/kakao-oauth-setup.md`](./docs/kakao-oauth-setup.md).

테스트:

```bash
$ cd backend
$ pip install -r requirements-dev.txt
$ pytest tests
```

캐시 격자 공유·주간 초기화, 대중교통 추산식, `/api/commute` 성공·폴백·주소없음(404), 레이트 리밋을 커버한다. 백엔드 테스트와 프론트 빌드는 GitHub Actions CI로 매 push 검증된다.

#### Frontend

```bash
$ cd frontend
$ npm install
$ npm run dev     # http://localhost:5173
```

환경 변수: `VITE_NAVER_MAP_CLIENT_ID` (Naver Maps JS SDK). `/api` 는 dev 프록시로 백엔드에 붙어 프로덕션과 같은 first-party 쿠키 구조로 동작한다.

---

## Stacks 🧭

### Environment
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=Visual%20Studio%20Code&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white)
![Github](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white)

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=Python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=Pydantic&logoColor=white)

### Data / Auth
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=Supabase&logoColor=white)
![Naver](https://img.shields.io/badge/NAVER%20Cloud-03C75A?style=for-the-badge&logo=Naver&logoColor=white)
![Kakao](https://img.shields.io/badge/Kakao%20Login-FFCD00?style=for-the-badge&logo=Kakao&logoColor=black)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=Tailwind%20CSS&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Deploy
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=Vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=Railway&logoColor=white)

---

## 화면 구성 📺

![주요 화면](docs/demo.gif)

---

## 주요 기능 📦

### ⭐️ 통학 시간 검색
- 주소 1건 입력 → 수도권 대학 38곳까지 통학 시간을 **병렬 계산**(`asyncio.gather`)해 가까운 순 정렬
- 왼쪽 **최대 통학 시간** 슬라이더로 지도 마커·리스트를 실시간 필터
- 결과는 지도 마커 + Framer Motion 애니메이션 리스트로 동시 렌더링

### ⭐️ 주소 자동완성
- Naver Geocoding이 POI("강남역")를 못 잡아, Kakao 로컬 키워드 검색을 프록시해 **도로명 주소를 고르도록** 유도

### ⭐️ 로그인 · 즐겨찾기 (Kakao OAuth)
- 세션 쿠키 기반 로그인, `state` 파라미터로 CSRF 방어
- 검색한 집 주소 저장 → **클릭 한 번으로 재검색**, 대학 목록에서 관심 대학 찜
- 저장 주소·관심 대학은 프로필 패널에 모으고, 지도에선 각각 **별 핀 · 학사모 마커**로 구분

### ⭐️ 폴백 투명성
- API 키가 없거나 외부 API가 실패하면 추정치로 폴백하고 결과에 `is_fallback` 표시
- 반대로 주소 매칭이 0건(입력 오류)이면 폴백하지 않고 **404 + 안내 메시지** 반환

### ⭐️ 쿼터 보호 · 개인정보 최소화
- `/api/commute` IP당 분당 10회, `/api/autocomplete` 60회 레이트 리밋(엔드포인트별 분리 버킷)
- 쿠키 동의를 묻고, 동의 기록·세션 모두 5분(`SESSION_MAX_AGE`)이면 만료. 광고·분석 쿠키 없음

---

## 아키텍처

```
주소 입력 (자동완성: Kakao 키워드 검색 프록시)
   │
   ▼
POST /api/commute
   │
   ├─ Naver Geocoding: 주소 → 좌표
   ├─ 주간 캐시 조회 (좌표 110m 격자 + 대학 + 교통수단 키)
   ├─ 캐시 미스분만 Naver Directions 5 병렬 호출 (asyncio.gather)
   │    └─ 대중교통 모드: 차량 시간 × 1.3 + 15분으로 추산
   ▼
최대 통학시간 필터 → 시간순 정렬 → 프론트에서 지도 마커 + 애니메이션 리스트 렌더링
```

### 디렉토리 구조

```bash
├── README.md
├── CLAUDE.md : 작업 가드레일 (아키텍처·엔드포인트·제약)
├── .github/workflows/ci.yml : 백엔드 테스트 + 프론트 빌드
│
├── backend/ : FastAPI + httpx (외부 API 비동기 호출)
│   ├── main.py : 앱 · CORS/세션 미들웨어 · 핵심 엔드포인트
│   ├── models.py : Pydantic 입출력 (SearchRequest/Response, University)
│   ├── commute_service.py : 지오코딩 + 경로 계산 오케스트레이션
│   ├── commute_cache.py : 주간 인메모리 캐시 (110m 격자 공유)
│   ├── naver_client.py : Naver Geocoding + Directions 5
│   ├── kakao_client.py : Kakao 로컬 키워드 검색 (자동완성 프록시)
│   ├── auth.py : Kakao OAuth (세션 쿠키)
│   ├── favorites.py : 저장 주소·관심 대학 (Supabase PostgREST)
│   ├── rate_limit.py : IP당 엔드포인트별 레이트 리밋
│   ├── universities.py / .json : 정적 수도권 38개 대학
│   └── tests/ : pytest (외부 호출 모킹)
│
├── frontend/ : Vite + React 18 + TypeScript + Tailwind
│   └── src/
│       ├── App.tsx : React Router (/ , /universities , /about)
│       ├── api.ts : 백엔드 fetch 래퍼
│       ├── hooks/ : useSearch · useAuth · useFavorites
│       ├── components/ : MinimalSearchBar, MapContainer, AuthButton,
│       │                 SavedAddresses, CookieConsent ...
│       ├── pages/ : UniversityList · About
│       ├── data/ : 대학 목록 · 자동완성 정적 데이터
│       └── types/ : 공유 TypeScript 인터페이스
│
└── docs/ : API 명세 · Kakao OAuth 설정 · 데모
```

## 핵심 구현 결정

**1. 통근 시간은 주간 인메모리 캐시** (`backend/commute_cache.py`)

한 번의 검색이 대학 38곳에 대한 Directions API 호출 38건을 발생시킨다. 쿼터를 아끼기 위해 (출발 좌표, 대학, 교통수단) 단위로 캐싱하되, 좌표를 소수점 3자리(약 110m 격자)로 반올림해 근처 주소끼리 캐시를 공유하게 했다. 통학 시간은 교통 패턴에 따라 변하므로 캐시는 매주 월요일 자정(KST)에 전체 초기화된다. 어차피 주기적으로 버리는 데이터라 DB 없이 인메모리로 유지하고, 프로세스 재시작 시 캐시가 날아가는 비용은 감수한다.

**2. 대중교통 시간은 차량 기준 추산** (`backend/naver_client.py`)

NCP에 공개 대중교통 길찾기 API가 없다. 대중교통 모드를 빼는 대신 차량 소요 시간 × 1.3 + 15분이라는 보수적 추산식을 쓰고, 결과 요약에 "차량 기준 추산"임을 명시했다. 정확도를 일부 포기하는 대신 추정치임을 사용자에게 투명하게 알리는 쪽을 택했다.

**3. 사용자 데이터가 생기면서 Supabase Postgres 도입** (`backend/favorites.py`)

즐겨찾기(저장 주소·관심 대학)는 통근 캐시와 달리 재시작 후에도 남아야 해서, 이 시점에 처음 DB를 붙였다. 별도 클라이언트 라이브러리 없이 이미 쓰던 httpx로 Supabase PostgREST를 직접 호출하고, 테이블은 RLS를 켠 뒤 정책을 만들지 않는 방식으로 잠가 백엔드의 service role 키로만 접근하게 했다.

## 한계와 다음 단계

현재 알고 있는 한계와, 그대로 둔 이유를 적어 둔다.

| 한계 | 지금 상태 | 다음 단계 |
|---|---|---|
| 대중교통 시간이 추산값 | NCP에 공개 대중교통 길찾기 API가 없어 `차량 × 1.3 + 15분`으로 계산하고 UI에 "차량 기준 추산" 명시 | ODsay 등 외부 대중교통 API 연동, 또는 지하철 노선 데이터로 직접 계산 |
| 주소만 지오코딩 가능 | NCP Geocoding이 POI 미지원 → Kakao 키워드 검색 자동완성으로 우회 | 자동완성 결과 좌표를 그대로 넘겨 지오코딩 단계 생략 |
| 캐시가 인메모리·단일 프로세스 | 주간 단위로 버리는 데이터라 영속화 이득이 적다고 판단 | 인스턴스를 늘리면 Redis로 이전 |
| 레이트 리밋도 단일 프로세스 | 같은 이유로 프로세스 메모리에 카운터 | Redis 기반 공유 카운터 |
| 대학 목록이 정적 JSON | 수도권 38곳으로 한정해 좌표를 검증된 값으로 고정 | 전국 확대 시 대학알리미 공공데이터로 교체 |
| 세션이 5분 | 개인정보를 오래 들고 있지 않으려는 선택 | 리프레시 토큰 또는 `SESSION_MAX_AGE` 상향 |
