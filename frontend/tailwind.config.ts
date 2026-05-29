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
        primary: {
          DEFAULT: "#D4AF37", // Luxury Gold
          50: "#FCF9EE",
          100: "#F5ECD3",
          200: "#EBD9A4",
          300: "#E5C56E",
          400: "#DEB84D",
          500: "#D4AF37",
          600: "#C9A227",
          700: "#9C7E1F",
          800: "#7A6318",
          900: "#594911",
        },
        navy: {
          DEFAULT: "#0B1F4D", // Royal Navy Blue
          50: "#EDF2FB",
          100: "#CFDDF3",
          200: "#95B4E4",
          300: "#578AD4",
          400: "#2B5FA7",
          500: "#163A8C",
          600: "#102B6A",
          700: "#0B1F4D",
          800: "#071433",
          900: "#040A1A",
        },
        secondary: "#6c757d",
        accent: "#0dcaf0",
        gold: "#ffc107",
        dark: "#212529",
        light: "#f8f9fa",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        "pt16": "16px",
        "pt24": "24px",
        "pt40": "40px",
        "pt48": "48px",
        "pt64": "64px",
        "pt80": "80px",
        "pt120": "120px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-in": "slideIn 0.5s ease forwards",
        "counter": "counter 2s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
