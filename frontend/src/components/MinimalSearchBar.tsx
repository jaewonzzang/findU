// src/components/MinimalSearchBar.tsx
import React, { useEffect, useRef, useState } from "react";
import { AddressSuggestion, fetchAutocomplete } from "../api";

interface MinimalSearchBarProps {
    onSearch: (address: string) => void;
    loading?: boolean;
}

const MinimalSearchBar: React.FC<MinimalSearchBarProps> = ({ onSearch, loading }) => {
    const [value, setValue] = useState("");
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const seqRef = useRef(0); // 뒤늦게 도착한 응답이 최신 입력을 덮어쓰지 않게 하는 순번

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const runSearch = (address: string) => {
        if (!address.trim()) return;
        setOpen(false);
        setSuggestions([]);
        setActiveIndex(-1);
        onSearch(address);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        clearTimeout(debounceRef.current);

        if (v.trim().length < 2) {
            setSuggestions([]);
            setOpen(false);
            setActiveIndex(-1);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            const mySeq = ++seqRef.current;
            const list = await fetchAutocomplete(v.trim());
            if (mySeq !== seqRef.current) return; // 더 최신 요청이 이미 나갔으면 버림
            setSuggestions(list);
            setOpen(list.length > 0);
            setActiveIndex(-1);
        }, 250);
    };

    const select = (s: AddressSuggestion) => {
        // 도로명/지번 주소로 검색해야 Naver 지오코딩이 되므로 name이 아니라 address를 넘긴다.
        setValue(s.address);
        runSearch(s.address);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (open && activeIndex >= 0 && activeIndex < suggestions.length) {
            select(suggestions[activeIndex]);
        } else {
            runSearch(value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        } else if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto group" autoComplete="off">
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                placeholder="Enter your address..."
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="list"
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

            {open && suggestions.length > 0 && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5"
                >
                    {suggestions.map((s, i) => (
                        <li
                            key={`${s.name}-${s.lat}-${s.lng}`}
                            role="option"
                            aria-selected={i === activeIndex}
                            // onMouseDown: input blur보다 먼저 실행돼 드롭다운이 닫히기 전에 선택된다.
                            onMouseDown={(e) => {
                                e.preventDefault();
                                select(s);
                            }}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={`flex cursor-pointer items-baseline justify-between gap-3 px-4 py-2 text-left ${
                                i === activeIndex ? "bg-brand/5" : ""
                            }`}
                        >
                            <span className="min-w-0">
                                <span className="text-sm font-medium text-gray-900">{s.name}</span>
                                <span className="ml-2 truncate text-xs text-gray-400">{s.address}</span>
                            </span>
                            {s.category && (
                                <span className="shrink-0 text-[11px] text-gray-300">{s.category}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </form>
    );
};

export default MinimalSearchBar;
