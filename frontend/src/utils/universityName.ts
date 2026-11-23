import { UNIVERSITIES } from "../data/universities";

// 지도 핀 라벨은 공간이 좁아서 "덕성여자대학교" 대신 "덕성여대"처럼 줄여 쓴다.
const OVERRIDES: Record<string, string> = {
    서울과학기술대학교: "서울과기대",
    한국외국어대학교: "한국외대",
    서울교육대학교: "서울교대",
};

// 같은 이름의 대학이 여러 캠퍼스로 있을 때, 본캠은 이름만 쓰고 나머지 캠퍼스만 꼬리표를 단다.
const MAIN_CAMPUSES = new Set(["서울캠퍼스", "신촌캠퍼스", "안암캠퍼스", "인문사회과학캠퍼스", "본교"]);

const nameCount = new Map<string, number>();
UNIVERSITIES.forEach((u) => nameCount.set(u.name, (nameCount.get(u.name) ?? 0) + 1));

const SHORT_BY_ID = new Map<string, string>(
    UNIVERSITIES.map((u) => {
        const base =
            OVERRIDES[u.name] ?? u.name.replace("여자대학교", "여대").replace("대학교", "대");
        const needsCampus = (nameCount.get(u.name) ?? 0) > 1 && !MAIN_CAMPUSES.has(u.campus);
        return [u.id, needsCampus ? `${base} ${u.campus.replace("캠퍼스", "")}` : base];
    })
);

export function shortUniversityName(id: string, fallbackName: string): string {
    return SHORT_BY_ID.get(id) ?? fallbackName.replace("대학교", "대");
}
