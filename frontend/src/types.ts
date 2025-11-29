// frontend/src/types.ts

export type TransportMode = "transit" | "car";

export interface University {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface CommuteResult {
  university_id: string;
  university_name: string;
  university_address: string;
  duration_minutes: number;
  transport_mode: TransportMode;
  route_summary: string;
}

export interface CommuteResponse {
  results: CommuteResult[];
}
