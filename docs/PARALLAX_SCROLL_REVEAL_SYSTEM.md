# Parallax Scroll Reveal System

This document captures the reusable animation system pattern adopted from the `pets-healthcare-ui` project and adapted for this React + Framer Motion codebase.

## Goals

- Make section content reveal in a soft, repeatable way on viewport entry.
- Reveal elements one-by-one (badges, lines, cards, pills, list rows).
- Keep motion smooth and readable (no jumpy transforms).
- Support "appear + disappear" by re-triggering when content leaves and re-enters the viewport.
- Layer subtle parallax in hero content without affecting layout stability.

## Core Building Blocks

### 1) `ScrollReveal` baseline

`frontend/src/components/ui/scroll-reveal.tsx`

- Hidden state: `opacity: 0`, slight translate offset (`28px`), slight scale (`0.985`).
- Visible state: `opacity: 1`, `x/y: 0`, `scale: 1`.
- Easing: cubic-bezier style `[0.22, 1, 0.36, 1]`.
- Default behavior:
  - `once = false` (reveal/disappear repeatedly on scroll).
  - `margin = "0px 0px -8% 0px"` (similar to IO root margin behavior from pets project).
  - `duration = 0.65`.

### 2) Per-item staggering

For repeated UI (cards, badges, bullets), use one of:

- Parent map delay strategy:
  - `delay={index * 0.08}` or `index * 0.1`
- Child line strategy:
  - title first, then description with a tiny additional delay.

This creates the one-by-one "stair" reveal effect.

### 3) Line-by-line text reveal

For hero and section titles:

- Split copy into line `span`s.
- Animate each span separately with slightly increasing delays.

This reproduces the "magazine staircase" style seen in the source design.

### 4) Hero parallax layer

Apply a subtle transform tied to section scroll progress:

- Use `useScroll({ target: sectionRef, offset: ["start start", "end start"] })`
- Map progress to:
  - `y: [0, 54]`
  - `opacity: [1, 0.9]`

Parallax remains decorative and does not break section flow.

## Recommended Motion Tokens

- **Item delay step:** `0.06 - 0.12`
- **Section card delay step:** `0.08 - 0.12`
- **Duration:** `0.4 - 0.65`
- **Ease:** `[0.22, 1, 0.36, 1]`
- **Viewport amount:** `0.55 - 0.7` for small items, lower for larger blocks

## Implementation Checklist (Per Section)

1. Header:
   - Reveal badge/tag.
   - Reveal heading.
   - Reveal subtitle.
2. Grid/list content:
   - Reveal each item with incremental delay.
   - Inside each item, reveal title before description.
3. Optional micro-motion:
   - Floating oscillation for badges/stats.
4. Repeatability:
   - Keep viewport `once: false` unless a one-time reveal is explicitly desired.

## Accessibility and Stability Notes

- Keep transform ranges subtle to avoid readability issues.
- Avoid nesting invalid block elements in headings/paragraphs.
- Use reduced motion support in reusable components where possible.
- Prefer opacity + translate + tiny scale; avoid large rotations for text blocks.
