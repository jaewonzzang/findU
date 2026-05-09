import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, type Location } from "react-router-dom";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import MinimalSearchBar from "./components/MinimalSearchBar";
import UniversityList from "./pages/UniversityList";
import UniversityListModal from "./components/UniversityListModal";
import About from "./pages/About";
import "./index.css";

const Home = () => {
    const [isResultVisible] = useState<boolean>(false);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white">
            <LeftSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <div className="fixed inset-0 -z-10 bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                        지도 영역 (예정)
                    </div>
                </div>
            </main>

            <RightSidebar visible={isResultVisible} />

            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[480px] z-10 bg-white/60 backdrop-blur-xl hover:bg-white focus-within:bg-white transition-colors duration-200 rounded-2xl shadow-lg px-6 py-1">
                <MinimalSearchBar onSearch={() => {}} />
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
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand/10 selection:text-brand">
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
