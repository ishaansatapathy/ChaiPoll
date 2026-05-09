/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        handwriting: ["Caveat", "cursive"],
      },
      colors: {
        ink: {
          950: "#020202",
          900: "#070707",
          850: "#0b0b0c",
          800: "#111113",
          700: "#19191c",
          600: "#26262a",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.42)",
      },
    },
  },
  plugins: [],
};
