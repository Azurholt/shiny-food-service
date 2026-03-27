// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ALL extensions in ONE place
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        display: ['var(--font-plus-jakarta)', 'sans-serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00502e',
          container: '#006b3f',
          fixed: '#81d9a2',
          fixed_dim: '#81d9a2',
        },
        secondary: {
          DEFAULT: '#bb0023',
        },
        tertiary: {
          DEFAULT: '#745b00',
          fixed: '#f1c100',
          fixed_dim: '#f1c100',
        },
        surface: {
          DEFAULT: '#fcf9f8',
          container_low: '#f6f3f2',
          container_lowest: '#ffffff',
        },
        on_surface: '#1c1b1b',
        outline_variant: '#bec9bf',
      },
    },
  },
  plugins: [],
};

export default config;