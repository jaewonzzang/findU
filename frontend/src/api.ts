// frontend/src/api.ts

import { CommuteResponse, University, TransportMode } from "./types/university";

// 미설정 시 상대 경로 → 같은 도메인(Vercel rewrite 프록시)으로 요청
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export async function fetchUniversities(): Promise<University[]> {
  const res = await fetch(`${BASE_URL}/api/universities`);
  if (!res.ok) {
    throw new Error("Failed to load universities");
  }
  return res.json();
}

export async function fetchCommute(
  address: string,
  mode: TransportMode,
  maxMinutes: number | null
): Promise<CommuteResponse> {
  const res = await fetch(`${BASE_URL}/api/commute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      address,
      transport_mode: mode,
      max_commute_minutes: maxMinutes
    })
  });

  if (!res.ok) {
    const detail = await res
      .json()
      .then((body) => (typeof body?.detail === "string" ? body.detail : null))
      .catch(() => null);
    throw new Error(detail ?? "통학 시간 계산에 실패했어요. 잠시 후 다시 시도해 주세요.");
  }

  return res.json();
}

export interface AuthUser {
  id: number;
  nickname: string;
  profile_image: string;
}

export const kakaoLoginUrl = `${BASE_URL}/api/auth/kakao/login`;

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    credentials: "include"
  });
  if (!res.ok) return null;
  return res.json();
}

export async function logoutRequest(): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
}

export async function searchUniversities(payload: {
  address: string;
  mode: TransportMode;
  maxMinutes: number | null;
}): Promise<CommuteResponse> {
  return fetchCommute(payload.address, payload.mode, payload.maxMinutes);
}
