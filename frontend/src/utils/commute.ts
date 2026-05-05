export type CommuteBand = "fast" | "medium" | "slow";

export function getCommuteBand(minutes: number): CommuteBand {
    if (minutes <= 30) return "fast";
    if (minutes <= 60) return "medium";
    return "slow";
}

export const BAND_COLOR: Record<CommuteBand, string> = {
    fast: "#10B981",
    medium: "#F59E0B",
    slow: "#EF4444",
};
