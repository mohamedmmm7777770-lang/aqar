# Property Card Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the real estate listing cards in `src/components/Listings.tsx` by displaying smart description previews, calculated price per m², and rich property tags, transforming empty whitespace into high-value visitor insights.

**Architecture:** Create an isolated utility `src/utils/propertyHighlights.ts` for price-per-meter calculation and property feature extraction, covered by unit tests in `tests/propertyHighlights.test.ts`. Integrate these utilities into `src/components/Listings.tsx` to render a clean, balanced card layout.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS 4, Node assert / TSX test runner.

**Spec:** `docs/superpowers/specs/2026-11-20-property-card-enrichment-design.md`

## Global Constraints
- Do not break existing modal detail view or comparison behavior.
- Ensure all calculations handle 0 or missing values gracefully without NaN or division by zero.
- Keep card heights responsive and visually consistent on mobile and desktop.

## Review Focus
- Division by zero when area is 0 or negative: must return null or safe fallback.
- Missing or empty description: must not render an empty box.
- Long descriptions: must use `line-clamp-2` and not overflow card boundaries.
- Arabic number and currency formatting: must use proper Arabic locale formatting (`ج.م`).
- Comparison button layout and functionality must remain intact.

---

### Task 1: Create `src/utils/propertyHighlights.ts` and Unit Tests

**Files:**
- Create: `src/utils/propertyHighlights.ts`
- Create: `tests/propertyHighlights.test.ts`

**Interfaces:**
- Produces:
  - `calculatePricePerMeter(price?: number, area?: number): number | null`
  - `formatPricePerMeter(pricePerMeter: number | null): string | null`
  - `extractExtendedHighlights(prop: { title?: string; description?: string; area?: number; price?: number; type?: string; floors?: string }): ExtendedHighlights`

- [ ] **Step 1: Write the failing tests in `tests/propertyHighlights.test.ts`**
- [ ] **Step 2: Run test to verify it fails (`npx tsx tests/propertyHighlights.test.ts`)**
- [ ] **Step 3: Implement `src/utils/propertyHighlights.ts`**
- [ ] **Step 4: Run test to verify it passes (`npx tsx tests/propertyHighlights.test.ts`)**
- [ ] **Step 5: Verify TypeScript compilation (`npm run lint`)**

---

### Task 2: Integrate Enriched Information into `src/components/Listings.tsx`

**Files:**
- Modify: `src/components/Listings.tsx`

**Interfaces:**
- Consumes:
  - `calculatePricePerMeter`, `extractExtendedHighlights` from `../utils/propertyHighlights.ts`

- [ ] **Step 1: Update card body to display:**
  1. Description snippet preview (`line-clamp-2`) with subtle styling.
  2. Quick stat pill for Price per m² (`سعر المتر`) when available.
  3. Additional contextual tags (e.g., أرض ملحقة, جاهز للسكن, على الرئيسي, ناصية).
  4. Balanced bottom specs row displaying property code alongside either bedroom/bathroom count or price-per-meter / delivery status when specs are 0.
- [ ] **Step 2: Verify TypeScript compilation (`npm run lint`)**
- [ ] **Step 3: Build check (`npx vite build`) to confirm production asset generation**
