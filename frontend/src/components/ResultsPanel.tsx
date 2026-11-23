import React, { useEffect, useRef, useState } from "react";
import type { CommuteResult } from "../types/university";
import { getCommuteColor } from "../utils/commute";
import { UNIVERSITIES } from "../data/universities";

// 같은 이름의 대학(경희대 서울/국제 등)을 구분하려면 캠퍼스가 필요한데,
// 통학 API 응답엔 캠퍼스가 없어서 프론트 정적 데이터에서 id로 찾아 붙인다.
const CAMPUS_BY_ID = new Map<string, string>(UNIVERSITIES.map((u) => [u.id, u.campus]));

interface ResultsPanelProps {
    results: CommuteResult[]; // maxMinutes 이내로 이미 걸러지고 시간순 정렬된 결과
    loading: boolean;
    address: string | null;
    maxMinutes: number;
    onMaxMinutesChange: (v: number) => void;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
    results,
    loading,
    address,
    maxMinutes,
    onMaxMinutesChange,
    selectedId,
    onSelect,
}) => {
    // 모바일 바텀시트 펼침 여부. 데스크톱에선 항상 펼쳐져 있다.
    const [expanded, setExpanded] = useState(true);
    const rowRefs = useRef(new Map<string, HTMLLIElement>());

    // 지도에서 마커를 고르면 리스트에서도 그 줄이 보이게 스크롤한다.
    useEffect(() => {
        if (!selectedId) return;
        setExpanded(true);
        const row = rowRefs.current.get(selectedId);
        row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [selectedId]);

    const hasFallback = results.some((r) => r.is_fallback);

    return (
        <section
            aria-label="통학시간 순위"
            className={[
                "fixed z-10 flex flex-col bg-white/95 backdrop-blur-xl shadow-2xl",
                // 모바일: 하단 바텀시트
                "inset-x-0 bottom-0 rounded-t-2xl",
                expanded ? "max-h-[55vh]" : "max-h-[88px]",
                // 데스크톱: 우측 플로팅 패널
                "md:inset-x-auto md:bottom-auto md:top-20 md:right-4 md:w-[340px] md:max-h-[calc(100vh-6rem)] md:rounded-2xl",
                "transition-[max-height] duration-300",
            ].join(" ")}
        >
            {/* 헤더 — 모바일에선 탭하면 시트를 접고 편다 */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="md:cursor-default text-left px-5 pt-2 pb-3 md:pt-4 shrink-0"
                aria-expanded={expanded}
            >
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-gray-300 md:hidden" />
                {address && (
                    <p className="text-xs text-gray-500 truncate">{address}에서</p>
                )}
                <h2 className="text-base font-bold text-gray-900">
                    {loading ? (
                        "통학 시간 계산 중…"
                    ) : (
                        <>
                            {maxMinutes}분 이내 대학{" "}
                            <span className="text-brand tabular-nums">{results.length}곳</span>
                        </>
                    )}
                </h2>
            </button>

            {/* 모바일엔 왼쪽 사이드바가 없어서 최대 시간 조절을 여기 둔다 */}
            <div className={`md:hidden px-5 pb-3 shrink-0 ${expanded ? "" : "hidden"}`}>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min={10}
                        max={120}
                        step={5}
                        value={maxMinutes}
                        onChange={(e) => onMaxMinutesChange(Number(e.target.value))}
                        className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand"
                        aria-label="최대 통학 시간"
                    />
                    <span className="w-14 text-right text-xs font-medium text-brand tabular-nums">
                        {maxMinutes}분
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100 overflow-y-auto overscroll-contain">
                {loading ? (
                    <ul className="px-5 py-2" aria-hidden>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <li key={i} className="flex items-center gap-3 py-3">
                                <div className="h-3 w-4 rounded bg-gray-100" />
                                <div className="h-3 flex-1 rounded bg-gray-100" />
                                <div className="h-3 w-10 rounded bg-gray-100" />
                            </li>
                        ))}
                    </ul>
                ) : results.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-gray-500 text-center">
                        {maxMinutes}분 이내에 닿는 대학이 없어요.
                        <br />
                        최대 시간을 늘려보세요.
                    </p>
                ) : (
                    <ol className="py-1">
                        {results.map((r, i) => {
                            const selected = r.university_id === selectedId;
                            const campus = CAMPUS_BY_ID.get(r.university_id);
                            return (
                                <li
                                    key={r.university_id}
                                    ref={(el) => {
                                        if (el) rowRefs.current.set(r.university_id, el);
                                        else rowRefs.current.delete(r.university_id);
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onSelect(r.university_id)}
                                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                                            selected ? "bg-brand/10" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="w-5 shrink-0 text-xs font-semibold text-gray-400 tabular-nums">
                                            {i + 1}
                                        </span>
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ background: getCommuteColor(r.duration_minutes, maxMinutes) }}
                                            aria-hidden
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span
                                                className={`block truncate text-sm ${
                                                    selected ? "font-bold text-brand" : "font-medium text-gray-900"
                                                }`}
                                            >
                                                {r.university_name}
                                            </span>
                                            {campus && (
                                                <span className="block truncate text-[11px] text-gray-400">
                                                    {campus}
                                                </span>
                                            )}
                                        </span>
                                        <span className="shrink-0 text-right">
                                            <span className="text-sm font-bold text-gray-900 tabular-nums">
                                                {r.duration_minutes}분
                                            </span>
                                            {r.is_fallback && (
                                                <span className="block text-[10px] text-gray-400">추정</span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>

            {!loading && results.length > 0 && (
                <p className="shrink-0 border-t border-gray-100 px-5 py-2.5 text-[11px] leading-relaxed text-gray-400">
                    대중교통 시간은 차량 경로로 추산한 예상치라 실제와 다를 수 있어요.
                    {hasFallback && " '추정' 표시는 경로 조회에 실패해 대략 계산한 값이에요."}
                </p>
            )}
        </section>
    );
};

export default ResultsPanel;
