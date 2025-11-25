// frontend/src/App.jsx
import { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultList from "./components/ResultList";
import { searchUniversities } from "./api";

function App() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (payload) => {
        setLoading(true);
        setError("");
        try {
            const data = await searchUniversities(payload);
            setResults(data.results);
        } catch (err) {
            setError("검색 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "1rem" }}>
            <h1>집 기준 명문대 통학 시간 검색</h1>
            <SearchForm onSearch={handleSearch} />

            {loading && <p>검색 중...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && <ResultList results={results} />}
        </div>
    );
}

export default App;
