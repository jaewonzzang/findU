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
    onMapClick?: () => void;
    maxMinutes: number;
    savedAddresses?: SavedAddress[];
    favoriteUniversityIds?: Set<string>;
}

export interface MapContainerHandle {
    resetView: () => void;
}

const NEUTRAL_COLOR = "#8B95A1";
const SAVED_ADDRESS_COLOR = "#F59E0B";
// 저장 주소를 그대로 검색하면 좌표가 사실상 같다 — 파란 집 마커를 겹쳐 그리지 않고 노란 별 하나로만 표시한다.
const SAME_POINT_EPSILON = 0.0002; // 약 22m

// 학사모 — 관심 대학 마커 안에 넣는다.
const GRADUATION_CAP =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden><path d="M12 3 1 8.5l11 5.5 9-4.5V16h2V8.5L12 3zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.5-7-3.5z"/></svg>';

const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(({
    homeLocation,
    universities,
    commuteResults,
    visibleUniversityIds,
    selectedUniversityId,
    onSelectUniversity,
    onMapClick,
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
    // 지도 init effect는 한 번만 돌기 때문에 최신 콜백을 ref로 넘겨준다.
    const onMapClickRef = useRef(onMapClick);
    onMapClickRef.current = onMapClick;
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
                    // 오른쪽 위는 결과 패널이 차지하므로 줌 버튼은 왼쪽 아래로 옮긴다.
                    zoomControlOptions: {
                        position: window.naver.maps.Position.LEFT_BOTTOM,
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
                    onMapClickRef.current?.();
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

        // 현재 위치가 저장 주소와 겹치면 파란 마커는 생략하고 노란 별 하나로만 표시한다.
        const homeIsSaved =
            !!homeLocation &&
            (savedAddresses ?? []).some(
                (s) =>
                    s.lat !== null &&
                    s.lng !== null &&
                    Math.abs(s.lat - homeLocation.lat) < SAME_POINT_EPSILON &&
                    Math.abs(s.lng - homeLocation.lng) < SAME_POINT_EPSILON
            );

        if (homeLocation && !homeIsSaved) {
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

        // 핀 끝을 좌표에 맞춘다. 저장 주소가 현재 위치와 겹칠 땐 파란 마커를 안 그리므로
        // 이 노란 별 하나가 그 지점을 대표한다.
        (savedAddresses ?? []).forEach((saved) => {
            if (saved.lat === null || saved.lng === null) return;

            const savedMarker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(saved.lat, saved.lng),
                map,
                title: saved.address,
                icon: {
                    content: `<div style="position:relative;width:26px;height:32px"><div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;background:${SAVED_ADDRESS_COLOR};border:3px solid white;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.3);color:white;font-size:12px;line-height:1">★</div><div style="position:absolute;top:25px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid white"></div></div>`,
                    anchor: new window.naver.maps.Point(13, 32),
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

            // 관심 대학은 점 대신 학사모 마커로 바꾼다. 배경색은 통학시간 색상을 그대로 써서
            // 다른 대학과 같은 기준으로 읽히게 한다.
            const dot = isFavorite
                ? `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:${color};border:3px solid white;border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer">${GRADUATION_CAP}</div>`
                : `<div style="background:${color};width:${size}px;height:${size}px;border-radius:9999px;border:${border}px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer"></div>`;

            const iconSize = isFavorite ? 30 : size;
            const labelTop = isFavorite ? 34 : size + 4;
            const positionedLabel = result
                ? `<div style="position:absolute;top:${labelTop}px;left:50%;transform:translateX(-50%);background:white;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:600;color:#374151;box-shadow:0 1px 3px rgba(0,0,0,0.15);white-space:nowrap">${result.duration_minutes}분</div>`
                : "";

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(uni.lat, uni.lng),
                map,
                title: uni.name,
                icon: {
                    content: `<div style="position:relative">${dot}${positionedLabel}</div>`,
                    anchor: new window.naver.maps.Point(iconSize / 2, iconSize / 2),
                },
                zIndex: isSelected ? 999 : isFavorite ? 500 : result ? 200 : 100,
            });

            const infoLabel = result ? `${uni.name} · ${result.duration_minutes}분` : uni.name;
            const showInfo = () => {
                infoWindowRef.current.setContent(
                    `<div style="position:relative;background:white;color:#1f2937;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;padding:4px 9px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.18);white-space:nowrap">${infoLabel}<div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%) rotate(45deg);width:10px;height:10px;background:white;box-shadow:2px 2px 4px rgba(0,0,0,0.06)"></div></div>`
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
                // 리스트에서 골랐을 때도 지도에서 어느 학교인지 바로 보이게 이름표를 고정해 띄운다.
                showInfo();
                pinnedIdRef.current = uni.id;
                openInfoIdRef.current = uni.id;
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
