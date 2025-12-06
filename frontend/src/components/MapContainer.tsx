import { useEffect, useRef } from "react";
import { University } from "../types";

declare global {
    interface Window {
        naver: any;
    }
}

interface MapContainerProps {
    homeLocation: { lat: number; lng: number } | null;
    universities: University[];
    selectedUniversityId: string | null;
}

const MapContainer = ({ homeLocation, universities, selectedUniversityId }: MapContainerProps) => {
    const mapElement = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    useEffect(() => {
        if (!mapElement.current || !window.naver) return;

        const location = new window.naver.maps.LatLng(37.5665, 126.9780); // Default: Seoul City Hall
        const mapOptions = {
            center: location,
            zoom: 11,
            zoomControl: true,
        };

        const map = new window.naver.maps.Map(mapElement.current, mapOptions);
        mapRef.current = map;
    }, []);

    // Update markers
    useEffect(() => {
        if (!mapRef.current || !window.naver) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        const map = mapRef.current;

        // 1. Home Marker
        if (homeLocation) {
            const homeMarker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(homeLocation.lat, homeLocation.lng),
                map: map,
                icon: {
                    content: '<div style="background: #3182F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>',
                    anchor: new window.naver.maps.Point(10, 10),
                },
                zIndex: 1000,
            });
            markersRef.current.push(homeMarker);

            // Center map on home if it's the first time or explicitly requested (optional)
            // For now, we'll fit bounds if we have results.
        }

        // 2. University Markers
        universities.forEach((uni) => {
            const isSelected = uni.id === selectedUniversityId;
            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(uni.lat, uni.lng),
                map: map,
                title: uni.name,
                icon: {
                    content: isSelected
                        ? '<div style="background: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></div>'
                        : '<div style="background: #8B95A1; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                    anchor: isSelected ? new window.naver.maps.Point(12, 12) : new window.naver.maps.Point(6, 6),
                },
                zIndex: isSelected ? 999 : 100,
            });
            markersRef.current.push(marker);

            if (isSelected) {
                map.panTo(new window.naver.maps.LatLng(uni.lat, uni.lng));
            }
        });

    }, [homeLocation, universities, selectedUniversityId]);

    return <div ref={mapElement} style={{ width: "100%", height: "100%", minHeight: "400px" }} />;
};

export default MapContainer;
