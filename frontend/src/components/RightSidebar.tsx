import React from "react";

interface Props {
    visible?: boolean;
}

const RightSidebar: React.FC<Props> = ({ visible = false }) => {
    if (!visible) return null;

    return (
        <aside className="hidden md:flex md:w-[360px] shrink-0 h-screen flex-col border-l border-gray-100 bg-white/60 backdrop-blur-xl hover:bg-white focus-within:bg-white transition-colors duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    결과 리스트
                </h2>
            </div>
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                결과 리스트 (예정)
            </div>
        </aside>
    );
};

export default RightSidebar;
