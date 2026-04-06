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
        // Discord-like colors
        blurple: {
          DEFAULT: "#5865F2",
          dark: "#4752C4",
        },
        dark: {
          DEFAULT: "#313338",
          hover: "#3F4145",
          active: "#383A40",
          sd: "#2B2D31",
          bl: "#1E1F22",
          more: "#232529",
        },
        embed: {
          sidebar: "#2B2D31",
          input: "#383A40",
        },
        status: {
          online: "#23A559",
          idle: "#F0B232",
          dnd: "#F23F43",
          offline: "#80848E",
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
