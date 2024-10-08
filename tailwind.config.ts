import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { nextui } from "@nextui-org/react";
import { withUt } from "uploadthing/tw";

export default withUt({
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      layout: {}, // common layout tokens (applied to all themes)
      themes: {
        light: {
          layout: {}, // light theme layout tokens
          colors: { secondary: "#F1F5FB" }, // light theme colors
        },
        dark: {
          layout: {}, // dark theme layout tokens
          colors: { secondary: "#F1F5FB" }, // dark theme colors
        },
        // ... custom themes
      },
    }),
  ],
}) satisfies Config;
