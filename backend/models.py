# backend/models.py

from typing import Literal, List
from pydantic import BaseModel


TransportMode = Literal["transit", "car"]


class CommuteRequest(BaseModel):
    address: str
    transport_mode: TransportMode = "transit"
    max_commute_minutes: int | None = None


class University(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float


class CommuteResult(BaseModel):
    university_id: str
    university_name: str
    university_address: str
    duration_minutes: int
    transport_mode: TransportMode
    route_summary: str


class CommuteResponse(BaseModel):
    results: List[CommuteResult]
