// Design System Tokens
// Central configuration for all design tokens used across the application

export const designTokens = {
  // Color Palette
  colors: {
    primary: {
      50: 'hsl(48, 100%, 96%)',
      100: 'hsl(48, 96%, 89%)',
      200: 'hsl(48, 97%, 77%)',
      300: 'hsl(45, 97%, 64%)',
      400: 'hsl(43, 96%, 56%)',
      500: 'hsl(38, 92%, 50%)', // Main brand color
      600: 'hsl(32, 95%, 44%)',
      700: 'hsl(26, 90%, 37%)',
      800: 'hsl(23, 83%, 31%)',
      900: 'hsl(22, 78%, 26%)',
    },
    neutral: {
      50: 'hsl(210, 40%, 98%)',
      100: 'hsl(210, 40%, 96%)',
      200: 'hsl(214, 32%, 91%)',
      300: 'hsl(213, 27%, 84%)',
      400: 'hsl(215, 20%, 65%)',
      500: 'hsl(215, 16%, 47%)',
      600: 'hsl(215, 19%, 35%)',
      700: 'hsl(215, 25%, 27%)',
      800: 'hsl(217, 33%, 17%)',
      900: 'hsl(222, 84%, 5%)',
    },
    semantic: {
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(217, 91%, 60%)',
    }
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      display: ['Poppins', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },

  // Spacing Scale
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glass: '0 8px 32px 0 rgba(245, 158, 11, 0.2)',
    glassHover: '0 12px 40px 0 rgba(245, 158, 11, 0.3)',
  },

  // Glassmorphism
  glass: {
    background: {
      light: 'rgba(255, 255, 255, 0.25)',
      medium: 'rgba(255, 255, 255, 0.4)',
      strong: 'rgba(255, 255, 255, 0.6)',
      dark: 'rgba(15, 23, 42, 0.4)',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.3)',
      dark: 'rgba(255, 255, 255, 0.1)',
    },
    backdrop: 'blur(20px)',
  },

  // Transitions
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease',
    slow: 'all 0.3s ease',
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
} as const;

// Component Variants
export const componentVariants = {
  // Button variants
  button: {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white',
    secondary: 'bg-white/40 border border-white/20 hover:bg-white/60 text-neutral-700 hover:text-neutral-800',
    outline: 'bg-white/60 border border-white/30 hover:bg-white/80 text-neutral-600 hover:text-neutral-800',
    ghost: 'hover:bg-white/20 hover:text-neutral-800 shadow-none hover:shadow-md',
    destructive: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
  },

  // Card variants
  card: {
    default: 'backdrop-blur-xl bg-white/40 border border-white/20 shadow-xl hover:shadow-2xl',
    glass: 'backdrop-blur-xl bg-white/25 border border-white/30 shadow-glass hover:shadow-glassHover',
    solid: 'bg-white border border-neutral-200 shadow-lg hover:shadow-xl',
  },

  // Text variants
  text: {
    heading: 'font-display font-semibold tracking-tight',
    body: 'font-sans font-normal',
    caption: 'font-sans text-sm text-neutral-500',
    gradient: 'bg-gradient-to-r from-neutral-800 to-primary-600 bg-clip-text text-transparent',
  }
} as const;