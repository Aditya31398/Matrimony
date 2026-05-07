---
name: Vivid Union
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#59413c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8d716a'
  outline-variant: '#e1bfb8'
  surface-tint: '#ae3115'
  primary: '#ae3115'
  on-primary: '#ffffff'
  primary-container: '#ff6b4a'
  on-primary-container: '#661000'
  inverse-primary: '#ffb4a3'
  secondary: '#9a433f'
  on-secondary: '#ffffff'
  secondary-container: '#ff928b'
  on-secondary-container: '#772926'
  tertiary: '#8a4778'
  on-tertiary: '#ffffff'
  tertiary-container: '#cd82b6'
  on-tertiary-container: '#561a49'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8c1900'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#400104'
  on-secondary-fixed-variant: '#7c2c29'
  tertiary-fixed: '#ffd7ef'
  tertiary-fixed-dim: '#feade4'
  on-tertiary-fixed: '#3a0130'
  on-tertiary-fixed-variant: '#6e305f'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  section-padding: 80px
  card-gap: 24px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The brand identity centers on the "Joy of Connection," moving away from the transactional nature of traditional matrimony sites toward a celebratory, lifestyle-oriented experience. This design system adopts a **Modern Minimalist** aesthetic infused with high-energy accents. 

The personality is optimistic, inclusive, and sophisticated. By leveraging vast white space and oversized radius values, the UI feels breathable and organic rather than rigid or institutional. The goal is to evoke a sense of "digital hospitality"—where the interface acts as a warm, welcoming host for life-changing introductions.

## Colors

The palette is anchored by a "Sunset Gradient" logic, transitioning from energetic oranges to deep, romantic berries. 

- **Primary (Sunset Orange):** Used for primary actions and key brand moments. It represents energy and new beginnings.
- **Secondary (Soft Coral):** Used for supporting elements, hover states, and illustrative accents.
- **Tertiary (Deep Berry):** Reserved for high-contrast typography or sophisticated secondary buttons to ground the lighter colors.
- **Neutrals:** A heavy reliance on pure white (#FFFFFF) for backgrounds ensures the vibrant accents "pop" without overwhelming the user. Backgrounds for sections should use the soft Neutral (#F9FAFB) to create subtle containment.

## Typography

This design system utilizes **Plus Jakarta Sans** for its friendly, geometric, and modern characteristics. The type hierarchy is designed with generous line heights to enhance readability and contribute to the "airy" feel of the brand.

- **Headlines:** Use Bold or Semi-Bold weights with tight letter spacing for a punchy, contemporary editorial look.
- **Body Text:** Use Regular weight with a 1.6x line height to ensure long-form profiles and bios are easy to digest.
- **Labels:** Use Semi-Bold in a slightly smaller size for clear functional signposting.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to maintain a premium, editorial feel, while transitioning to a fluid model for mobile.

- **Grid:** A 12-column system with wide 24px gutters.
- **Rhythm:** An 8px base unit drives all spacing. For vertical rhythm between sections, use a generous 80px to 120px padding to maintain the "Minimal" aesthetic.
- **Grouping:** Use the "stack" variables to maintain consistent distance between elements (e.g., 12px between a label and an input, 24px between different form sections).

## Elevation & Depth

Depth is achieved through **Ambient Shadows** and **Tonal Layering** rather than heavy borders.

- **Surfaces:** Most cards should sit on the background with a very soft, diffused shadow (e.g., 0px 10px 30px rgba(0,0,0,0.04)).
- **Interactive States:** On hover, elements should slightly lift (increase shadow spread) or shift color subtly.
- **Borders:** Use ultra-thin (1px) borders in a very light grey or a tinted version of the primary color (e.g., 10% opacity orange) to define boundaries without adding visual weight.

## Shapes

The shape language is defined by **High Circularity**. 

- **Primary Elements:** Buttons and input fields use a 16px radius.
- **Large Containers:** Cards and image containers use a 24px radius to feel soft and approachable.
- **Images:** All profile imagery must have matching 24px corner radii or be fully circular for secondary thumbnails. No sharp corners should exist within the interface.

## Components

- **Buttons:** Large, 16px rounded corners with Semi-Bold text. Primary buttons use a vibrant orange-to-coral gradient; secondary buttons use a "ghost" style with a 1px soft-colored border.
- **Discovery Cards:** These are the centerpiece. Use a 24px radius, subtle shadow, and high-quality edge-to-edge imagery. Profile details should be overlaid using a soft bottom-up gradient or placed in a clean white area below the image.
- **Conversational Forms:** Instead of dense grids of inputs, use large, single-column input fields with 16px padding and 16px radius. Labels should be clear and written in a friendly, conversational tone.
- **Chips/Badges:** Used for interests or personality tags. These should be pill-shaped (full radius) with light pastel backgrounds tinted by the primary or secondary colors.
- **Checkboxes/Radios:** Customized to be larger than standard browser defaults, utilizing the primary orange color for the active state to ensure they feel custom and modern.