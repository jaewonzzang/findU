import { useState } from 'react';
import { UNIVERSITIES } from '../data/universities';

interface SearchResult {
    university: typeof UNIVERSITIES[0];
    duration: number; // minutes
    distance: number; // km
}

export const useSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<SearchResult[]>([]);

    const search = async (address: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { search, results, loading, error };
};
