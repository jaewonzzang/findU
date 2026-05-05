import React from "react";
import { CommuteResult, University } from "../types/university";
import { BAND_COLOR, getCommuteBand } from "../utils/commute";

interface Props {
    universities: University[];
    results: CommuteResult[] | null;
    visibleIds: Set<string>;
    selectedId: string | null;
    onSelect: (id: string) => void;
    loading: boolean;
}

const SidebarResultList: React.FC<Props> = ({
    universities,
    results,
    visibleIds,
    selectedId,
    onSelect,
    loading,
}) => {
    if (loading) {
        return (
            <div className="text-sm text-gray-400 text-center py-8">
                통근 시간 계산 중...
            </div>
        );
    }

    if (!results) {
        const visible = universities.filter((u) => visibleIds.has(u.id));
        return (
            <div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">
                    대학 {visible.length}개
                </div>
                <ul className="space-y-1">
                    {visible.map((uni) => (
                        <li key={uni.id}>
                            <button
                                onClick={() => onSelect(uni.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    selectedId === uni.id
                                        ? "bg-brand/10 text-brand font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {uni.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    const visibleResults = results.filter((r) => visibleIds.has(r.university_id));

    if (visibleResults.length === 0) {
        return (
            <div className="text-sm text-gray-400 text-center py-8">
                조건에 맞는 대학이 없습니다
            </div>
        );
    }

    return (
        <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">
                결과 {visibleResults.length}개
            </div>
            <ul className="space-y-1">
                {visibleResults.map((r, idx) => {
                    const isSelected = selectedId === r.university_id;
                    const color = BAND_COLOR[getCommuteBand(r.duration_minutes)];
                    return (
                        <li key={r.university_id}>
                            <button
                                onClick={() => onSelect(r.university_id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    isSelected
                                        ? "bg-brand/10 ring-1 ring-brand"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <span className="text-[10px] font-medium text-gray-300 w-4 text-right">
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: color }}
                                />
                                <span className="flex-1 text-sm font-medium text-gray-800 text-left truncate">
                                    {r.university_name}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                    {r.duration_minutes}
                                    <span className="text-[10px] font-normal text-gray-400 ml-0.5">분</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SidebarResultList;
