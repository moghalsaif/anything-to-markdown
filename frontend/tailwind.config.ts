import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "oklch(0.97 0.012 95)",
        ink: "oklch(0.2 0.03 255)",
        ember: "oklch(0.69 0.17 39)",
        sage: "oklch(0.57 0.08 154)",
        mist: "oklch(0.91 0.02 240)",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(38, 42, 56, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
