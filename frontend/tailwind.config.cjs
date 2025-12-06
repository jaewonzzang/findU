/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: "#4F7DFF",
                    dark: "#3A63D0",
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
}
