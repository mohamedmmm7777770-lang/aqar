# Modern Luxury Hero & Header Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the top section of the homepage from a stark white void into a cohesive, high-end, modern real estate hero experience featuring a glassmorphic header, an ambient gradient hero with typography and trust badges, and an interactive floating search hub.

**Architecture:** A new responsive component `src/components/HeroBanner.tsx` is introduced and embedded in `LandingPage.tsx` between the header and the listings grid. `Header.tsx` is updated to a modern glassmorphic style that seamlessly blends with the hero. The top header of `Listings.tsx` is polished with a luxury section pill and counter badge.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion (`motion/react`).

**Spec:** `f:\aqar\docs\superpowers\specs\2026-11-19-modern-hero-header-redesign.md`

## Global Constraints

- Preserve all existing routes, navigation links, and auth modals.
- Maintain full responsiveness across mobile (<640px), tablet, and desktop (1080p+).
- Clean, fast rendering without heavy external 3D bundle bloat or blocking assets.
- RTL Arabic first, with elegant typography and spacing.

## Review Focus

1. Mobile responsiveness: floating search bar and buttons must stack neatly on small screens without horizontal scroll.
2. Glassmorphism backdrop-filter performance: header must remain crisp and readable over both hero and page scroll.
3. Smooth scroll and interaction: clicking categories or searching in the hero smoothly scrolls to and filters the listings.
4. Contrast & Accessibility: text over dark gradients must maintain high contrast (WCAG AA).
5. Seamless visual seam: the transition from the dark hero to the light listings grid must feel natural and high-end.

---

### Task 1: Build `src/components/HeroBanner.tsx`

**Files:**
- Create: `src/components/HeroBanner.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface HeroBannerProps {
    onSearch?: (query: string) => void;
    onTypeSelect?: (type: string) => void;
    totalProperties?: number;
  }
  export default function HeroBanner(props: HeroBannerProps): JSX.Element;
  ```

- [ ] **Step 1: Create the Hero component structure with ambient glow & badges**
  - Ambient deep gradient: `from-slate-950 via-slate-900 to-slate-950`.
  - Emerald and cyan radial blur glows (`bg-emerald-500/15` and `bg-cyan-500/10`).
  - Badge: `✨ المنصة العقارية الموثقة في محافظة دمياط • كفر البطيخ`.
  - Headline: "ابحث عن بيتك المثالي أو استثمر بثقة" with gradient text.
  - Subtitle: "عقارات موثقة بأسعار مباشرة من الملاك مع مؤشر خدمات الحي الذكي".

- [ ] **Step 2: Add floating search & quick category pills**
  - Quick Category filter tabs: *الكل • منازل • شقق • أراضي • تجاري*.
  - Search input with clear button and magnifying glass.
  - Action button: "استكشف العروض".
  - On search or click, scrolls down smoothly to `#listings`.

- [ ] **Step 3: Add Trust Indicators strip**
  - 4 high-trust stats:
    1. 🏡 +100 عقار متاح وموثق
    2. 📍 مؤشر دقيق لخدمات ومرافق الحي
    3. 🤝 تفاوض مباشر وبدون عمولات مبالغ فيها
    4. ⚡ استكشاف فوري وتحديث دوري للأسعار

- [ ] **Step 4: Verify component type safety**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.

---

### Task 2: Polish `src/components/Header.tsx` (Glassmorphic Luxury Bar)

**Files:**
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Consumes: Navigation links & routes
- Enhancements:
  - Header background updated to high-end translucent glass: `bg-slate-950/80 backdrop-blur-xl border-b border-white/10`.
  - Logo updated with refined location badge: `عقارات` + `كفر البطيخ ودمياط`.
  - Nav links with elegant active/hover indicator with emerald glow.
  - "حساب جديد" CTA enhanced with gradient and subtle shadow.

- [ ] **Step 1: Update header classes and styling in `Header.tsx`**
- [ ] **Step 2: Verify mobile drawer retains backdrop blur and dark luxury theme**
- [ ] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.

---

### Task 3: Integrate `HeroBanner` & Polish `Listings.tsx` Intro

**Files:**
- Modify: `src/pages/LandingPage.tsx`
- Modify: `src/components/Listings.tsx`

**Interfaces:**
- Consumes: `HeroBanner` in `LandingPage.tsx`
- Connects: Hero category selection & search to Listings filter state via URL hash or prop callbacks.

- [ ] **Step 1: Add `HeroBanner` to `LandingPage.tsx` right above `Listings`**
  - Adjust padding: `pt-0` or clean offset so the Hero flows naturally under the sticky header.
- [ ] **Step 2: Polish `Listings.tsx` section header**
  - Add exclusive badge: `💎 العروض الحصرية`.
  - Smooth top transition curve or subtle gradient overlay between dark Hero and light listings.
- [ ] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.

---

### Task 4: Full Verification

- [ ] **Step 1: Run TypeScript compiler**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.
- [ ] **Step 2: Run unit tests**
  Run: `node --experimental-strip-types tests/landmarkMatcher.test.ts`
  Expected: All tests pass.
- [ ] **Step 3: Verify visual output and layout**
