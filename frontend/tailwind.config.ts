import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        deep:           "#0a1628",
        current:        "#0d2b4e",
        surface:        "#1a4a7a",
        flow:           "#38bdf8",
        clarity:        "#06b6d4",
        murky:          "#f59e0b",
        toxic:          "#ef4444",
        foam:           "#e0f2fe",
        abyss:          "#030812",
        bioluminescent: "#7dd3fc",
        coral:          "#fb7185",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "bio-pulse": {
          "0%, 100%": { boxShadow: "0 0 24px rgba(125, 211, 252, 0.25), 0 0 48px rgba(125, 211, 252, 0.08)" },
          "50%":      { boxShadow: "0 0 36px rgba(125, 211, 252, 0.55), 0 0 72px rgba(125, 211, 252, 0.2)" },
        },
        "bio-pulse-soft": {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "0.85" },
        },
        "kelp-sway": {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%":      { transform: "rotate(1.5deg)" },
        },
      },
      animation: {
        float:            "float 7s ease-in-out infinite",
        "float-slow":     "float-slow 11s ease-in-out infinite",
        "bio-pulse":      "bio-pulse 3.2s ease-in-out infinite",
        "bio-pulse-soft": "bio-pulse-soft 4s ease-in-out infinite",
        "kelp-sway":      "kelp-sway 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
