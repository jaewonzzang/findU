import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
    { to: "/", label: "Home" },
    { to: "/universities", label: "University List" },
];

const FLOATING_BOX =
    "bg-white/20 backdrop-blur-xl hover:bg-white/90 focus-within:bg-white/90 transition-colors duration-200 rounded-2xl shadow-lg p-4";

interface LeftSidebarProps {
    maxMinutes: number;
    onMaxMinutesChange: (v: number) => void;
    onLogoClick: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ maxMinutes, onMaxMinutesChange, onLogoClick }) => {
    const location = useLocation();

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

            {/* Box B — Nav */}
            <div className={`hidden md:flex fixed top-24 left-4 z-20 w-[260px] flex-col ${FLOATING_BOX}`}>
                <nav className="flex flex-col gap-0.5">
                    {navItems.map(({ to, label }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                state={to === "/universities" ? { backgroundLocation: location } : undefined}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    active
                                        ? "bg-brand/10 text-brand font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Box C — Slider */}
            <div className={`hidden md:flex fixed top-56 left-4 z-20 w-[260px] flex-col ${FLOATING_BOX}`}>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        최대 시간
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
