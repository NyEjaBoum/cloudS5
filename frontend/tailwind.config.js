/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // New teal/slate palette
        teal: {
          50: "#f0f5f6",
          100: "#dce6e9",
          200: "#b8ccd2",
          300: "#8fadb6",
          400: "#5d8391",
          500: "#4a7280",
          600: "#3D5E6B",  // Primary
          700: "#344f5a",
          800: "#2c424b",
          900: "#26373f",
        },
        stone: {
          50: "#f5f4f2",
          100: "#e8e6e2",
          200: "#D5D0C4",  // Cream/beige
          300: "#bbb4a5",
          400: "#9CA5B1",  // Light gray-blue
          500: "#877C73",  // Warm taupe
          600: "#6b6159",
          700: "#44474D",  // Dark gray
          800: "#3a3c40",
          900: "#2f3033",
        },
        slate: {
          25: "#fcfcfd",
          50: "#f8fafc",
          75: "#f5f7fa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        "soft": "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 2px 8px -2px rgb(0 0 0 / 0.04)",
        "elevated": "0 4px 16px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        "modal": "0 20px 60px -12px rgb(0 0 0 / 0.15), 0 8px 20px -8px rgb(0 0 0 / 0.08)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mapeo: {
          primary: "#3D5E6B",
          "primary-content": "#ffffff",
          secondary: "#44474D",
          "secondary-content": "#ffffff",
          accent: "#877C73",
          "accent-content": "#ffffff",
          neutral: "#44474D",
          "neutral-content": "#f8fafc",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#f1f5f9",
          "base-content": "#0f172a",
          info: "#3b82f6",
          "info-content": "#ffffff",
          success: "#16a34a",
          "success-content": "#ffffff",
          warning: "#f59e0b",
          "warning-content": "#ffffff",
          error: "#dc2626",
          "error-content": "#ffffff",
        },
      },
    ],
  },
}
