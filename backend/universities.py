# backend/universities.py

from typing import List, Dict

# 수도권 주요 대학 31개 (서울/경기/인천)
# 좌표는 캠퍼스 정문/본관 기준 근사값
UNIVERSITIES: List[Dict] = sorted([
    {"id": "gachon", "name": "가천대학교", "address": "경기도 성남시 수정구 성남대로 1342", "lat": 37.4507, "lng": 127.1288},
    {"id": "konkuk", "name": "건국대학교", "address": "서울특별시 광진구 능동로 120", "lat": 37.5408, "lng": 127.0793},
    {"id": "kyunghee", "name": "경희대학교", "address": "서울특별시 동대문구 경희대로 26", "lat": 37.5964, "lng": 127.0526},
    {"id": "korea", "name": "고려대학교", "address": "서울특별시 성북구 안암로 145", "lat": 37.5891, "lng": 127.0329},
    {"id": "kwangwoon", "name": "광운대학교", "address": "서울특별시 노원구 광운로 20", "lat": 37.6203, "lng": 127.0550},
    {"id": "kookmin", "name": "국민대학교", "address": "서울특별시 성북구 정릉로 77", "lat": 37.6109, "lng": 126.9972},
    {"id": "dankook", "name": "단국대학교", "address": "경기도 용인시 수지구 죽전로 152", "lat": 37.3218, "lng": 127.1268},
    {"id": "duksung", "name": "덕성여자대학교", "address": "서울특별시 도봉구 삼양로144길 33", "lat": 37.6515, "lng": 127.0174},
    {"id": "dongguk", "name": "동국대학교", "address": "서울특별시 중구 필동로1길 30", "lat": 37.5583, "lng": 127.0007},
    {"id": "myongji", "name": "명지대학교", "address": "서울특별시 서대문구 거북골로 34", "lat": 37.5802, "lng": 126.9234},
    {"id": "samyook", "name": "삼육대학교", "address": "서울특별시 노원구 화랑로 815", "lat": 37.6418, "lng": 127.1050},
    {"id": "sangmyung", "name": "상명대학교", "address": "서울특별시 종로구 홍지문2길 20", "lat": 37.6005, "lng": 126.9553},
    {"id": "sogang", "name": "서강대학교", "address": "서울특별시 마포구 백범로 35", "lat": 37.5521, "lng": 126.9410},
    {"id": "seoultech", "name": "서울과학기술대학교", "address": "서울특별시 노원구 공릉로 232", "lat": 37.6317, "lng": 127.0775},
    {"id": "snue", "name": "서울교육대학교", "address": "서울특별시 서초구 반포대로 13", "lat": 37.4899, "lng": 127.0153},
    {"id": "snu", "name": "서울대학교", "address": "서울특별시 관악구 관악로 1", "lat": 37.4599, "lng": 126.9519},
    {"id": "uos", "name": "서울시립대학교", "address": "서울특별시 동대문구 서울시립대로 163", "lat": 37.5838, "lng": 127.0583},
    {"id": "seoul_women", "name": "서울여자대학교", "address": "서울특별시 노원구 화랑로 621", "lat": 37.6291, "lng": 127.0905},
    {"id": "skku", "name": "성균관대학교", "address": "서울특별시 종로구 성균관로 25-2", "lat": 37.5882, "lng": 126.9936},
    {"id": "sungshin", "name": "성신여자대학교", "address": "서울특별시 성북구 보문로34다길 2", "lat": 37.5913, "lng": 127.0221},
    {"id": "sejong", "name": "세종대학교", "address": "서울특별시 광진구 능동로 209", "lat": 37.5509, "lng": 127.0740},
    {"id": "sookmyung", "name": "숙명여자대학교", "address": "서울특별시 용산구 청파로47길 100", "lat": 37.5466, "lng": 126.9648},
    {"id": "soongsil", "name": "숭실대학교", "address": "서울특별시 동작구 상도로 369", "lat": 37.4964, "lng": 126.9575},
    {"id": "yonsei", "name": "연세대학교", "address": "서울특별시 서대문구 연세로 50", "lat": 37.5664, "lng": 126.9388},
    {"id": "ewha", "name": "이화여자대학교", "address": "서울특별시 서대문구 이화여대길 52", "lat": 37.5619, "lng": 126.9468},
    {"id": "inha", "name": "인하대학교", "address": "인천광역시 미추홀구 인하로 100", "lat": 37.4494, "lng": 126.6534},
    {"id": "cau", "name": "중앙대학교", "address": "서울특별시 동작구 흑석로 84", "lat": 37.5051, "lng": 126.9571},
    {"id": "hufs", "name": "한국외국어대학교", "address": "서울특별시 동대문구 이문로 107", "lat": 37.5648, "lng": 126.9394},
    {"id": "hansung", "name": "한성대학교", "address": "서울특별시 성북구 삼선교로16길 116", "lat": 37.5824, "lng": 127.0104},
    {"id": "hanyang", "name": "한양대학교", "address": "서울특별시 성동구 왕십리로 222", "lat": 37.5538, "lng": 127.0400},
    {"id": "hongik", "name": "홍익대학교", "address": "서울특별시 마포구 와우산로 94", "lat": 37.5515, "lng": 126.9250},
], key=lambda x: x["name"])
