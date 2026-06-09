/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        primary: "#9B00FF", // purple color from logo
        secondary: "#0EA5E9", // Sky 500
        accent: "#F59E0B", // Amber 500
        dark: "#0F172A", // Slate 900
        light: "#F8FAFC", // Slate 50
        purpleColor: "#9B00FF", // purple color from logo
      },
      boxShadow: {
        large: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        glow: "0 0 15px rgba(79, 70, 229, 0.5)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
