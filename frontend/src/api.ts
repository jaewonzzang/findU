// frontend/src/api.ts

import type { CommuteResponse, TransportMode, University } from "./types";

const BASE_URL = "http://localhost:8000";

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
    throw new Error("Failed to calculate commute");
  }

  return res.json();
}

export async function searchUniversities(payload: {
  address: string;
  mode: TransportMode;
  maxMinutes: number | null;
}): Promise<CommuteResponse> {
  return fetchCommute(payload.address, payload.mode, payload.maxMinutes);
}
