// frontend/src/components/SavedAddresses.tsx
import React from "react";
import { SavedAddress } from "../api";

interface SavedAddressesProps {
    addresses: SavedAddress[];
    canSaveCurrent: boolean;
    onSaveCurrent: () => void;
    onSelect: (address: string) => void;
    onDelete: (id: number) => void;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
    addresses,
    canSaveCurrent,
    onSaveCurrent,
    onSelect,
    onDelete,
}) => {
    if (!canSaveCurrent && addresses.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5 pb-3">
            {canSaveCurrent && (
                <button
                    type="button"
                    onClick={onSaveCurrent}
                    className="flex items-center gap-1 rounded-full border border-brand/30 px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/5 transition-colors"
                >
                    <span aria-hidden>☆</span> 이 주소 저장
                </button>
            )}
            {addresses.map((a) => (
                <span
                    key={a.id}
                    className="group flex items-center gap-1 rounded-full bg-gray-100 pl-2.5 pr-1.5 py-1 text-xs text-gray-700"
                >
                    <button
                        type="button"
                        onClick={() => onSelect(a.address)}
                        className="hover:text-brand transition-colors max-w-[180px] truncate"
                        title={a.address}
                    >
                        {a.address}
                    </button>
                    <button
                        type="button"
                        aria-label={`${a.address} 삭제`}
                        onClick={() => onDelete(a.id)}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    );
};

export default SavedAddresses;
