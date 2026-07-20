// src/components/MinimalSearchBar.tsx
import React, { useState } from "react";

interface MinimalSearchBarProps {
    onSearch: (address: string) => void;
    loading?: boolean;
}

const MinimalSearchBar: React.FC<MinimalSearchBarProps> = ({ onSearch, loading }) => {
    const [value, setValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSearch(value);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto group">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter your address..."
                className="w-full py-4 md:py-5 pr-12 text-xl md:text-3xl font-light text-gray-900 bg-transparent border-b border-gray-200 outline-none placeholder-[#CFCFCF] focus:border-brand transition-colors duration-300"
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading || !value.trim()}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-brand rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:cursor-default"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                )}
            </button>
        </form>
    );
};

export default MinimalSearchBar;
