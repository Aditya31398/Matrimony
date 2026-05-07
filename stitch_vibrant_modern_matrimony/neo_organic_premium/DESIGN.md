---
name: Neo-Organic Premium
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cf'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ed'
  surface-container: '#ffe9e5'
  surface-container-high: '#fce3dd'
  surface-container-highest: '#f6ddd8'
  on-surface: '#261815'
  on-surface-variant: '#59413c'
  inverse-surface: '#3c2d29'
  inverse-on-surface: '#ffede9'
  outline: '#8d716a'
  outline-variant: '#e1bfb8'
  surface-tint: '#ae3115'
  primary: '#ae3115'
  on-primary: '#ffffff'
  primary-container: '#ff6b4a'
  on-primary-container: '#661000'
  inverse-primary: '#ffb4a3'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#5e5f5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#9a9a97'
  on-tertiary-container: '#313230'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8c1900'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#e3e2df'
  tertiary-fixed-dim: '#c7c7c3'
  on-tertiary-fixed: '#1b1c1a'
  on-tertiary-fixed-variant: '#464744'
  background: '#fff8f6'
  on-background: '#261815'
  surface-variant: '#f6ddd8'
typography:
  display-xl:
    fontFamily: Epilogue
    fontSize: 84px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.8'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  safe-margin: 64px
  organic-gutter: 40px
  overlap-negative: -32px
---

## Brand & Style
The design system is rooted in the concept of "Neo-Organic" matchmaking—a departure from clinical, data-heavy directories toward a soulful, editorial gallery experience. It targets a high-end demographic seeking depth and exclusivity. 

The visual style is a fusion of **Glassmorphism** and **Organic Minimalism**. By utilizing translucent layers, soft-focus backgrounds, and asymmetrical compositions, the UI mimics the fluid nature of human connection. The interface should feel alive, energetic, and premium, evoking the emotional warmth of a sunset through sophisticated color transitions and immersive depth.

## Colors
The 'Electric Sunset' palette is the heartbeat of this design system.
- **Deep Coral (#FF6B4A):** The primary energetic force, used for calls to action and critical brand moments.
- **Vibrant Violet (#7C3AED):** Used as a secondary accent to provide depth, contrast, and a sense of "mystique" in gradients and glass blurs.
- **Warm Cream (#FDFCF8):** The foundational canvas. It provides a more "soulful" and premium feel than a stark white, acting as the base for glassmorphic overlays.
- **Gradients:** Use linear-radial hybrids that transition from Deep Coral to Violet with high transparency (10-20% opacity) for background "blobs."

## Typography
The typography strategy creates an editorial rhythm.
- **Headlines:** **Epilogue** is utilized for its distinctive, geometric, and high-contrast personality. It should be set with tight tracking to feel like a premium magazine masthead.
- **Body:** **Be Vietnam Pro** offers an airy, approachable, and contemporary feel. Its generous x-height and light weights ensure readability against complex glassmorphic backgrounds.
- **Hierarchy:** Use extreme scale differences between display titles and body text to emphasize the premium, spacious nature of the layout.

## Layout & Spacing
The layout rejects the standard grid in favor of an **Asymmetrical Composition**. 
- **Organic Layers:** Elements should frequently overlap. Use negative margins to pull imagery behind text containers.
- **The "Matchmaking Gallery":** Profiles are not arranged in a grid; they are curated in a staggered, vertical flow where imagery size varies according to importance.
- **Fluid Boundaries:** Use soft, wave-like masks on full-bleed images to guide the eye from one section to the next, avoiding hard horizontal breaks.
- **Negative Space:** Whitespace (Cream-space) is a luxury asset. Do not crowd elements; allow the UI to breathe.

## Elevation & Depth
Depth is achieved through atmospheric layers rather than physical stacking.
- **Backdrop Blurs:** Use a `24px` to `40px` blur on glassmorphic containers. Surface opacity should hover between `40%` and `70%`.
- **Multi-Layered Shadows:** Instead of a single dark shadow, use two:
  1. A tight, low-opacity neutral shadow for definition.
  2. A wide, colorful "glow" shadow (using #FF6B4A at 10% opacity) to simulate light passing through a sunset-colored lens.
- **Immersion:** Background organic blobs should be positioned between the canvas and the UI components, creating a three-dimensional "aquarium" effect.

## Shapes
The shape language is strictly **Fluid and Organic**.
- **Containers:** All containers must have large, pill-shaped or custom organic radii. Avoid 90-degree angles entirely.
- **Imagery:** Use SVG "blob" masks for profile photos to maintain the neo-organic aesthetic.
- **Interactive States:** On hover, shapes should subtly "pulse" or shift their border-radius slightly to feel reactive and alive.

## Components
- **Oversized Buttons:** Primary buttons should be large (min-height 64px), featuring a Deep Coral gradient. On hover, apply a `0 0 30px` glow using the primary color.
- **Glassmorphic Cards:** These are the primary vessels for profile information. They feature a white inner-stroke (0.5px) to define edges against vibrant backgrounds.
- **The "Curated" Chip:** Small, violet-tinted translucent badges with high-contrast serif text used to highlight "Match Compatibility" or "Verified" status.
- **Floating Navigation:** A bottom-anchored, glassmorphic bar that floats above the content, using organic icons with subtle sunset gradients.
- **Full-Bleed Visuals:** Background imagery should bleed into the header and footer areas, treated with a "Warm Cream" tint to ensure text legibility remains high.
- **Input Fields:** Minimalist underlines or soft-glow containers that expand their "aura" when focused.