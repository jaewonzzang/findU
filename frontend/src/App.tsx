import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, type Location } from "react-router-dom";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import MinimalSearchBar from "./components/MinimalSearchBar";
import MapContainer from "./components/MapContainer";
import UniversityList from "./pages/UniversityList";
import UniversityListModal from "./components/UniversityListModal";
import About from "./pages/About";
import { fetchUniversities } from "./api";
import { useSearch } from "./hooks/useSearch";
import type { University } from "./types/university";
import "./index.css";

const Home = () => {
    const [isResultVisible] = useState<boolean>(false);
    const [universities, setUniversities] = useState<University[]>([]);
    const [maxMinutes, setMaxMinutes] = useState<number>(60);
    const { search, results, homeLocation, loading } = useSearch();

    useEffect(() => {
        fetchUniversities().then(setUniversities).catch(() => {});
    }, []);

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <LeftSidebar maxMinutes={maxMinutes} onMaxMinutesChange={setMaxMinutes} />

            <main className="flex-1 flex flex-col min-w-0">
                <div className="fixed inset-0">
                    <MapContainer
                        homeLocation={homeLocation}
                        universities={universities}
                        commuteResults={results}
                        visibleUniversityIds={null}
                        selectedUniversityId={null}
                        maxMinutes={maxMinutes}
                    />
                </div>
            </main>

            <RightSidebar visible={isResultVisible} />

            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[480px] z-10 bg-white/60 backdrop-blur-xl hover:bg-white focus-within:bg-white transition-colors duration-200 rounded-2xl shadow-lg px-6 py-1">
                <MinimalSearchBar onSearch={search} loading={loading} />
            </div>
        </div>
    );
};

const ConditionalHeader = () => {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location } | null;
    const effectivePath = state?.backgroundLocation?.pathname ?? location.pathname;
    if (effectivePath === "/") return null;
    return <Header />;
};

const AppContent = () => {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location } | null;
    const backgroundLocation = state?.backgroundLocation;

    return (
        <div className="min-h-screen text-gray-900 font-sans selection:bg-brand/10 selection:text-brand">
            <ConditionalHeader />
            <Routes location={backgroundLocation || location}>
                <Route path="/" element={<Home />} />
                <Route path="/universities" element={<UniversityList />} />
                <Route path="/about" element={<About />} />
            </Routes>
            {backgroundLocation && (
                <Routes>
                    <Route path="/universities" element={<UniversityListModal />} />
                </Routes>
            )}
        </div>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
