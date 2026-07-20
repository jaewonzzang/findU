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
        const fail = (reason: string) => {
            loadPromise = null;
            reject(new Error(reason));
        };

        // 인증 실패는 스크립트 로드가 끝난 뒤에 이 전역 콜백으로 따로 통보된다.
        (window as any).navermaps_authFailure = () =>
            fail("Naver Maps 인증 실패 (클라이언트 ID 또는 등록된 도메인 확인 필요)");

        const script = document.createElement("script");
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true;
        script.onload = () => {
            // 인증이 거부되면 스크립트는 정상 로드되지만 naver.maps 가 비어 있다.
            // 이때 resolve 하면 호출부가 null 을 참조해 앱 전체가 죽으므로 여기서 걸러낸다.
            if ((window as any).naver?.maps) resolve();
            else fail("Naver Maps를 초기화하지 못했습니다");
        };
        script.onerror = () => fail("Failed to load Naver Maps script");
        document.head.appendChild(script);
    });

    return loadPromise;
}
