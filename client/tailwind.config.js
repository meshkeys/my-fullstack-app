/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        secondary: "#15803d",
        accent: "#22c55e",
        dark: "#14532d",
      },
    },
  },
  plugins: [],
};
