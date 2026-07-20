# backend/tests/conftest.py
import os
import sys

# 백엔드 모듈이 패키지가 아니므로 backend/ 를 import 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
