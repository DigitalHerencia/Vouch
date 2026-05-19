import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./features/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        neutral: {
          950: "var(--neutral-950)",
          700: "var(--neutral-700)",
          400: "var(--neutral-400)",
          100: "var(--neutral-100)",
        },
      },
      boxShadow: {
        "hard-blue": "6px 6px 0 var(--primary)",
        "hard-blue-sm": "4px 4px 0 var(--primary)",
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
      },
      fontFamily: {
        brand: "var(--font-brand)",
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
    },
  },
  plugins: [],
}

export default config
