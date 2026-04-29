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
        cf: {
          navy:         "#203b88",
          "navy-dark":  "#162d6e",
          "navy-deep":  "#0f1f5c",
          green:        "#73b815",
          "green-dark": "#5a9010",
          "green-light":"#a8d96b",
          "green-pale": "#f3fae6",
          bg:           "#f7f8fc",
          surface:      "#edf0f7",
          border:       "#e4e8f0",
          text1:        "#0f172a",
          text2:        "#334155",
          text3:        "#64748b",
          danger:       "#dc2626",
          warning:      "#d97706",
          success:      "#16a34a",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "cf-hero": "linear-gradient(135deg, #0f1f5c 0%, #203b88 60%, #1a4fa8 100%)",
      },
      boxShadow: {
        "cf-sm":    "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        "cf-md":    "0 4px 12px rgba(15,23,42,0.07)",
        "cf-lg":    "0 8px 24px rgba(15,23,42,0.09)",
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
