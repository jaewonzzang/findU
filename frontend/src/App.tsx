import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MapContainer from "./components/MapContainer";
import UniversityList from "./pages/UniversityList";
import About from "./pages/About";
import { useSearch } from "./hooks/useSearch";
import { fetchUniversities } from "./api";
import { University } from "./types/university";
import { ALL_REGIONS, Region, getRegion } from "./utils/region";
import "./index.css";

const Home = () => {
    const { search, results, homeLocation, loading } = useSearch();

    const [universities, setUniversities] = useState<University[]>([]);
    const [maxMinutes, setMaxMinutes] = useState(120);
    const [selectedRegions, setSelectedRegions] = useState<Set<Region>>(new Set(ALL_REGIONS));
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchUniversities()
            .then(setUniversities)
            .catch((err) => console.error("Failed to load universities", err));
    }, []);

    const visibleIds = useMemo(() => {
        const ids = new Set<string>();
        const resultMap = new Map((results ?? []).map((r) => [r.university_id, r]));

        for (const uni of universities) {
            const region = getRegion(uni.address);
            if (!region || !selectedRegions.has(region)) continue;

            if (results) {
                const r = resultMap.get(uni.id);
                if (!r) continue;
                if (maxMinutes < 120 && r.duration_minutes > maxMinutes) continue;
            }

            ids.add(uni.id);
        }
        return ids;
    }, [universities, results, selectedRegions, maxMinutes]);

    const handleRegionToggle = (region: Region) => {
        setSelectedRegions((prev) => {
            const next = new Set(prev);
            if (next.has(region)) next.delete(region);
            else next.add(region);
            return next;
        });
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white">
            <Sidebar
                universities={universities}
                results={results}
                loading={loading}
                onSearch={search}
                maxMinutes={maxMinutes}
                onMaxMinutesChange={setMaxMinutes}
                selectedRegions={selectedRegions}
                onRegionToggle={handleRegionToggle}
                visibleIds={visibleIds}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
            <div className="flex-1 relative">
                <MapContainer
                    homeLocation={homeLocation}
                    universities={universities}
                    commuteResults={results}
                    visibleUniversityIds={visibleIds}
                    selectedUniversityId={selectedId}
                    onSelectUniversity={setSelectedId}
                />
            </div>
        </div>
    );
};

const ConditionalHeader = () => {
    const location = useLocation();
    if (location.pathname === "/") return null;
    return <Header />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand/10 selection:text-brand">
                <ConditionalHeader />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/universities" element={<UniversityList />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
