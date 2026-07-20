// frontend/src/hooks/useFavorites.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    SavedAddress,
    deleteSavedAddress,
    fetchFavoriteUniversityIds,
    fetchSavedAddresses,
    saveAddress,
    setFavoriteUniversity,
} from "../api";

function useSavedAddresses(enabled: boolean) {
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

function useFavoriteUniversities(enabled: boolean) {
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

type FavoritesValue = ReturnType<typeof useSavedAddresses> &
    ReturnType<typeof useFavoriteUniversities>;

const FavoritesContext = createContext<FavoritesValue | null>(null);

// 저장 주소와 관심 대학은 검색바 칩, 프로필 패널, 대학 목록 세 곳에서 함께 쓴다.
// 각자 훅을 부르면 한쪽에서 삭제해도 나머지가 갱신되지 않으므로 상태를 한 번만 만들어 공유한다.
export const FavoritesProvider: React.FC<{
    enabled: boolean;
    children: React.ReactNode;
}> = ({ enabled, children }) => {
    const saved = useSavedAddresses(enabled);
    const favorites = useFavoriteUniversities(enabled);

    return (
        <FavoritesContext.Provider value={{ ...saved, ...favorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export function useFavorites(): FavoritesValue {
    const value = useContext(FavoritesContext);
    if (!value) throw new Error("useFavorites는 FavoritesProvider 안에서만 쓸 수 있다.");
    return value;
}
