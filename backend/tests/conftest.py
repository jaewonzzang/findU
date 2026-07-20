# backend/tests/conftest.py
import os
import sys

# 백엔드 모듈이 패키지가 아니므로 backend/ 를 import 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

import rate_limit


@pytest.fixture(autouse=True)
def reset_rate_limit():
    # 테스트 간 레이트 리밋 카운터 격리
    rate_limit._hits.clear()
    yield
    rate_limit._hits.clear()
