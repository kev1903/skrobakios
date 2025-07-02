// Design System Tokens
// Central configuration for all design tokens used across the application

export const designTokens = {
  // Skrobaki Color Palette
  colors: {
    primary: {
      50: 'hsl(225, 100%, 97%)',
      100: 'hsl(225, 100%, 94%)',
      200: 'hsl(225, 100%, 87%)',
      300: 'hsl(225, 100%, 80%)',
      400: 'hsl(225, 100%, 73%)',
      500: 'hsl(225, 100%, 63%)', // #265DFF - Main brand color
      600: 'hsl(225, 100%, 56%)',
      700: 'hsl(225, 100%, 49%)',
      800: 'hsl(225, 100%, 42%)',
      900: 'hsl(225, 100%, 35%)',
    },
    secondary: {
      50: 'hsl(37, 100%, 96%)',
      100: 'hsl(37, 100%, 89%)',
      200: 'hsl(37, 100%, 82%)',
      300: 'hsl(37, 100%, 75%)',
      400: 'hsl(37, 100%, 68%)',
      500: 'hsl(37, 100%, 50%)', // #FF9D00 - Secondary color
      600: 'hsl(37, 100%, 43%)',
      700: 'hsl(37, 100%, 36%)',
      800: 'hsl(37, 100%, 29%)',
      900: 'hsl(37, 100%, 22%)',
    },
    accent: {
      50: 'hsl(50, 100%, 95%)',
      100: 'hsl(50, 100%, 88%)',
      200: 'hsl(50, 100%, 81%)',
      300: 'hsl(50, 100%, 74%)',
      400: 'hsl(50, 100%, 67%)',
      500: 'hsl(50, 100%, 80%)', // #FFE399 - Accent/Highlight
      600: 'hsl(50, 100%, 73%)',
      700: 'hsl(50, 100%, 66%)',
      800: 'hsl(50, 100%, 59%)',
      900: 'hsl(50, 100%, 52%)',
    },
    neutral: {
      50: 'hsl(225, 60%, 99%)', // Background light
      100: 'hsl(225, 60%, 96%)', // Background medium
      200: 'hsl(225, 40%, 91%)', // Table borders #E0E6F0
      300: 'hsl(225, 30%, 84%)',
      400: 'hsl(225, 20%, 65%)',
      500: 'hsl(225, 16%, 47%)',
      600: 'hsl(225, 19%, 35%)',
      700: 'hsl(225, 25%, 27%)',
      800: 'hsl(0, 0%, 23%)', // #3A3A3A - Subtext
      900: 'hsl(0, 0%, 12%)', // #1F1F1F - Dark text
    },
    semantic: {
      success: 'hsl(142, 76%, 74%)', // Green #A7F3D0
      warning: 'hsl(37, 100%, 85%)', // Orange #FFD7A0  
      error: 'hsl(0, 84%, 90%)', // Red #FECACA
      info: 'hsl(225, 100%, 63%)', // Primary blue
    }
  },

  // Skrobaki Typography Scale
  typography: {
    fontFamily: {
      heading: ['Playfair Display', 'serif'], // Heading font
      body: ['Helvetica Neue', 'Inter', 'sans-serif'], // Body font
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      caption: '0.75rem',    // 12px - Caption/Label
      sm: '0.875rem',        // 14px - Body small
      base: '1rem',          // 16px - Body default
      lg: '1.125rem',        // 18px - H3
      xl: '1.375rem',        // 22px - H2
      '2xl': '1.75rem',      // 28px - H1
      '3xl': '1.875rem',     // 30px
      '4xl': '2.25rem',      // 36px
      '5xl': '3rem',         // 48px
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

// Skrobaki Component Variants
export const componentVariants = {
  // Button variants - 44px height, 12px border radius
  button: {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white h-11 rounded-xl shadow-md hover:shadow-lg transition-all duration-200',
    secondary: 'bg-white border border-primary-500 text-primary-500 hover:bg-primary-50 h-11 rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
    outline: 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 h-11 rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
    ghost: 'hover:bg-neutral-100 hover:text-neutral-800 shadow-none hover:shadow-sm h-11 rounded-xl transition-all duration-200',
    destructive: 'bg-red-500 hover:bg-red-600 text-white h-11 rounded-xl shadow-md hover:shadow-lg transition-all duration-200',
  },

  // Card variants - Clean white backgrounds
  card: {
    default: 'bg-white border border-neutral-200 shadow-sm hover:shadow-md rounded-xl transition-all duration-200',
    elevated: 'bg-white border border-neutral-200 shadow-lg hover:shadow-xl rounded-xl transition-all duration-200',
    interactive: 'bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-xl transition-all duration-200 cursor-pointer',
  },

  // Text variants - Playfair Display for headings
  text: {
    h1: 'font-heading text-2xl font-bold text-neutral-900 tracking-tight',
    h2: 'font-heading text-xl font-semibold text-neutral-900 tracking-tight',
    h3: 'font-heading text-lg font-medium text-neutral-900 tracking-tight',
    body: 'font-body text-base text-neutral-900',
    bodySmall: 'font-body text-sm text-neutral-800',
    caption: 'font-body text-caption font-semibold text-neutral-600 uppercase tracking-wide',
    link: 'font-body text-primary-500 hover:text-primary-600 hover:underline transition-colors duration-200',
  },

  // Status Badge variants - Rounded pills
  badge: {
    inProgress: 'bg-warning text-orange-800 font-semibold text-caption px-3 py-1 rounded-full border border-orange-200',
    pending: 'bg-error text-red-800 font-semibold text-caption px-3 py-1 rounded-full border border-red-200',
    completed: 'bg-success text-green-800 font-semibold text-caption px-3 py-1 rounded-full border border-green-200',
    default: 'bg-neutral-100 text-neutral-700 font-semibold text-caption px-3 py-1 rounded-full border border-neutral-200',
  },

  // Table variants - 56px row height, alternating backgrounds
  table: {
    row: 'h-14 border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-200',
    rowAlt: 'h-14 border-b border-neutral-200 bg-neutral-25 hover:bg-neutral-50 transition-colors duration-200',
    header: 'h-14 bg-neutral-100 border-b border-neutral-200 font-body font-semibold text-neutral-700',
    cell: 'px-6 py-4 text-neutral-900',
  }
} as const;