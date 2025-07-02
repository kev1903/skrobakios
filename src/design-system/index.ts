// Design System Index
// Central export for all design system utilities

export { designTokens, componentVariants } from './tokens';
export {
  glassStyles,
  interactiveGlass,
  layoutStyles,
  textStyles,
  formStyles,
  cardStyles,
  buttonStyles,
  navigationStyles,
  statusStyles,
  animationStyles,
  responsiveStyles,
} from './components';

// Re-export common utilities
export { cn } from '@/lib/utils';

// Design System Hook for theme-aware components
import { useTheme } from '@/hooks/useTheme';

export const useDesignSystem = () => {
  const { theme } = useTheme();
  
  return {
    theme,
    // Add theme-specific utilities here if needed
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};