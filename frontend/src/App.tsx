import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import UniversityList from "./pages/UniversityList";
import About from "./pages/About";
import MinimalSearchBar from "./components/MinimalSearchBar";
import FadeInList from "./components/FadeInList";
import { useSearch } from "./hooks/useSearch";
import { CommuteResult } from "./types/university";
import "./index.css";

// Home component wrapper to handle search state
const Home = () => {
  const { search, results, loading } = useSearch();
  const [mappedResults, setMappedResults] = useState<CommuteResult[]>([]);

  useEffect(() => {
    if (results) {
      const mapped: CommuteResult[] = results.map((r) => ({
        university_id: r.university.id,
        university_name: r.university.name,
        university_address: r.university.address,
        duration_minutes: r.duration,
        transport_mode: "transit", // Default or derived
        route_summary: `Distance: ${r.distance}km`,
      }));
      setMappedResults(mapped);
    }
  }, [results]);

  return (
    <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto flex flex-col items-center text-center">
      <div className="mb-16 animate-fade-in">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Find your <span className="text-brand">University</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Discover the nearest top universities based on commute time.
        </p>
      </div>

      <div className="w-full mb-12 animate-fade-in-up delay-100">
        <MinimalSearchBar onSearch={search} loading={loading} />
      </div>

      <div className="w-full animate-fade-in-up delay-200">
        <FadeInList results={mappedResults} />
      </div>
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand/10 selection:text-brand">
        <Header />
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
