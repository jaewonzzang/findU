let loadPromise: Promise<void> | null = null;

export function loadNaverMaps(): Promise<void> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Naver Maps requires a browser"));
    }
    if ((window as any).naver?.maps) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = new Promise<void>((resolve, reject) => {
        const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
        if (!clientId) {
            reject(new Error("VITE_NAVER_MAP_CLIENT_ID is not set"));
            return;
        }
        const script = document.createElement("script");
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            loadPromise = null;
            reject(new Error("Failed to load Naver Maps script"));
        };
        document.head.appendChild(script);
    });

    return loadPromise;
}
