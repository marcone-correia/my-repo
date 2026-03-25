import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        cream: { 50: "#faf9f7", 100: "#f5f2ed", 200: "#ede7de" },
        sage: { 600: "#4a7c59", 700: "#3d6b4a", 800: "#2f5239" },
      },
    },
  },
  plugins: [],
};
export default config;
