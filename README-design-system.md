# Design System Documentation

## Overview
This design system provides a comprehensive set of design tokens, components, and utilities for building consistent, beautiful interfaces across the entire website.

## Core Principles
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur effects
- **Amber/Golden Accent**: Primary brand color with warm, professional feel
- **Semantic Tokens**: All colors use HSL values and semantic naming
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Accessibility**: High contrast ratios and proper focus states

## Usage

### Import the Design System
```typescript
import { 
  cardStyles, 
  textStyles, 
  glassStyles,
  layoutStyles,
  cn 
} from '@/design-system';
```

### Basic Component Example
```tsx
import { cardStyles, textStyles } from '@/design-system';

export const ExampleCard = ({ title, content }) => {
  return (
    <div className={cardStyles.default}>
      <h3 className={textStyles.heading.h3}>{title}</h3>
      <p className={textStyles.body.default}>{content}</p>
    </div>
  );
};
```

## Design Tokens

### Colors
- **Primary**: Amber/golden brand colors (primary-50 to primary-600)
- **Neutral**: Gray scale for text and backgrounds (neutral-50 to neutral-800)
- **Semantic**: Success, warning, error, and info colors
- **Glass**: Transparent background colors for glassmorphism

### Typography
- **Font Families**: Inter (body), Poppins (headings), Fira Code (mono)
- **Font Sizes**: xs (12px) to 5xl (48px)
- **Font Weights**: normal, medium, semibold, bold
- **Line Heights**: tight, normal, relaxed

### Spacing
- Consistent 4px base unit scaling from 1 (4px) to 24 (96px)

### Border Radius
- From none to 3xl (24px) with full for circular elements

## Component Styles

### Cards
```typescript
cardStyles.default     // Standard glass card
cardStyles.interactive // Hover effects and cursor pointer
cardStyles.compact     // Smaller padding
cardStyles.hero        // Large padding for hero sections
```

### Text
```typescript
textStyles.heading.h1  // Large heading
textStyles.body.default // Standard body text
textStyles.gradient    // Gradient text effect
```

### Glass Effects
```typescript
glassStyles.light   // Light transparency
glassStyles.medium  // Medium transparency
glassStyles.strong  // Strong transparency
glassStyles.dark    // Dark mode variant
```

### Layout
```typescript
layoutStyles.page      // Full page container
layoutStyles.container // Max-width container
layoutStyles.grid.responsive // Responsive grid
```

### Buttons
Use the existing button component with enhanced variants:
- `primary`: Gradient amber button
- `secondary`: Glass effect button
- `ghost`: Transparent hover button

### Navigation
```typescript
navigationStyles.navbar     // Glass navbar
navigationStyles.navLink    // Navigation link
navigationStyles.navLinkActive // Active state
```

### Forms
```typescript
formStyles.input     // Glass input styling
formStyles.label     // Standard label
formStyles.fieldset  // Grouped form elements
```

### Status & Badges
```typescript
statusStyles.badge.success  // Green success badge
statusStyles.priority.high  // High priority styling
```

## Responsive Design

### Breakpoints
- Mobile: default (< 640px)
- Tablet: sm (640px+)
- Desktop: md (768px+)
- Large: lg (1024px+)
- XL: xl (1280px+)

### Responsive Utilities
```typescript
responsiveStyles.mobile    // Show only on mobile
responsiveStyles.desktop   // Show only on desktop
responsiveStyles.tabletUp  // Show on tablet and up
```

## Animations
```typescript
animationStyles.fadeIn   // Fade in animation
animationStyles.slideIn  // Slide in animation
animationStyles.scaleIn  // Scale in animation
animationStyles.float    // Floating animation
animationStyles.glow     // Glow effect
```

## Best Practices

1. **Always use semantic tokens** instead of direct colors
2. **Compose styles** using the cn() utility for conditional classes
3. **Use glass effects** consistently for modern aesthetics
4. **Follow responsive patterns** with mobile-first approach
5. **Maintain accessibility** with proper contrast and focus states

## Dark Mode Support
The design system includes automatic dark mode support through CSS variables. Use the semantic tokens and they will automatically adapt.

## Examples

### Modern Card Component
```tsx
import { cardStyles, textStyles, cn } from '@/design-system';

export const ProjectCard = ({ project, isActive }) => {
  return (
    <div className={cn(
      cardStyles.interactive,
      isActive && "ring-2 ring-primary-500"
    )}>
      <h3 className={textStyles.heading.h4}>{project.name}</h3>
      <p className={textStyles.body.small}>{project.description}</p>
    </div>
  );
};
```

### Glass Navigation
```tsx
import { navigationStyles, glassStyles } from '@/design-system';

export const Navigation = () => {
  return (
    <nav className={cn(navigationStyles.navbar, glassStyles.medium)}>
      {/* Navigation content */}
    </nav>
  );
};
```

This design system ensures consistency across all pages while maintaining the modern glassmorphism aesthetic that defines your application's visual identity.