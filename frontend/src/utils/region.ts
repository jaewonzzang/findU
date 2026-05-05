export type Region = "서울" | "경기" | "인천";

export const ALL_REGIONS: Region[] = ["서울", "경기", "인천"];

export function getRegion(address: string): Region | null {
    if (address.startsWith("서울")) return "서울";
    if (address.startsWith("경기")) return "경기";
    if (address.startsWith("인천")) return "인천";
    return null;
}
