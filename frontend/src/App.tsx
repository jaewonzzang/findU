import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useSearchParams, type Location } from "react-router-dom";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import MinimalSearchBar from "./components/MinimalSearchBar";
import MapContainer, { type MapContainerHandle } from "./components/MapContainer";
import AuthButton from "./components/AuthButton";
import UniversityList from "./pages/UniversityList";
import UniversityListModal from "./components/UniversityListModal";
import About from "./pages/About";
import SavedAddresses from "./components/SavedAddresses";
import ResultsPanel from "./components/ResultsPanel";
import CookieConsent from "./components/CookieConsent";
import { fetchUniversities } from "./api";
import { useSearch } from "./hooks/useSearch";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { FavoritesProvider, useFavorites } from "./hooks/useFavorites";
import type { University } from "./types/university";
import "./index.css";

const Home = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [maxMinutes, setMaxMinutes] = useState<number>(60);
    const [resetKey, setResetKey] = useState<number>(0);
    const { search, reset, results, homeLocation, loading, error } = useSearch();
    const { user, loading: authLoading, login } = useAuth();
    const { addresses, save, remove, favoriteIds } = useFavorites();
    const [lastAddress, setLastAddress] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    // 리스트와 지도가 공유하는 선택 대학. 한쪽에서 고르면 다른 쪽도 강조된다.
    const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
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
        setSelectedUniversityId(null);
        setMaxMinutes(60);
        setResetKey((k) => k + 1);
        mapRef.current?.resetView();
        navigate("/", { state: null, replace: true });
    };

    const handleSearch = (address: string) => {
        setLastAddress(address);
        setSelectedUniversityId(null);
        search(address);
    };

    // 로그아웃(또는 세션 만료)으로 user가 사라지면 검색·마커까지 초기화해 로그인 흔적을 남기지 않는다.
    const prevUserRef = useRef(user);
    useEffect(() => {
        if (prevUserRef.current && !user) handleReset();
        prevUserRef.current = user;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

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

    // 지도와 같은 기준(maxMinutes)으로 거른 뒤 가까운 순으로 세운다 — 이게 findU의 "순위"다.
    const rankedResults = useMemo(
        () =>
            (results ?? [])
                .filter((r) => r.duration_minutes <= maxMinutes)
                .sort((a, b) => a.duration_minutes - b.duration_minutes),
        [results, maxMinutes]
    );
    const showResultsPanel = loading || results !== null;

    // 로그인은 "이 주소 저장"을 누를 때 처음 요구한다. 카카오 로그인은 페이지를 떠났다 돌아오므로
    // 검색하던 주소를 잠시 보관했다가, 돌아오면 같은 결과를 다시 띄워준다.
    const PENDING_KEY = "findu:pendingAddress";
    const canOfferLoginToSave = !user && !authLoading && !!lastAddress && !!homeLocation && !loading;
    const handleLoginToSave = () => {
        if (!lastAddress) return;
        try {
            sessionStorage.setItem(PENDING_KEY, lastAddress);
        } catch {
            /* 저장소를 못 쓰면 복귀 후 다시 검색하면 된다 */
        }
        login();
    };
    useEffect(() => {
        if (authLoading || !user) return;
        let pending: string | null = null;
        try {
            pending = sessionStorage.getItem(PENDING_KEY);
            sessionStorage.removeItem(PENDING_KEY);
        } catch {
            pending = null;
        }
        if (pending) handleSearch(pending);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user]);

    // 같은 대학을 다시 누르면 선택 해제. MapContainer effect 의존성이라 참조를 고정한다.
    const handleSelectUniversity = useCallback((id: string) => {
        setSelectedUniversityId((prev) => (prev === id ? null : id));
    }, []);
    const handleClearSelection = useCallback(() => setSelectedUniversityId(null), []);

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
                        selectedUniversityId={selectedUniversityId}
                        onSelectUniversity={handleSelectUniversity}
                        onMapClick={handleClearSelection}
                        maxMinutes={maxMinutes}
                        savedAddresses={addresses}
                        favoriteUniversityIds={favoriteIds}
                    />
                </div>
            </main>

            <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[480px] z-10 bg-white/60 backdrop-blur-xl hover:bg-white focus-within:bg-white transition-colors duration-200 rounded-2xl shadow-lg px-4 md:px-6 py-1">
                <MinimalSearchBar key={resetKey} onSearch={handleSearch} loading={loading} />
                <SavedAddresses
                    addresses={addresses}
                    canSaveCurrent={canSaveCurrent || canOfferLoginToSave}
                    onSaveCurrent={user ? handleSaveCurrent : handleLoginToSave}
                    onSelect={handleSearch}
                    onDelete={remove}
                />
            </div>

            {showResultsPanel && (
                <ResultsPanel
                    results={rankedResults}
                    loading={loading}
                    address={lastAddress}
                    maxMinutes={maxMinutes}
                    onMaxMinutesChange={setMaxMinutes}
                    selectedId={selectedUniversityId}
                    onSelect={handleSelectUniversity}
                />
            )}

            <div
                className={`fixed top-4 right-4 z-10 ${
                    user
                        ? "bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg px-3 py-1.5"
                        : "bg-white/70 backdrop-blur rounded-full shadow-sm px-3 py-1"
                }`}
            >
                <AuthButton canSaveCurrent={canSaveCurrent} onSaveCurrent={handleSaveCurrent} subtle />
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
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
