---
name: Joyful Connection
colors:
  surface: '#fef7ff'
  surface-dim: '#dfd7e6'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f1ff'
  surface-container: '#f3ebfa'
  surface-container-high: '#ede5f4'
  surface-container-highest: '#e7e0ee'
  on-surface: '#1d1a24'
  on-surface-variant: '#4a4455'
  inverse-surface: '#322f39'
  inverse-on-surface: '#f6eefd'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#7030e6'
  primary: '#6218d9'
  on-primary: '#ffffff'
  primary-container: '#7b3ff2'
  on-primary-container: '#f0e6ff'
  inverse-primary: '#d1bcff'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#005e3d'
  on-tertiary: '#ffffff'
  tertiary-container: '#007950'
  on-tertiary-container: '#99ffc9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d1bcff'
  on-primary-fixed: '#23005b'
  on-primary-fixed-variant: '#5700c9'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#77fbbb'
  tertiary-fixed-dim: '#58dea1'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005234'
  background: '#fef7ff'
  on-background: '#1d1a24'
  surface-variant: '#e7e0ee'
typography:
  display-lg:
    fontFamily: Nunito
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Nunito
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Nunito
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
  touch-target-min: 56px
---

## Brand & Style

The visual identity of this design system is built on the concept of **Energetic Radiance**. It moves away from the somber, traditional aesthetics often associated with faith-based platforms, opting instead for a "community-first" atmosphere that feels like a celebration. The style is heavily influenced by **High-Contrast Boldness** and **Tactile UI**, utilizing thick strokes and vibrant color blocks to create a sense of momentum and play.

The emotional goal is to lower the barrier to entry for all ages—making biblical engagement feel as intuitive and exciting as a modern game night. Every interaction should feel responsive and rewarding, using physics-based transitions and a "squishy" tactile feel that encourages exploration and participation.

## Colors

The palette is anchored by **Deep Violet**, representing wisdom and depth, but is balanced by a warm, off-white background (`#FFFBF2`) to keep the interface feeling approachable and "sunny." **Gold Amber** is reserved for high-momentum moments—points, celebrations, and primary calls to action. 

The color system utilizes high-contrast pairings to ensure accessibility for younger children and older adults alike. Success and Error states are loud and unmistakable, ensuring that feedback in a fast-paced game environment is processed instantly.

## Typography

This design system utilizes a dual-font strategy to balance personality with readability. **Nunito** is used for all headings; its naturally rounded terminals mirror the "joyful" and "friendly" brand pillars. For the body and functional text, **DM Sans** provides a clean, geometric stability that ensures long-form scripture or complex questions remain highly legible across all device sizes.

Typographic hierarchy is aggressive. Large font sizes and heavy weights are preferred to maintain the "bold" game-like aesthetic, ensuring that text never feels secondary to the UI.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with generous safe areas. A base unit of 8px dictates all spatial relationships, but the design leans into "loose" spacing to prevent the UI from feeling cramped or overwhelming. 

Tap targets are oversized (minimum 56px height) to accommodate "high-energy" interaction—where users might be tapping quickly during a timed quiz. Components are often center-aligned to create a focused, stage-like presentation for content.

## Elevation & Depth

To achieve the "Kahoot-inspired" game-like feel, this design system avoids soft, realistic ambient shadows. Instead, it uses **Bold Borders and Solid Offsets**.

Elements use a 2px to 4px solid border in a darker shade of the surface color to create a "sticker" or "button" effect. When an element is "pressed," it physically shifts 2px down and to the right, and the solid shadow disappears, providing immediate tactile feedback. This "low-fidelity" depth reinforces the playful, unpretentious nature of the brand.

## Shapes

The shape language is defined by **Pill-like Softness**. Sharp corners are non-existent in this design system. Standard components use a 16px (1rem) radius, while "Large" components like primary action buttons use a fully rounded/pill-shaped profile.

Containers and cards utilize a slightly softer radius than buttons to create a nested visual harmony. This excessive rounding contributes to the "safe" and "joyful" feel, making the interface feel soft to the touch and community-friendly.

## Components

### Buttons
Primary buttons are high-contrast Gold Amber with a Deep Violet solid offset shadow. They utilize "Bounce" animations on hover and "Depress" animations on click. Text inside buttons is always Uppercase Nunito Bold for maximum impact.

### Cards
Cards are treated as "game tiles." They feature a 2px border and a subtle background tint of the primary color. Information is layered with heavy padding to ensure that content within the card has room to breathe.

### Chips & Tags
Chips are used for category filtering (e.g., "Old Testament," "Hard Mode"). They are pill-shaped with high-contrast fills. When selected, they should scale up slightly (1.05x) to indicate an active state.

### Input Fields
Fields are oversized with thick 2px borders. The focus state replaces the border color with Deep Violet and adds a subtle 4px Gold Amber glow, ensuring the user always knows where their focus is.

### Progress Bars
Progress bars are thick (12px minimum) and use a "candy-stripe" animation during active loading or timed questions, heightening the energetic game-like atmosphere.