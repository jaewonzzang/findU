// src/components/FadeInList.tsx
import React from "react";
import { CommuteResult } from "../types/university";

interface FadeInListProps {
    results: CommuteResult[];
}

const FadeInList: React.FC<FadeInListProps> = ({ results }) => {
    if (results.length === 0) return null;

    return (
        <div className="w-full max-w-3xl mx-auto mt-24 space-y-0">
            <div className="flex justify-between px-6 pb-6 text-[10px] font-semibold tracking-[0.2em] text-gray-300 uppercase border-b border-gray-100 mb-4">
                <span>University</span>
                <span>Commute Time</span>
            </div>
            {results.map((result, index) => (
                <div
                    key={result.university_id}
                    className="flex items-baseline justify-between px-6 py-5 group animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                >
                    <div className="flex items-baseline gap-8">
                        <span className="text-xs font-medium text-gray-200 w-4">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-xl font-medium text-gray-800 group-hover:text-brand transition-colors duration-300">
                            {result.university_name}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-light text-gray-900">
                            {result.duration_minutes}
                        </span>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">min</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FadeInList;
