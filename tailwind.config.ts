import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matrix/Terminal colors
        primary: {
          DEFAULT: "#00FF41",
          dark: "#00CC33",
        },
        bg: {
          DEFAULT: "#0D0D0D",
          hover: "#1A1A1A",
          active: "#262626",
          sidebar: "#0A0A0A",
        },
        "border-bright": "#00FF41",
        cyan: "#00D4FF",
        warning: "#FFD700",
        error: "#FF0040",
        status: {
          online: "#00FF41",
          idle: "#FFD700",
          dnd: "#FF0040",
          offline: "#004D1A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
