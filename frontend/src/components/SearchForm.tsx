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
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    출발지 주소:
                </label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="예: 서울시 강남구 테헤란로 123"
                    required
                    style={{ width: "100%", padding: "0.5rem" }}
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    이동 수단:
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <label>
                        <input
                            type="radio"
                            value="transit"
                            checked={mode === "transit"}
                            onChange={(e) => setMode(e.target.value as TransportMode)}
                        />
                        대중교통
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="car"
                            checked={mode === "car"}
                            onChange={(e) => setMode(e.target.value as TransportMode)}
                        />
                        자동차
                    </label>
                </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    최대 통학 시간 (분, 선택사항):
                </label>
                <input
                    type="number"
                    value={maxMinutes}
                    onChange={(e) => setMaxMinutes(e.target.value)}
                    placeholder="예: 60"
                    style={{ width: "100%", padding: "0.5rem" }}
                />
            </div>

            <button
                type="submit"
                style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                검색
            </button>
        </form>
    );
};

export default SearchForm;
