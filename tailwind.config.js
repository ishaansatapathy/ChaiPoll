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
        chai: {
          50: "#fdfcfb",
          100: "#f7f1eb",
          200: "#ece0d1",
          300: "#dbc1ac",
          400: "#967259",
          500: "#634832",
          600: "#382c1e",
        },
        accent: {
          primary: "#ef4444",
          warm: "#f59e0b",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.42)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
