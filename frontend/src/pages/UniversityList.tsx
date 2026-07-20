import React from "react";
import { UNIVERSITIES } from "../data/universities";
import { useAuth } from "../hooks/useAuth";
import { useFavoriteUniversities } from "../hooks/useFavorites";

const UniversityList: React.FC = () => {
    const { user } = useAuth();
    const { favoriteIds, toggle } = useFavoriteUniversities(!!user);

    return (
        <div className="max-w-3xl mx-auto px-6 py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-12 tracking-tight">
                University List
            </h1>

            <div className="space-y-8">
                {UNIVERSITIES.map((uni, index) => {
                    const isFavorite = favoriteIds.has(uni.id);
                    return (
                        <div
                            key={uni.id}
                            className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-100 pb-6 animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="flex items-baseline gap-4">
                                <span className="text-sm font-medium text-gray-400 w-6">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand transition-colors duration-300">
                                    {uni.name}
                                </h2>
                                {user && (
                                    <button
                                        type="button"
                                        aria-label={isFavorite ? `${uni.name} 찜 해제` : `${uni.name} 찜하기`}
                                        aria-pressed={isFavorite}
                                        onClick={() => toggle(uni.id)}
                                        className={`text-lg leading-none transition-colors ${
                                            isFavorite
                                                ? "text-red-500 hover:text-red-400"
                                                : "text-gray-300 hover:text-red-400"
                                        }`}
                                    >
                                        {isFavorite ? "♥" : "♡"}
                                    </button>
                                )}
                            </div>

                            <div className="mt-2 sm:mt-0 flex flex-col sm:items-end gap-1 text-sm text-gray-500">
                                <span className="font-medium text-gray-700">{uni.campus}</span>
                                <span className="font-light text-gray-400">{uni.address}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UniversityList;
