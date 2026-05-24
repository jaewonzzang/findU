import { useEffect, useRef, useState } from "react";
import { CommuteResult, University } from "../types/university";
import { getCommuteColor } from "../utils/commute";
import { loadNaverMaps } from "../utils/naverMaps";

declare global {
    interface Window {
        naver: any;
    }
}

interface MapContainerProps {
    homeLocation: { lat: number; lng: number } | null;
    universities: University[];
    commuteResults: CommuteResult[] | null;
    visibleUniversityIds: Set<string> | null;
    selectedUniversityId: string | null;
    onSelectUniversity?: (id: string) => void;
    maxMinutes: number;
}

const NEUTRAL_COLOR = "#8B95A1";

const MapContainer = ({
    homeLocation,
    universities,
    commuteResults,
    visibleUniversityIds,
    selectedUniversityId,
    onSelectUniversity,
    maxMinutes,
}: MapContainerProps) => {
    const mapElement = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [mapReady, setMapReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadNaverMaps()
            .then(() => {
                if (cancelled || !mapElement.current) return;
                const map = new window.naver.maps.Map(mapElement.current, {
                    center: new window.naver.maps.LatLng(37.5665, 126.9780),
                    zoom: 11,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: window.naver.maps.Position.TOP_RIGHT,
                    },
                });
                mapRef.current = map;
                setMapReady(true);
            })
            .catch((err: Error) => {
                if (!cancelled) setLoadError(err.message);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!mapReady || !mapRef.current) return;

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        const map = mapRef.current;
        const resultById = new Map(
            (commuteResults ?? []).map((r) => [r.university_id, r])
        );

        if (homeLocation) {
            const homeMarker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(homeLocation.lat, homeLocation.lng),
                map,
                icon: {
                    content:
                        '<div style="background:#3182F6;width:20px;height:20px;border-radius:9999px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25)"></div>',
                    anchor: new window.naver.maps.Point(10, 10),
                },
                zIndex: 1000,
            });
            markersRef.current.push(homeMarker);
        }

        universities.forEach((uni) => {
            if (visibleUniversityIds && !visibleUniversityIds.has(uni.id)) return;

            const result = resultById.get(uni.id);
            if (result && result.duration_minutes > maxMinutes) return;

            const isSelected = uni.id === selectedUniversityId;

            const color = result
                ? getCommuteColor(result.duration_minutes, maxMinutes)
                : NEUTRAL_COLOR;
            const size = isSelected ? 26 : result ? 16 : 12;
            const border = isSelected ? 4 : 2;
            const half = size / 2;

            const label = result
                ? `<div style="position:absolute;top:${size + 4}px;left:50%;transform:translateX(-50%);background:white;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:600;color:#374151;box-shadow:0 1px 3px rgba(0,0,0,0.15);white-space:nowrap">${result.duration_minutes}분</div>`
                : "";

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(uni.lat, uni.lng),
                map,
                title: uni.name,
                icon: {
                    content: `<div style="position:relative"><div style="background:${color};width:${size}px;height:${size}px;border-radius:9999px;border:${border}px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer"></div>${label}</div>`,
                    anchor: new window.naver.maps.Point(half, half),
                },
                zIndex: isSelected ? 999 : result ? 200 : 100,
            });

            if (onSelectUniversity) {
                window.naver.maps.Event.addListener(marker, "click", () => {
                    onSelectUniversity(uni.id);
                });
            }

            markersRef.current.push(marker);

            if (isSelected) {
                map.panTo(new window.naver.maps.LatLng(uni.lat, uni.lng));
            }
        });
    }, [mapReady, homeLocation, universities, commuteResults, visibleUniversityIds, selectedUniversityId, onSelectUniversity, maxMinutes]);

    if (loadError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-sm text-gray-500 px-6 text-center">
                지도를 불러오지 못했습니다. ({loadError})
            </div>
        );
    }

    return <div ref={mapElement} className="w-full h-full" />;
};

export default MapContainer;
