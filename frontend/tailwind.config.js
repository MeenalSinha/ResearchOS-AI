/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe1e3",
          200: "#ffc7cb",
          300: "#ff9da4",
          400: "#fd6470",
          500: "#f23344",
          600: "#dc1f33",
          700: "#b91529",
          800: "#981428",
          900: "#7f1526",
        },
        ink: {
          900: "#15151a",
          800: "#23232b",
          700: "#34343f",
          500: "#6b6b76",
          300: "#a8a8b3",
          100: "#e9e9ee",
          50: "#f7f7fa",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,15,20,0.04), 0 1px 8px rgba(15,15,20,0.04)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
