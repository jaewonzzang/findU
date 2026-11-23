import React from "react";

const FLOATING_BOX =
    "bg-white/20 backdrop-blur-xl hover:bg-white/90 focus-within:bg-white/90 transition-colors duration-200 rounded-2xl shadow-lg p-4";

interface LeftSidebarProps {
    maxMinutes: number;
    onMaxMinutesChange: (v: number) => void;
    onLogoClick: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ maxMinutes, onMaxMinutesChange, onLogoClick }) => {
    return (
        <>
            {/* Box A — Logo */}
            <div className={`hidden md:block fixed top-4 left-4 z-20 w-fit ${FLOATING_BOX}`}>
                <button
                    type="button"
                    onClick={onLogoClick}
                    className="text-xl font-bold tracking-tighter text-brand bg-transparent p-0 cursor-pointer"
                >
                    findU
                </button>
            </div>

            {/* Box B — Slider (주소 결과가 순위 패널로 나오므로 별도 메뉴는 두지 않는다) */}
            <div className={`hidden md:flex fixed top-24 left-4 z-20 w-[260px] flex-col ${FLOATING_BOX}`}>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-700">
                        최대 통학 시간
                    </label>
                    <span className="text-sm font-medium text-brand tabular-nums">
                        {maxMinutes}분 이내
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
                    <span>120</span>
                </div>
            </div>
        </>
    );
};

export default LeftSidebar;
