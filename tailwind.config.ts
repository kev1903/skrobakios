
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
			'xs': '375px',
			'sm': '480px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1400px',
			// Mobile-specific breakpoints
			'mobile-sm': { 'max': '479px' },
			'mobile': { 'max': '767px' },
			'tablet': { 'min': '768px', 'max': '1023px' },
			// Height-based breakpoints for mobile
			'mobile-h-sm': { 'raw': '(max-height: 700px)' },
			'mobile-landscape': { 'raw': '(max-height: 500px) and (orientation: landscape)' }
		}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'system-ui', 'sans-serif'],
				'playfair': ['Playfair Display', 'serif'],
				'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
				'display': ['Playfair Display', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
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
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
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
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				glass: {
					DEFAULT: 'hsl(var(--glass-bg) / 0.05)',
					border: 'hsl(var(--glass-border) / 0.1)', 
					shadow: 'hsl(var(--glass-shadow) / 0.05)'
				},
				// SkrobakiOS Luxury Gold Accent
				'luxury-gold': {
					DEFAULT: 'hsl(var(--luxury-gold))',
					light: 'hsl(var(--luxury-gold-light))',
					dark: 'hsl(var(--luxury-gold-dark))',
				},
				'luxury-champagne': 'hsl(var(--luxury-champagne))',
				// Brand Colors
				'brand-black': 'hsl(var(--brand-black))',
				'brand-charcoal': 'hsl(var(--brand-charcoal))',
				'brand-gray': 'hsl(var(--brand-gray))',
				'brand-light-gray': 'hsl(var(--brand-light-gray))',
				'brand-cream': 'hsl(var(--brand-cream))',
				'brand-beige': 'hsl(var(--brand-beige))',
				'brand-sand': 'hsl(var(--brand-sand))',
				'brand-white': 'hsl(var(--brand-white))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backdropBlur: {
				'glass': '20px',
				'xl': '20px',
			},
			boxShadow: {
				'glass': '0 2px 16px rgba(0, 0, 0, 0.04)',
				'glass-hover': '0 4px 24px rgba(0, 0, 0, 0.08)',
				'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'scale-out': {
					from: { 
						transform: 'scale(1)', 
						opacity: '1' 
					},
					to: { 
						transform: 'scale(0.95)', 
						opacity: '0' 
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'slide-out-right': {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'pulse-subtle': {
					'0%, 100%': { 
						opacity: '1' 
					},
					'50%': { 
						opacity: '0.8' 
					}
				},
				'float': {
					'0%, 100%': { 
						transform: 'translateY(0px)' 
					},
					'50%': { 
						transform: 'translateY(-10px)' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			transitionDuration: {
				'200': '200ms',
				'300': '300ms',
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require('tailwind-scrollbar')({ nocompatible: true })
	],
} satisfies Config;
