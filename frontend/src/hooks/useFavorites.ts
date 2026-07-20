// frontend/src/hooks/useFavorites.ts
import { useEffect, useState } from "react";
import {
    SavedAddress,
    deleteSavedAddress,
    fetchFavoriteUniversityIds,
    fetchSavedAddresses,
    saveAddress,
    setFavoriteUniversity,
} from "../api";

export function useSavedAddresses(enabled: boolean) {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);

    useEffect(() => {
        if (!enabled) {
            setAddresses([]);
            return;
        }
        fetchSavedAddresses().then(setAddresses).catch(() => {});
    }, [enabled]);

    const save = async (address: string, lat: number | null, lng: number | null) => {
        const row = await saveAddress(address, lat, lng);
        setAddresses((prev) => [row, ...prev.filter((a) => a.id !== row.id)]);
    };

    const remove = async (id: number) => {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        await deleteSavedAddress(id).catch(() => {});
    };

    return { addresses, save, remove };
}

export function useFavoriteUniversities(enabled: boolean) {
    const [ids, setIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!enabled) {
            setIds(new Set());
            return;
        }
        fetchFavoriteUniversityIds()
            .then((list) => setIds(new Set(list)))
            .catch(() => {});
    }, [enabled]);

    const toggle = async (id: string) => {
        const next = !ids.has(id);
        setIds((prev) => {
            const copy = new Set(prev);
            if (next) copy.add(id);
            else copy.delete(id);
            return copy;
        });
        try {
            await setFavoriteUniversity(id, next);
        } catch {
            // 실패 시 원복
            setIds((prev) => {
                const copy = new Set(prev);
                if (next) copy.delete(id);
                else copy.add(id);
                return copy;
            });
        }
    };

    return { favoriteIds: ids, toggle };
}
