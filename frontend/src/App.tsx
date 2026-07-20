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
import SavedAddresses from "./components/SavedAddresses";
import CookieConsent from "./components/CookieConsent";
import { fetchUniversities } from "./api";
import { useSearch } from "./hooks/useSearch";
import { useAuth } from "./hooks/useAuth";
import { FavoritesProvider, useFavorites } from "./hooks/useFavorites";
import type { University } from "./types/university";
import "./index.css";

const Home = () => {
    const [isResultVisible] = useState<boolean>(false);
    const [universities, setUniversities] = useState<University[]>([]);
    const [maxMinutes, setMaxMinutes] = useState<number>(60);
    const [resetKey, setResetKey] = useState<number>(0);
    const { search, reset, results, homeLocation, loading, error } = useSearch();
    const { user } = useAuth();
    const { addresses, save, remove, favoriteIds } = useFavorites();
    const [lastAddress, setLastAddress] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
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
        setLastAddress(null);
        setMaxMinutes(60);
        setResetKey((k) => k + 1);
        mapRef.current?.resetView();
        navigate("/", { state: null, replace: true });
    };

    const handleSearch = (address: string) => {
        setLastAddress(address);
        search(address);
    };

    const showActionError = (message: string) => {
        setActionError(message);
        setTimeout(() => setActionError(null), 4000);
    };

    const canSaveCurrent =
        !!user &&
        !!lastAddress &&
        !!homeLocation &&
        !loading &&
        !addresses.some((a) => a.address === lastAddress);

    // 지도는 maxMinutes 로 마커를 거르므로, 검색은 됐는데 전부 걸러진 경우를 따로 안내한다.
    const visibleCount = (results ?? []).filter((r) => r.duration_minutes <= maxMinutes).length;
    const showNoResults = !loading && !error && !!homeLocation && visibleCount === 0;

    const handleSaveCurrent = () => {
        if (!lastAddress || !homeLocation) return;
        save(lastAddress, homeLocation.lat, homeLocation.lng).catch((err) =>
            showActionError(err instanceof Error ? err.message : "주소 저장에 실패했어요.")
        );
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
                        savedAddresses={addresses}
                        favoriteUniversityIds={favoriteIds}
                    />
                </div>
            </main>

            <RightSidebar visible={isResultVisible} />

            <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[480px] z-10 bg-white/60 backdrop-blur-xl hover:bg-white focus-within:bg-white transition-colors duration-200 rounded-2xl shadow-lg px-4 md:px-6 py-1">
                <MinimalSearchBar key={resetKey} onSearch={handleSearch} loading={loading} />
                <SavedAddresses
                    addresses={addresses}
                    canSaveCurrent={canSaveCurrent}
                    onSaveCurrent={handleSaveCurrent}
                    onSelect={handleSearch}
                    onDelete={remove}
                />
                {showNoResults && (
                    <p className="pb-3 text-xs text-gray-500">
                        {maxMinutes}분 이내에 닿는 대학이 없어요. 왼쪽에서 최대 시간을 늘려보세요.
                    </p>
                )}
            </div>

            <div className="fixed top-4 right-4 z-10 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg px-3 py-1.5">
                <AuthButton canSaveCurrent={canSaveCurrent} onSaveCurrent={handleSaveCurrent} />
            </div>

            {loginFailed && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-red-500/90 px-4 py-2 text-sm text-white shadow-lg">
                    카카오 로그인에 실패했어요. 다시 시도해 주세요.
                </div>
            )}

            {(error || actionError) && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-red-500/90 px-4 py-2 text-sm text-white shadow-lg">
                    {error ?? actionError}
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
    const { user } = useAuth();

    return (
        <FavoritesProvider enabled={!!user}>
            <div className="min-h-screen text-gray-900 font-sans selection:bg-brand/10 selection:text-brand">
                <CookieConsent />
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
        </FavoritesProvider>
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
