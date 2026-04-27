# Design System: Editorial Heritage & Precision

## 1. Overview & Creative North Star: "The Modern Weaver"
This design system moves away from the generic "SaaS template" by embracing a philosophy we call **The Modern Weaver**. Much like the intricate, intentional craft of Kente, our UI is built on a foundation of structural rhythm, rhythmic spacing, and a high-contrast editorial hierarchy.

We are not just building an order management tool; we are building a digital landscape of Ghanaian excellence. The "Modern Weaver" breaks the grid through **intentional asymmetry**—offsetting imagery and utilizing white space as a primary design element. By treating the canvas like a high-end gallery space rather than a technical dashboard, we establish immediate professional authority and cultural resonance.

## 2. Colors: Tonal Depth & The Ghanaian Palette
The color strategy uses the Ghanaian flag colors as strategic "punctuation marks" rather than dominant fills. The foundation is a sophisticated, "warm" minimalism.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** To define boundaries, utilize background color shifts. For example, a section using `surface_container_low` (#f6f3f2) should sit directly against a `surface` (#fcf9f8) background. This creates a soft, architectural division that feels premium and modern.

### Surface Hierarchy & Nesting
Treat the UI as physical layers.
*   **Base:** `surface` (#fcf9f8)
*   **Sections:** `surface_container_low` (#f6f3f2) for broad background areas.
*   **Cards/Modules:** `surface_container_lowest` (#ffffff) to provide a "lifted" feel against the low-tier background.
*   **Interactive Elements:** Use `primary` (#00502e) for high-intent actions and `secondary` (#bb0023) for critical alerts.

### The "Glass & Gradient" Rule
To add "soul," use subtle gradients for primary CTAs, transitioning from `primary` (#00502e) to `primary_container` (#006b3f) at a 135-degree angle. For floating navigation or modal overlays, apply **Glassmorphism**: use `surface` at 80% opacity with a `24px` backdrop-blur to allow the rich Ghanaian motifs underneath to bleed through softly.

## 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance modern tech with humanistic warmth.

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Hero" moments. Use `display-lg` with a slightly tighter letter-spacing (-0.02em) to create an authoritative, editorial feel. 
*   **Titles & Body (Manrope):** Chosen for its exceptional legibility and geometric clarity. 
*   **Hierarchy as Identity:** By pairing a massive `display-md` headline in `on_surface` (#1c1b1b) with a small, high-contrast `label-md` in `tertiary` (#745b00) above it (as an eyebrow tag), we create a "Signature Look" that feels custom-designed.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We define depth through light and material logic.

*   **The Layering Principle:** Depth is achieved by "stacking" surface-container tiers. A `surface_container_lowest` card placed on a `surface_container_low` background creates a soft, natural lift without cluttering the UI with shadows.
*   **Ambient Shadows:** If a floating effect is required (e.g., a "New Order" FAB), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(28, 27, 27, 0.06)`. The tint is derived from `on_surface` for a natural look.
*   **The Ghost Border:** If a border is required for accessibility, use the `outline_variant` (#bec9bf) at **15% opacity**. Never use 100% opaque borders.

## 5. Components: Modernist Ghanaian Motifs
Motifs should be used as **SVG masks or low-opacity watermarks** within containers, never as busy backgrounds.

### Buttons
*   **Primary:** A gradient of `primary` to `primary_container` with `lg` (0.5rem) roundedness. No border.
*   **Secondary:** Ghost style. No background, `outline` token at 20% opacity, with `on_surface` text.
*   **Tertiary:** Text-only in `primary`, using `2.5` (0.85rem) padding-x for a generous hit-state.

### Cards & Order Lists
*   **No Dividers:** Forbid the use of horizontal lines. Use `8` (2.75rem) vertical white space to separate list items.
*   **Status Indicators:** Use `tertiary_fixed_dim` (#f1c100) for "Pending" and `primary_fixed_dim` (#81d9a2) for "Completed." These soft-fills are more sophisticated than high-saturation badges.

### Input Fields
*   **Style:** Minimalist. Only a bottom border using `outline_variant` at 40% opacity. Upon focus, the border transitions to `primary` (#00502e) and increases to 2px.
*   **Patterns:** Incorporate a subtle Adinkra symbol (like *Nyame Nti*) at 5% opacity in the top-right corner of large form containers to ground the digital experience in Ghanaian heritage.

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. Place a hero image slightly off-center to create visual tension and interest.
*   **Do** use the `24` (8.5rem) spacing token for major section transitions to let the "White" primary color breathe.
*   **Do** use "Adinkra Accents." A single, high-quality vector motif used as a decorative corner element is better than a repeating pattern.

### Don't
*   **Don't** use black (#000000) for text. Use `on_surface` (#1c1b1b) to maintain a premium, softer contrast.
*   **Don't** use standard 1px dividers. If you feel the need for a line, try using a 20px vertical spacing jump or a subtle background color shift instead.
*   **Don't** use the accent colors (Red/Yellow/Green) at 100% saturation for large backgrounds. They are "jewelry"—use them for icons, accents, and status cues only.