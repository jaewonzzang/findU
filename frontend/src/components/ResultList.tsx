import React from "react";
import { CommuteResult } from "../types";

interface ResultListProps {
    results: CommuteResult[];
    onSelect: (id: string) => void;
    selectedId: string | null;
}

const ResultList: React.FC<ResultListProps> = ({ results, onSelect, selectedId }) => {
    if (results.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 mt-8">
            <h2 className="text-lg font-bold text-gray-800 px-1">
                검색 결과 {results.length}건
            </h2>
            {results.map((result) => {
                const isSelected = result.university_id === selectedId;
                return (
                    <div
                        key={result.university_id}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${isSelected
                                ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                                : "border-gray-200 bg-white hover:border-blue-200"
                            }`}
                        onClick={() => onSelect(result.university_id)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{result.university_name}</h3>
                            <span className="text-blue-600 font-bold text-lg">{result.duration_minutes}분</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">{result.university_address}</p>

                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                {result.transport_mode === "transit" ? "대중교통" : "자동차"}
                            </span>
                            {result.route_summary && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                                    {result.route_summary}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ResultList;
