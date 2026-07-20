import { useState } from "react";
import { CommuteResult } from "../types/university";
import { fetchCommute } from "../api";

interface HomeLocation {
    lat: number;
    lng: number;
}

export const useSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<CommuteResult[] | null>(null);
    const [homeLocation, setHomeLocation] = useState<HomeLocation | null>(null);

    const reset = () => {
        setResults(null);
        setHomeLocation(null);
        setError(null);
        setLoading(false);
    };

    const search = async (address: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchCommute(address, "transit", null);
            setResults(data.results);
            setHomeLocation(data.home_location ?? null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "통학 시간 계산에 실패했어요. 잠시 후 다시 시도해 주세요."
            );
            setResults(null);
            setHomeLocation(null);
        } finally {
            setLoading(false);
        }
    };

    return { search, reset, results, homeLocation, loading, error };
};
