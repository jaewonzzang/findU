// frontend/src/components/AuthButton.tsx

import React from "react";
import { useAuth } from "../hooks/useAuth";

const AuthButton: React.FC = () => {
    const { user, loading, login, logout } = useAuth();

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

    return (
        <div className="flex items-center gap-2 text-sm">
            {user.profile_image ? (
                <img
                    src={user.profile_image}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                />
            ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                    {/* 기본 아바타 */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af" aria-hidden>
                        <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.7-9.8 4.9v2.5h19.6v-2.5c0-3.2-6.5-4.9-9.8-4.9z" />
                    </svg>
                </span>
            )}
            <span className="font-medium text-gray-900">{user.nickname}</span>
            <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-900 transition-colors"
            >
                로그아웃
            </button>
        </div>
    );
};

export default AuthButton;
