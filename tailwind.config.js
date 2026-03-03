/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Instrument Serif", "serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#18181b",
          hover: "#27272a",
          border: "#3f3f46",
        },
        accent: {
          DEFAULT: "#c084fc",
          hover: "#a855f7",
        },
      },
      borderRadius: {
        card: "1rem",
        button: "0.625rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 16px 48px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
}
