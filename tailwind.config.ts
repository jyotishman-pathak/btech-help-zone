// tailwind.config.ts — CEE HelpZone
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["DM Sans", "system-ui", "sans-serif"],
                display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            colors: {
                brand: {
                    50: "#EEF0FF",
                    100: "#D0D5FF",
                    200: "#A5AFFF",
                    300: "#7A87FF",
                    400: "#6366F1",
                    500: "#4F46E5",
                    600: "#4338CA",
                    700: "#3730A3",
                    800: "#312E81",
                    900: "#1E1B5E",
                    950: "#0D0B2E",
                },
                surface: {
                    page: "#F7F5FF",
                    card: "#FFFFFF",
                    raised: "#FFFFFF",
                },
            },
            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem",
            },
            backgroundImage: {
                "gradient-brand": "linear-gradient(135deg, #6366F1, #8B5CF6)",
                "gradient-amber": "linear-gradient(135deg, #FBBF24, #F97316)",
                "gradient-hero": "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)",
                "noise": "url('/noise.svg')",
            },
            boxShadow: {
                "card": "0 1px 3px rgba(99,102,241,0.06), 0 4px 16px rgba(99,102,241,0.04)",
                "lifted": "0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.06)",
                "brand": "0 8px 32px rgba(99,102,241,0.30)",
                "amber": "0 8px 32px rgba(251,191,36,0.30)",
                "glow": "0 0 60px -10px rgba(99,102,241,0.5)",
            },
            animation: {
                "fade-up": "fadeUp 0.4s ease-out forwards",
                "fade-in": "fadeIn 0.3s ease-out forwards",
                "slide-in": "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "shimmer": "shimmer 1.5s ease-in-out infinite",
                "pulse-slow": "pulse 3s ease-in-out infinite",
            },
            keyframes: {
                fadeUp: {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideIn: {
                    "0%": { opacity: "0", transform: "translateX(-12px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% center" },
                    "100%": { backgroundPosition: "200% center" },
                },
            },
        },
    },
    plugins: [],
};

export default config;