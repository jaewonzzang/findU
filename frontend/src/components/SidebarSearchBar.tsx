import React, { useState } from "react";

interface Props {
    onSearch: (address: string) => void;
    loading?: boolean;
}

const SidebarSearchBar: React.FC<Props> = ({ onSearch, loading }) => {
    const [value, setValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) onSearch(value.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="집 주소를 입력하세요"
                className="w-full pl-4 pr-12 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none placeholder-gray-400 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading || !value.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-white hover:bg-brand-dark active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="검색"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                )}
            </button>
        </form>
    );
};

export default SidebarSearchBar;
