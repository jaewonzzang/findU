# backend/universities.py

from typing import List, Dict

# 프로토타입용 정적 명문대 리스트 (필요하면 더 추가)
UNIVERSITIES: List[Dict] = [
    {
        "id": "snu",
        "name": "서울대학교",
        "address": "서울특별시 관악구 관악로 1",
        "lat": 37.459882,
        "lng": 126.951905,
    },
    {
        "id": "yonsei",
        "name": "연세대학교 신촌캠퍼스",
        "address": "서울특별시 서대문구 연세로 50",
        "lat": 37.565784,
        "lng": 126.938572,
    },
    {
        "id": "sogang",
        "name": "서강대학교",
        "address": "서울특별시 마포구 백범로 35",
        "lat": 37.550944,
        "lng": 126.941002,
    },
    {
        "id": "korea",
        "name": "고려대학교 안암캠퍼스",
        "address": "서울특별시 성북구 안암로 145",
        "lat": 37.588227,
        "lng": 127.030105,
    },
    {
        "id": "hanyang",
        "name": "한양대학교 서울캠퍼스",
        "address": "서울특별시 성동구 왕십리로 222",
        "lat": 37.557192,
        "lng": 127.045380,
    },
]
