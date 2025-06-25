
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        handwritten: ['"Shadows Into Light"', 'cursive'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Emotional tag pastel colors & themes
        love: {
          DEFAULT: "#FFD5EC", // bg-love
          text: "#831843",    // text-love-text (darker pink)
          card: "#fff1f7",    // bg-love-card (very light pink)
          foreground: "#831843", // text-love-foreground (for card text)
          accent: "#fbcfe8"   // border-love-accent (light pink)
        },
        regret: {
          DEFAULT: "#D7D6F6", // bg-regret
          text: "#3730a3",    // text-regret-text (darker indigo)
          card: "#f0f0fd",    // bg-regret-card (very light indigo)
          foreground: "#3730a3", // text-regret-foreground
          accent: "#e0e7ff"   // border-regret-accent (light indigo)
        },
        goodbye: {
          DEFAULT: "#C6E5F7", // bg-goodbye
          text: "#0369a1",    // text-goodbye-text (darker sky blue)
          card: "#effaff",    // bg-goodbye-card (very light sky blue)
          foreground: "#0369a1", // text-goodbye-foreground
          accent: "#bae6fd"   // border-goodbye-accent (light sky blue)
        },
        gratitude: {
          DEFAULT: "#E3F8CF", // bg-gratitude
          text: "#3f6212",    // text-gratitude-text (darker green)
          card: "#f7fee7",    // bg-gratitude-card (very light green)
          foreground: "#3f6212", // text-gratitude-foreground
          accent: "#d9f99d"   // border-gratitude-accent (light green)
        },
        confession: {
          DEFAULT: "#FFE5B4", // bg-confession
          text: "#854d0e",    // text-confession-text (darker amber)
          card: "#fffbeb",    // bg-confession-card (very light amber)
          foreground: "#854d0e", // text-confession-foreground
          accent: "#fde68a"   // border-confession-accent (light amber)
        },
        rage: {
          DEFAULT: "#FFDADA", // bg-rage
          text: "#9f1239",    // text-rage-text (darker rose)
          card: "#fff1f2",    // bg-rage-card (very light rose)
          foreground: "#9f1239", // text-rage-foreground
          accent: "#fecdd3"   // border-rage-accent (light rose)
        },
        closure: {
          DEFAULT: "#E0D6D6", // bg-closure
          text: "#44403c",    // text-closure-text (darker stone)
          card: "#f5f5f4",    // bg-closure-card (very light stone)
          foreground: "#44403c", // text-closure-foreground
          accent: "#d6d3d1"   // border-closure-accent (light stone)
        },
        // Previous sidebar/secondary colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        'diary': '0 6px 32px 0 rgba(145, 112, 160, 0.05), 0 1px 4px 0 rgba(112, 99, 90, 0.08)',
      },
      keyframes: {
        'fade-in': {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.4,0,0.2,1)"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
