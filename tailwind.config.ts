import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"

const config = {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2rem",
        "2xl": "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
  },
  plugins: [typography],
} satisfies Config

export default config
