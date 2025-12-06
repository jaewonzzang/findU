import React, { useState } from "react";
import { TransportMode } from "../types";

interface SearchFormProps {
    onSearch: (payload: {
        address: string;
        mode: TransportMode;
        maxMinutes: number | null;
    }) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
    const [address, setAddress] = useState("");
    const [mode, setMode] = useState<TransportMode>("transit");
    const [maxMinutes, setMaxMinutes] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({
            address,
            mode,
            maxMinutes: maxMinutes ? parseInt(maxMinutes, 10) : null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    출발지 주소
                </label>
                <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="예: 서울시 강남구 테헤란로 123"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이동 수단
                </label>
                <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${mode === 'transit' ? 'bg-blue-50 border-blue-500 text-blue-600 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <input
                            type="radio"
                            name="mode"
                            value="transit"
                            checked={mode === "transit"}
                            onChange={(e) => setMode(e.target.value as TransportMode)}
                            className="hidden"
                        />
                        <span>대중교통</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${mode === 'car' ? 'bg-blue-50 border-blue-500 text-blue-600 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <input
                            type="radio"
                            name="mode"
                            value="car"
                            checked={mode === "car"}
                            onChange={(e) => setMode(e.target.value as TransportMode)}
                            className="hidden"
                        />
                        <span>자동차</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    최대 통학 시간 (분, 선택사항)
                </label>
                <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                    type="number"
                    value={maxMinutes}
                    onChange={(e) => setMaxMinutes(e.target.value)}
                    placeholder="예: 60"
                />
            </div>

            <button
                type="submit"
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 active:scale-[0.98] transform"
            >
                검색하기
            </button>
        </form>
    );
};

export default SearchForm;
