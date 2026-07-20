import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { SavedAddress } from "../api";
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
    savedAddresses?: SavedAddress[];
    favoriteUniversityIds?: Set<string>;
}

export interface MapContainerHandle {
    resetView: () => void;
}

const NEUTRAL_COLOR = "#8B95A1";
const SAVED_ADDRESS_COLOR = "#F59E0B";
const FAVORITE_COLOR = "#EF4444";

// 저장 주소가 지금 검색한 집 위치와 사실상 같은 지점이면 마커가 겹쳐 보이므로 하나만 그린다(약 30m).
const SAME_POINT_EPSILON = 3e-4;

const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(({
    homeLocation,
    universities,
    commuteResults,
    visibleUniversityIds,
    selectedUniversityId,
    onSelectUniversity,
    maxMinutes,
    savedAddresses,
    favoriteUniversityIds,
}, ref) => {
    const mapElement = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const infoWindowRef = useRef<any>(null);
    const openInfoIdRef = useRef<string | null>(null);
    const pinnedIdRef = useRef<string | null>(null);
    const listenersRef = useRef<any[]>([]);
    const [mapReady, setMapReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        resetView: () => {
            if (mapRef.current) {
                mapRef.current.setCenter(new window.naver.maps.LatLng(37.5665, 126.9780));
                mapRef.current.setZoom(11);
            }
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
                openInfoIdRef.current = null;
                pinnedIdRef.current = null;
            }
        },
    }), []);

    useEffect(() => {
        let cancelled = false;
        let mapClickHandle: any = null;
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
                infoWindowRef.current = new window.naver.maps.InfoWindow({
                    content: "",
                    borderWidth: 0,
                    backgroundColor: "transparent",
                    disableAnchor: true,
                    pixelOffset: new window.naver.maps.Point(0, -10),
                });
                mapClickHandle = window.naver.maps.Event.addListener(map, "click", () => {
                    if (infoWindowRef.current && (openInfoIdRef.current || pinnedIdRef.current)) {
                        infoWindowRef.current.close();
                        openInfoIdRef.current = null;
                        pinnedIdRef.current = null;
                    }
                });
                setMapReady(true);
            })
            .catch((err: Error) => {
                if (!cancelled) setLoadError(err.message);
            });
        return () => {
            cancelled = true;
            if (mapClickHandle) {
                window.naver.maps.Event.removeListener(mapClickHandle);
            }
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (!mapReady || !mapRef.current) return;

        listenersRef.current.forEach((h) => window.naver.maps.Event.removeListener(h));
        listenersRef.current = [];
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        if (infoWindowRef.current) {
            infoWindowRef.current.close();
            openInfoIdRef.current = null;
            pinnedIdRef.current = null;
        }

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

        (savedAddresses ?? []).forEach((saved) => {
            if (saved.lat === null || saved.lng === null) return;
            if (
                homeLocation &&
                Math.abs(homeLocation.lat - saved.lat) < SAME_POINT_EPSILON &&
                Math.abs(homeLocation.lng - saved.lng) < SAME_POINT_EPSILON
            ) {
                return;
            }

            const savedMarker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(saved.lat, saved.lng),
                map,
                title: saved.address,
                icon: {
                    content: `<div style="display:flex;align-items:center;justify-content:center;background:${SAVED_ADDRESS_COLOR};width:22px;height:22px;border-radius:9999px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);color:white;font-size:11px;line-height:1">★</div>`,
                    anchor: new window.naver.maps.Point(11, 11),
                },
                zIndex: 900,
            });
            markersRef.current.push(savedMarker);
        });

        universities.forEach((uni) => {
            if (visibleUniversityIds && !visibleUniversityIds.has(uni.id)) return;

            const result = resultById.get(uni.id);
            const isFavorite = favoriteUniversityIds?.has(uni.id) ?? false;
            // 관심 대학은 시간 필터에 걸려도 계속 보여준다 — 표시가 목적이라 사라지면 의미가 없다.
            if (result && result.duration_minutes > maxMinutes && !isFavorite) return;

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

            const heart = isFavorite
                ? `<div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);color:${FAVORITE_COLOR};font-size:13px;line-height:1;text-shadow:0 0 3px white,0 0 3px white">♥</div>`
                : "";

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(uni.lat, uni.lng),
                map,
                title: uni.name,
                icon: {
                    content: `<div style="position:relative"><div style="background:${color};width:${size}px;height:${size}px;border-radius:9999px;border:${border}px solid ${isFavorite ? FAVORITE_COLOR : "white"};box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer"></div>${heart}${label}</div>`,
                    anchor: new window.naver.maps.Point(half, half),
                },
                zIndex: isSelected ? 999 : isFavorite ? 500 : result ? 200 : 100,
            });

            const showInfo = () => {
                infoWindowRef.current.setContent(
                    `<div style="position:relative;background:white;color:#1f2937;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;padding:4px 9px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.18);white-space:nowrap">${uni.name}<div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%) rotate(45deg);width:10px;height:10px;background:white;box-shadow:2px 2px 4px rgba(0,0,0,0.06)"></div></div>`
                );
                infoWindowRef.current.open(mapRef.current, marker);
            };

            const mouseoverHandle = window.naver.maps.Event.addListener(marker, "mouseover", () => {
                if (!infoWindowRef.current || !mapRef.current) return;
                if (pinnedIdRef.current !== null) return;
                if (openInfoIdRef.current === uni.id) return;
                showInfo();
                openInfoIdRef.current = uni.id;
            });
            listenersRef.current.push(mouseoverHandle);

            const mouseoutHandle = window.naver.maps.Event.addListener(marker, "mouseout", () => {
                if (!infoWindowRef.current) return;
                if (pinnedIdRef.current === uni.id) return;
                if (openInfoIdRef.current !== uni.id) return;
                infoWindowRef.current.close();
                openInfoIdRef.current = null;
            });
            listenersRef.current.push(mouseoutHandle);

            const infoClickHandle = window.naver.maps.Event.addListener(marker, "click", () => {
                if (!infoWindowRef.current || !mapRef.current) return;
                if (pinnedIdRef.current === uni.id) {
                    infoWindowRef.current.close();
                    pinnedIdRef.current = null;
                    openInfoIdRef.current = null;
                } else {
                    showInfo();
                    pinnedIdRef.current = uni.id;
                    openInfoIdRef.current = uni.id;
                }
            });
            listenersRef.current.push(infoClickHandle);

            if (onSelectUniversity) {
                const selectHandle = window.naver.maps.Event.addListener(marker, "click", () => {
                    onSelectUniversity(uni.id);
                });
                listenersRef.current.push(selectHandle);
            }

            markersRef.current.push(marker);

            if (isSelected) {
                map.panTo(new window.naver.maps.LatLng(uni.lat, uni.lng));
            }
        });
    }, [mapReady, homeLocation, universities, commuteResults, visibleUniversityIds, selectedUniversityId, onSelectUniversity, maxMinutes, savedAddresses, favoriteUniversityIds]);

    if (loadError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-sm text-gray-500 px-6 text-center">
                지도를 불러오지 못했습니다. ({loadError})
            </div>
        );
    }

    return <div ref={mapElement} className="w-full h-full" />;
});

export default MapContainer;
