/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F19",
        surface: "#111827",
        primary: "#6366F1",
        secondary: "#22D3EE",
        accent: "#F59E0B",
        text: "#E5E7EB",
        muted: "#9CA3AF"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        glow: "0 0 30px rgba(99,102,241,0.3)",
        'glow-hover': "0 0 40px rgba(99,102,241,0.5)",
      }
    },
  },
  plugins: [],
}
