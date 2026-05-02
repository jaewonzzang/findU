import { useState } from 'react';
import { CommuteResult } from '../types/university';

export const useSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<CommuteResult[]>([]);

    const search = async (address: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/commute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    transport_mode: "transit",
                    max_commute_minutes: 60,
                }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setResults(data.results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { search, results, loading, error };
};
