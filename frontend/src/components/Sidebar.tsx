import React from "react";
import { Link } from "react-router-dom";
import { CommuteResult, University } from "../types/university";
import { Region } from "../utils/region";
import SidebarSearchBar from "./SidebarSearchBar";
import FilterPanel from "./FilterPanel";
import SidebarResultList from "./SidebarResultList";

interface Props {
    universities: University[];
    results: CommuteResult[] | null;
    loading: boolean;
    onSearch: (address: string) => void;

    maxMinutes: number;
    onMaxMinutesChange: (v: number) => void;
    selectedRegions: Set<Region>;
    onRegionToggle: (region: Region) => void;

    visibleIds: Set<string>;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const Sidebar: React.FC<Props> = ({
    universities,
    results,
    loading,
    onSearch,
    maxMinutes,
    onMaxMinutesChange,
    selectedRegions,
    onRegionToggle,
    visibleIds,
    selectedId,
    onSelect,
}) => {
    return (
        <aside className="w-[360px] h-screen flex flex-col bg-white border-r border-gray-100 shrink-0">
            <div className="px-6 pt-6 pb-4">
                <Link to="/" className="text-2xl font-bold tracking-tighter text-brand">
                    findu
                </Link>
            </div>

            <div className="px-6 pb-4">
                <SidebarSearchBar onSearch={onSearch} loading={loading} />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100">
                <FilterPanel
                    maxMinutes={maxMinutes}
                    onMaxMinutesChange={onMaxMinutesChange}
                    selectedRegions={selectedRegions}
                    onRegionToggle={onRegionToggle}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
                <SidebarResultList
                    universities={universities}
                    results={results}
                    visibleIds={visibleIds}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    loading={loading}
                />
            </div>

            <nav className="px-6 py-4 border-t border-gray-100 flex gap-6 text-sm">
                <Link to="/universities" className="text-gray-500 hover:text-gray-900 transition-colors">
                    University List
                </Link>
                <Link to="/about" className="text-gray-500 hover:text-gray-900 transition-colors">
                    About
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
