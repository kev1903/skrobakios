// Design System Component Utilities
// Shared component styles and utility functions

import { cn } from "@/lib/utils";
import { designTokens, componentVariants } from "./tokens";

// Glass Effect Utilities
export const glassStyles = {
  light: cn(
    "backdrop-blur-xl bg-white/40 border border-white/20",
    "shadow-xl hover:shadow-2xl transition-all duration-300"
  ),
  medium: cn(
    "backdrop-blur-xl bg-white/60 border border-white/30",
    "shadow-xl hover:shadow-2xl transition-all duration-300"
  ),
  strong: cn(
    "backdrop-blur-xl bg-white/80 border border-white/40",
    "shadow-xl hover:shadow-2xl transition-all duration-300"
  ),
  dark: cn(
    "backdrop-blur-xl bg-slate-900/40 border border-white/10",
    "shadow-xl hover:shadow-2xl transition-all duration-300"
  ),
};

// Interactive Glass Effect
export const interactiveGlass = cn(
  "glass-hover transition-all duration-200 cursor-pointer",
  "hover:transform hover:-translate-y-1"
);

// Layout Containers
export const layoutStyles = {
  page: cn(
    "min-h-screen w-full",
    "bg-gradient-to-br from-neutral-50 via-amber-50/30 to-amber-100/50"
  ),
  container: cn(
    "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
  ),
  section: cn(
    "py-8 md:py-12 lg:py-16"
  ),
  grid: {
    responsive: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
    dashboard: "grid grid-cols-1 lg:grid-cols-12 gap-6",
  }
};

// Typography Styles
export const textStyles = {
  heading: {
    h1: cn("text-4xl md:text-5xl font-display font-bold tracking-tight"),
    h2: cn("text-3xl md:text-4xl font-display font-semibold tracking-tight"),
    h3: cn("text-2xl md:text-3xl font-display font-semibold tracking-tight"),
    h4: cn("text-xl md:text-2xl font-display font-medium tracking-tight"),
    h5: cn("text-lg md:text-xl font-display font-medium"),
    h6: cn("text-base md:text-lg font-display font-medium"),
  },
  body: {
    large: cn("text-lg font-sans text-neutral-700"),
    default: cn("text-base font-sans text-neutral-600"),
    small: cn("text-sm font-sans text-neutral-500"),
    caption: cn("text-xs font-sans text-neutral-400"),
  },
  gradient: cn(
    "bg-gradient-to-r from-neutral-800 to-primary-600",
    "bg-clip-text text-transparent font-display font-semibold"
  ),
};

// Form Styles
export const formStyles = {
  input: cn(
    "backdrop-blur-sm bg-white/60 border-white/30",
    "focus:bg-white/80 focus:border-primary-400",
    "transition-all duration-200 rounded-lg"
  ),
  label: cn(
    "text-sm font-medium text-neutral-700 mb-2 block"
  ),
  fieldset: cn(
    "space-y-4 p-6 rounded-xl",
    "backdrop-blur-xl bg-white/40 border border-white/20"
  ),
};

// Card Component Styles
export const cardStyles = {
  default: cn(
    glassStyles.light,
    "rounded-2xl p-6"
  ),
  interactive: cn(
    glassStyles.light,
    interactiveGlass,
    "rounded-2xl p-6"
  ),
  compact: cn(
    glassStyles.light,
    "rounded-xl p-4"
  ),
  hero: cn(
    glassStyles.medium,
    "rounded-3xl p-8 md:p-12"
  ),
};

// Button Styles (extends the existing button component)
export const buttonStyles = {
  primary: cn(
    "bg-gradient-to-r from-primary-500 to-primary-600",
    "hover:from-primary-600 hover:to-primary-700",
    "text-white shadow-lg hover:shadow-xl",
    "transition-all duration-200"
  ),
  secondary: cn(
    "bg-white/40 border border-white/20",
    "hover:bg-white/60 text-neutral-700 hover:text-neutral-800",
    "shadow-lg hover:shadow-xl transition-all duration-200"
  ),
  ghost: cn(
    "hover:bg-white/20 hover:text-neutral-800",
    "shadow-none hover:shadow-md transition-all duration-200"
  ),
};

// Navigation Styles
export const navigationStyles = {
  navbar: cn(
    "glass-light border-b border-white/20 p-6 shadow-lg w-full"
  ),
  navLink: cn(
    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
    "hover:bg-white/10 hover:text-white"
  ),
  navLinkActive: cn(
    "bg-primary-500 text-white shadow-lg"
  ),
  breadcrumb: cn(
    "flex items-center space-x-2 text-sm text-neutral-500"
  ),
};

// Status and Badge Styles
export const statusStyles = {
  badge: {
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    neutral: "bg-neutral-100 text-neutral-800 border-neutral-200",
  },
  priority: {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  },
};

// Animation Classes
export const animationStyles = {
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in",
  scaleIn: "animate-scale-in",
  float: "animate-float",
  glow: "animate-glow",
};

// Responsive Breakpoint Utilities
export const responsiveStyles = {
  mobile: "block md:hidden",
  desktop: "hidden md:block",
  tabletUp: "hidden sm:block",
  desktopUp: "hidden lg:block",
};