# Vibrant & Balanced Bento Listings Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the listings header and filter container in `src/components/Listings.tsx` into a modern, vibrant, balanced, and visually engaging Bento-style filter bar with quick category pills and color-coded filters.

**Architecture:** Integrate a quick category pill bar connected to `filters.type`, elevate the header with gradient typography and live animated counter badge, and style the filter card with frosted subtle emerald gradient, micro-icons, and color badges.

**Tech Stack:** React, Tailwind CSS, Lucide Icons, Framer Motion.

**Spec:** `docs/superpowers/specs/2026-11-19-vibrant-balanced-listings-filter-design.md`

## Global Constraints
- Keep the component compact and positioned directly above listings (no full-screen hero banner).
- Fully responsive on mobile, tablet, and desktop screens.
- Zero breaking changes to filtering logic, state, search query, or GPS/landmark proximity calculations.

## Review Focus
1. Category pill click updates `filters.type` correctly and highlights active pill.
2. Clicking "الكل" resets type filter.
3. Search input clear button (`X`) properly resets `filters.searchQuery`.
4. Favorites toggle remains fully functional with vibrant visual indicator.
5. TypeScript compilation passes with zero errors (`tsc --noEmit`).

---

### Task 1: Category Pills Bar & Header Modernization

**Files:**
- Modify: `src/components/Listings.tsx:365-430`

- [ ] **Step 1: Update Header Typography & Pulse Counter**
Add gradient text to "أحدث العقارات المتاحة" and animated green pulse dot inside the properties counter badge.

- [ ] **Step 2: Add Category Pills Row**
Add interactive quick category pills above the filter box:
- `الكل`
- `منازل وبيوت` (matches 'منزل' or 'فيلا')
- `شقق سكنية` (matches 'شقة')
- `أراضي وبناء` (matches 'أرض')
- `تجاري ومحلات` (matches 'تجاري')

- [ ] **Step 3: Verify TypeScript and rendering**
Run: `npx tsc --noEmit`
Expected: SUCCESS (0 errors).

---

### Task 2: Bento Filter Container & Color-Coded Micro-Badges

**Files:**
- Modify: `src/components/Listings.tsx:430-525`

- [ ] **Step 1: Redesign Filter Card with Layered Gradient & Glow**
Style container with `bg-gradient-to-b from-white via-white to-emerald-50/25 border border-emerald-100 shadow-md shadow-emerald-950/5 rounded-3xl p-4 sm:p-5`.

- [ ] **Step 2: Add Color-Coded Badges & Icons to Filter Selects**
- Offer Type: Indigo/Blue badge with `Tag` icon.
- Property Type: Emerald badge with `Building2` icon.
- Price Range: Purple badge with `Coins` icon.
- Sort By: Amber badge with `ArrowUpDown` icon.
- Favorites: Rose toggle button with animated `Heart` icon.

- [ ] **Step 3: Verification & Test Suite**
Run: `node --experimental-strip-types tests/landmarkMatcher.test.ts`
Run: `npx tsc --noEmit`
Expected: All tests pass, 0 TS errors.
