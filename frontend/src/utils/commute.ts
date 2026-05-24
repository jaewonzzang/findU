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

export function getCommuteColor(durationMinutes: number, maxMinutes: number): string {
    if (maxMinutes <= 0) return "hsl(120, 70%, 45%)";
    const ratio = durationMinutes / maxMinutes;
    if (ratio <= 0.5) return "hsl(120, 70%, 45%)";
    if (ratio >= 0.9) return "hsl(0, 75%, 40%)";
    const t = (ratio - 0.5) / 0.4;
    const hue = 120 * (1 - t);
    return `hsl(${hue.toFixed(1)}, 70%, 45%)`;
}
