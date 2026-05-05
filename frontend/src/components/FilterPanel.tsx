import React from "react";
import { ALL_REGIONS, Region } from "../utils/region";

interface Props {
    maxMinutes: number;
    onMaxMinutesChange: (v: number) => void;
    selectedRegions: Set<Region>;
    onRegionToggle: (region: Region) => void;
}

const FilterPanel: React.FC<Props> = ({
    maxMinutes,
    onMaxMinutesChange,
    selectedRegions,
    onRegionToggle,
}) => {
    return (
        <div className="space-y-5">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        통근 시간
                    </label>
                    <span className="text-sm font-medium text-brand">
                        {maxMinutes === 120 ? "전체" : `${maxMinutes}분 이하`}
                    </span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={120}
                    step={5}
                    value={maxMinutes}
                    onChange={(e) => onMaxMinutesChange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>0</span>
                    <span>60</span>
                    <span>120+</span>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    지역
                </label>
                <div className="flex gap-2">
                    {ALL_REGIONS.map((region) => {
                        const checked = selectedRegions.has(region);
                        return (
                            <button
                                key={region}
                                type="button"
                                onClick={() => onRegionToggle(region)}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                                    checked
                                        ? "bg-brand text-white border-brand"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {region}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
