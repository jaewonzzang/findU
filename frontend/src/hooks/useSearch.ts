import { useState } from "react";
import { CommuteResult } from "../types/university";

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/commute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address,
                    transport_mode: "transit",
                    max_commute_minutes: null,
                }),
            });

            if (!response.ok) throw new Error("Search failed");

            const data = await response.json();
            setResults(data.results);
            setHomeLocation(data.home_location ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setResults([]);
            setHomeLocation(null);
        } finally {
            setLoading(false);
        }
    };

    return { search, reset, results, homeLocation, loading, error };
};
