import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useSearchParams, type Location } from "react-router-dom";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import MinimalSearchBar from "./components/MinimalSearchBar";
import MapContainer, { type MapContainerHandle } from "./components/MapContainer";
import AuthButton from "./components/AuthButton";
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
    const [resetKey, setResetKey] = useState<number>(0);
    const { search, reset, results, homeLocation, loading } = useSearch();
    const mapRef = useRef<MapContainerHandle | null>(null);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loginFailed, setLoginFailed] = useState<boolean>(
        searchParams.get("login") === "failed"
    );

    useEffect(() => {
        if (searchParams.get("login") !== "failed") return;
        searchParams.delete("login");
        setSearchParams(searchParams, { replace: true });
        const timer = setTimeout(() => setLoginFailed(false), 4000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchUniversities().then(setUniversities).catch(() => {});
    }, []);

    const handleReset = () => {
        reset();
        setMaxMinutes(60);
        setResetKey((k) => k + 1);
        mapRef.current?.resetView();
        navigate("/", { state: null, replace: true });
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <LeftSidebar maxMinutes={maxMinutes} onMaxMinutesChange={setMaxMinutes} onLogoClick={handleReset} />

            <main className="flex-1 flex flex-col min-w-0">
                <div className="fixed inset-0">
                    <MapContainer
                        ref={mapRef}
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
                <MinimalSearchBar key={resetKey} onSearch={search} loading={loading} />
            </div>

            <div className="fixed top-4 right-4 z-10 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg px-3 py-1.5">
                <AuthButton />
            </div>

            {loginFailed && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-red-500/90 px-4 py-2 text-sm text-white shadow-lg">
                    카카오 로그인에 실패했어요. 다시 시도해 주세요.
                </div>
            )}
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
