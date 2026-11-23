# UI Modal & Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the property details modal, listing cards, and global typography into an ultra-modern, spacious, and luxury real-estate interface with proper Cairo font, top media gallery banner, categorized data grids, and clean facility pill chips.

**Architecture:** 
- Typography layer: Direct Cairo font inclusion in `index.html` and root CSS with explicit body rules and font-smoothing.
- Details Modal: Replace cramped 50/50 vertical stretch layout with a Top Media Hero Banner (`h-80`) and a spacious full-width (`max-w-5xl`) structured layout containing categorized specs, rich icons, clean facility cards with `whitespace-nowrap` transport pills, map, and sticky action/contact section.
- Listing Cards: Clean up cards with balanced image containers, floating badge hierarchy, and refined typography.
- Comparison Modal: Match design language with consistent borders, badges, and headers.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React icons, Motion (Framer Motion).

## Global Constraints
- Must preserve all existing functionality (reviews, favorites, comparison, GPS location, distance calculation, WhatsApp/call links).
- Must maintain RTL (`dir="rtl"`) consistency without awkward line wraps or broken badge numbers.
- Must compile cleanly with zero TypeScript errors (`tsc --noEmit`).

---

### Task 1: Typography and Global Styling Foundation
**Files:**
- Modify: `index.html:20-26`
- Modify: `src/index.css:1-25`

- [ ] Add Google Fonts preconnect and direct `<link>` for Cairo font (weights 300, 400, 500, 600, 700, 800, 900) to `index.html`.
- [ ] In `src/index.css`, enforce `body, html` font-family: `'Cairo', system-ui, sans-serif`, `direction: rtl`, `text-rendering: optimizeLegibility`.
- [ ] Add utility styling for transport pill chips and `tabular-nums` for clean Arabic number alignment.
- [ ] Verify build with `npx tsc --noEmit`.

### Task 2: Redesign Property Details Modal
**Files:**
- Modify: `src/components/Listings.tsx:743-1065`

- [ ] Replace 2-column full-height split (`grid-cols-2`) with a Top Media Hero Banner (`h-72 sm:h-80 md:h-96`) featuring:
  - Responsive image with `object-cover` and subtle gradient overlay.
  - Floating top-left/right frosted glass close button and status/type badges.
  - Interactive bottom thumbnail row with smooth selection when multiple images exist.
- [ ] Expand modal container to `max-w-5xl` with rounded-3xl and clean shadow.
- [ ] Restructure Modal Content Body into categorized sections:
  - Header: Property Title, prominent Price badge (`ج.م`), and location with pin icon.
  - 4-Card Specs Grid: Bedrooms, Bathrooms, Area, and Coordinates with modern icons and pastel backgrounds.
  - Highlights Badges: Floors, Finishing, and Amenities tags.
  - Description: Styled with relaxed line-height and subtle card background.
  - Facilities Section ("المرافق القريبة"):
    - Full-width accordion cards.
    - Each facility item arranged with name + distance on one side, and 3 fixed pill badges (`whitespace-nowrap`) with Car, Bike, Walk icons and clear numbers (`5 دقيقة`, `1 دقيقة`, إلخ) that never wrap awkwardly.
  - Map Section: Clean rounded frame with direct Google Maps route button.
  - Reviews Section & Add Review Form: Clean star rating picker and comment list.
  - Sticky/Prominent Contact Card: WhatsApp green CTA button, Call button, and Verified Owner badge.
- [ ] Verify TypeScript compilation with `npx tsc --noEmit`.

### Task 3: Polish Property Cards in Grid
**Files:**
- Modify: `src/components/Listings.tsx:415-580`

- [ ] Adjust card image container height, overlay, and aspect ratio.
- [ ] Position status tag, price pill, and favorite button with proper margins and backdrop blur.
- [ ] Align title, location, highlights badges, and specs row (Bedrooms, Bathrooms, Area) cleanly with consistent font weights.
- [ ] Polish "Add to comparison" button state styling.
- [ ] Verify TypeScript compilation.

### Task 4: Polish Comparison Modal and Consistency Check
**Files:**
- Modify: `src/components/Listings.tsx:635-740`

- [ ] Ensure table headers, property thumbnails, badges, and rows align cleanly with Cairo font and crisp borders.
- [ ] Test build and verify that all modals open, close, and render smoothly.
