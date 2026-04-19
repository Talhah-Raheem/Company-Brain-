import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep:    "#0a1628",
        current: "#0d2b4e",
        surface: "#1a4a7a",
        flow:    "#38bdf8",
        clarity: "#06b6d4",
        murky:   "#f59e0b",
        toxic:   "#ef4444",
        foam:    "#e0f2fe",
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
      },
      animation: {
        float:       "float 7s ease-in-out infinite",
        "float-slow":"float-slow 11s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
