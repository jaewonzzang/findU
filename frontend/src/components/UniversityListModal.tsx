import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UniversityList from "../pages/UniversityList";

const UniversityListModal: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") navigate(-1);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [navigate]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => navigate(-1)}
            />
            <div
                className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center"
                >
                    ×
                </button>
                <UniversityList />
            </div>
        </div>
    );
};

export default UniversityListModal;
