import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "rh-sans": [
          "RH Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        "rh-serif": ["RH Serif", "Georgia", "Times New Roman", "serif"],
        rhc: [
          "RHC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        helvetica: [
          "Helvetica",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontWeight: {
        "ultra-hairline": "100",
        hairline: "200",
        "ultra-thin": "300",
        thin: "400",
        "extra-light": "500",
        light: "600",
        roman: "700",
        medium: "800",
        bold: "900",
      },
    },
  },
  plugins: [],
};

export default config;
