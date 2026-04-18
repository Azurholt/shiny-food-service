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
      // 1. Box Shadows (Ambient shadow for cards)
      boxShadow: {
        'ambient': '0 12px 32px rgba(28, 27, 27, 0.06)',
      },

      // 2. Background Images (Gradients)
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      // 3. Fonts (Editorial hierarchy)
      fontFamily: {
        display: ['var(--font-plus-jakarta)', 'sans-serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
      },

      // 4. Colors — MERGED & CLEAN (DESIGN.md compliant)
      colors: {
        // Primary: Green (Actions, CTAs)
        primary: {
          DEFAULT: '#00502e',      // Main green
          container: '#006b3f',    // Hover/active state
          fixed: '#81d9a2',        // Soft fill for badges
          fixed_dim: '#81d9a2',    // Alias for consistency
        },
        // Secondary: Red (Alerts, critical)
        secondary: {
          DEFAULT: '#bb0023',
        },
        // Tertiary: Gold (Accents, Pending status)
        tertiary: {
          DEFAULT: '#745b00',      // Dark gold for text
          fixed: '#f1c100',        // Bright gold for icons
          fixed_dim: '#f1c100',    // Soft fill for badges
        },
        // Surface: Background layers (No-Line Rule)
        surface: {
          DEFAULT: '#fcf9f8',              // Base background
          container_low: '#f6f3f2',        // Section backgrounds
          container_lowest: '#ffffff',     // Cards/Modules
        },
        // Text & Utilities
        on_surface: '#1c1b1b',             // Primary text (not black!)
        outline_variant: '#bec9bf',        // Subtle borders at low opacity
      },
    },
  },
  plugins: [],
};

export default config;