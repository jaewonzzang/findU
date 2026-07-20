// frontend/src/components/AuthButton.tsx

import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UNIVERSITIES } from "../data/universities";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";

interface AuthButtonProps {
    // 홈에서만 넘어온다 — 다른 페이지에는 저장할 "현재 검색한 주소"가 없다.
    canSaveCurrent?: boolean;
    onSaveCurrent?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ canSaveCurrent, onSaveCurrent }) => {
    const { user, loading, login, logout } = useAuth();
    const { addresses, remove, favoriteIds, toggle } = useFavorites();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (loading) return null;

    if (!user) {
        return (
            <button
                onClick={login}
                className="flex items-center gap-1.5 rounded-lg bg-[#FEE500] px-3 py-1.5 text-sm font-medium text-[#191919] hover:brightness-95 transition"
            >
                {/* Kakao 심볼(말풍선) */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#191919" aria-hidden>
                    <path d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.26 4.66 6.65-.2.75-.75 2.77-.86 3.2-.13.53.2.52.41.38.17-.11 2.72-1.85 3.82-2.6.63.09 1.29.14 1.97.14 5.52 0 10-3.54 10-7.77S17.52 3 12 3z" />
                </svg>
                카카오 로그인
            </button>
        );
    }

    const avatar = (size: string) =>
        user.profile_image ? (
            <img src={user.profile_image} alt="" className={`${size} rounded-full object-cover`} />
        ) : (
            <span className={`${size} flex items-center justify-center rounded-full bg-gray-200`}>
                {/* 기본 아바타 */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af" aria-hidden>
                    <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.7-9.8 4.9v2.5h19.6v-2.5c0-3.2-6.5-4.9-9.8-4.9z" />
                </svg>
            </span>
        );

    const favorites = UNIVERSITIES.filter((u) => favoriteIds.has(u.id));

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            >
                {avatar("h-7 w-7")}
                <span className="font-medium text-gray-900">{user.nickname}</span>
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                    aria-hidden
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                >
                    <path d="M2.5 4.5 6 8l3.5-3.5" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white p-4 text-sm shadow-xl ring-1 ring-black/5">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        {avatar("h-10 w-10")}
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{user.nickname}</p>
                            <p className="text-xs text-gray-400">카카오 계정으로 로그인됨</p>
                        </div>
                    </div>

                    <section className="pt-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h3 className="text-xs font-semibold tracking-wide text-gray-400">
                                저장한 주소 {addresses.length > 0 && `(${addresses.length})`}
                            </h3>
                            {canSaveCurrent && onSaveCurrent && (
                                <button
                                    type="button"
                                    onClick={onSaveCurrent}
                                    className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium text-brand transition-colors hover:bg-brand/5"
                                >
                                    ＋ 지금 주소 저장
                                </button>
                            )}
                        </div>
                        {addresses.length === 0 ? (
                            <p className="text-xs text-gray-400">
                                주소를 검색한 뒤 ☆ 버튼으로 저장할 수 있어요.
                            </p>
                        ) : (
                            <ul className="max-h-36 space-y-1 overflow-y-auto">
                                {addresses.map((a) => (
                                    <li key={a.id} className="flex items-center justify-between gap-2">
                                        <span className="truncate text-gray-700" title={a.address}>
                                            {a.address}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label={`${a.address} 삭제`}
                                            onClick={() => remove(a.id)}
                                            className="shrink-0 text-gray-300 transition-colors hover:text-gray-700"
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="pt-3">
                        <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
                            관심 대학 {favorites.length > 0 && `(${favorites.length})`}
                        </h3>
                        {favorites.length === 0 ? (
                            <>
                                <p className="text-xs text-gray-400">
                                    대학 목록에서 ♡를 눌러 담을 수 있어요.
                                </p>
                                {location.pathname !== "/universities" && (
                                    <Link
                                        to="/universities"
                                        state={{ backgroundLocation: location }}
                                        onClick={() => setOpen(false)}
                                        className="mt-2 inline-block rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        University List 열기
                                    </Link>
                                )}
                            </>
                        ) : (
                            <ul className="max-h-36 space-y-1 overflow-y-auto">
                                {favorites.map((u) => (
                                    <li key={u.id} className="flex items-center justify-between gap-2">
                                        <span className="truncate text-gray-700">{u.name}</span>
                                        <button
                                            type="button"
                                            aria-label={`${u.name} 찜 해제`}
                                            onClick={() => toggle(u.id)}
                                            className="shrink-0 leading-none text-red-500 transition-colors hover:text-red-400"
                                        >
                                            ♥
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <button
                        type="button"
                        onClick={logout}
                        className="mt-4 w-full rounded-lg border border-gray-200 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                        로그아웃
                    </button>
                </div>
            )}
        </div>
    );
};

export default AuthButton;
