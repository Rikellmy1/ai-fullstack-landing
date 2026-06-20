import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: "0",
            transform: "translate(-72%, -62%) scale(0.72)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-42%, -34%) scale(1)",
          },
        },
      },
      animation: {
        spotlight: "spotlight 1.8s 0.3s ease-out forwards",
      },
    },
  },
}

export default config
