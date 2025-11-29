import React from "react";
import { CommuteResult } from "../types";

interface ResultListProps {
    results: CommuteResult[];
}

const ResultList: React.FC<ResultListProps> = ({ results }) => {
    if (results.length === 0) {
        return null;
    }

    return (
        <div>
            <h2>검색 결과 ({results.length}건)</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {results.map((result) => (
                    <li
                        key={result.university_id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "1rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>{result.university_name}</h3>
                        <p style={{ margin: "0 0 0.5rem 0", color: "#666" }}>
                            {result.university_address}
                        </p>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <span
                                style={{
                                    fontWeight: "bold",
                                    color: result.duration_minutes <= 60 ? "green" : "orange",
                                }}
                            >
                                {result.duration_minutes}분
                            </span>
                            <span
                                style={{
                                    fontSize: "0.9rem",
                                    padding: "0.2rem 0.5rem",
                                    backgroundColor: "#f0f0f0",
                                    borderRadius: "4px",
                                }}
                            >
                                {result.transport_mode === "transit" ? "대중교통" : "자동차"}
                            </span>
                        </div>
                        {result.route_summary && (
                            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                                경로: {result.route_summary}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ResultList;
