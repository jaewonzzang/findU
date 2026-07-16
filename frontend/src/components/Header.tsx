import React from "react";
import { Link, useLocation } from "react-router-dom";
import AuthButton from "./AuthButton";

const Header: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path
            ? "text-gray-900 font-medium"
            : "text-gray-500 hover:text-gray-900";
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold tracking-tighter text-brand">
                    findu
                </Link>

                <nav className="flex items-center gap-8 text-sm transition-colors">
                    <Link to="/universities" className={isActive("/universities")}>
                        university list
                    </Link>
                    <Link to="/about" className={isActive("/about")}>
                        about
                    </Link>
                    <AuthButton />
                </nav>
            </div>
        </header>
    );
};

export default Header;
