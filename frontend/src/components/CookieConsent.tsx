// frontend/src/components/CookieConsent.tsx
import React, { useEffect, useState } from "react";

const COOKIE_NAME = "cookie_consent";
// 백엔드 세션(SESSION_MAX_AGE)과 같은 5분. 동의 기록도 세션보다 오래 남기지 않는다.
const MAX_AGE_SECONDS = 300;

function readConsent(): string | null {
    const hit = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    return hit ? hit.slice(COOKIE_NAME.length + 1) : null;
}

function writeConsent(value: "1" | "0") {
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
}

const CookieConsent: React.FC = () => {
    const [answered, setAnswered] = useState(true);

    useEffect(() => {
        setAnswered(readConsent() !== null);
        // 5분 뒤 쿠키가 만료되면 다시 물어본다.
        const timer = setInterval(() => setAnswered(readConsent() !== null), 10_000);
        return () => clearInterval(timer);
    }, []);

    if (answered) return null;

    const answer = (value: "1" | "0") => {
        writeConsent(value);
        setAnswered(true);
    };

    return (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
            <p className="text-sm text-gray-700">
                로그인 상태를 유지하기 위해 쿠키를 사용합니다.
            </p>
            <p className="mt-1 text-xs text-gray-500">
                쿠키와 세션은 5분 뒤 자동으로 만료되며, 광고나 분석 용도로는 쓰지 않습니다.
            </p>
            <div className="mt-3 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => answer("0")}
                    className="rounded-lg px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                    거부
                </button>
                <button
                    type="button"
                    onClick={() => answer("1")}
                    className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                    허용
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
