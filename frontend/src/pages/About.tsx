import React from "react";

const About: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tighter animate-fade-in">
                About findu
            </h1>

            <div className="space-y-8 text-lg leading-relaxed text-gray-600 animate-fade-in-up delay-100">
                <p>
                    findu는 집에서 특정 대학까지의 실제 통학 시간을 기반으로<br />
                    가장 가까운 명문대를 빠르게 비교할 수 있는 서비스입니다.
                </p>

                <p>
                    기존 지도 앱은 대학 검색 시 다양한 기관이 뒤섞여 정확하지 않으며,<br />
                    길찾기 앱은 한 번에 한 경로만 제공합니다.<br />
                    findu는 출발지를 기준으로 주요 명문대를 필터링하고<br />
                    대중교통 소요 시간을 계산해 가까운 순으로 제시합니다.
                </p>

                <p className="text-brand font-medium pt-4">
                    당신의 하루를 바꾸는 대학 선택, findu가 함께합니다.
                </p>
            </div>
        </div>
    );
};

export default About;
