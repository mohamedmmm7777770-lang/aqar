# Compact Modern Listings Header & Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the oversized HeroBanner and transform the native listings header and filter box into a compact, modern, and high-trust real estate exploration hub.

**Architecture:** Remove `HeroBanner` from `LandingPage.tsx`, returning the layout to clean, light-themed luxury. Redesign the listings section header in `Listings.tsx` with balanced typography, quick trust badges, and a streamlined, modern filter box.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React.

## Tasks:

- [ ] **Task 1: Remove `HeroBanner` from `LandingPage.tsx`**
  - Remove `HeroBanner` import and element.
  - Set page background to clean `bg-slate-50` with proper top padding (`pt-20 sm:pt-24`) to account for the fixed header.

- [ ] **Task 2: Redesign Listings Header & Filter Box in `src/components/Listings.tsx`**
  - Section header:
    - Trust pill: `💎 عقارات كفر البطيخ ودمياط • عروض حصرية مباشرة من الملاك`.
    - Main title with inline property counter.
    - Balanced 2-column or flex layout with trust indicators on the side.
  - Filter box:
    - Elegant search bar with search icon.
    - 5 cleanly aligned filters (Status, Type, Price, Sort, Favorites) with modern styling.

- [ ] **Task 3: Verification & Type Check**
  - Run `npx tsc --noEmit` -> exit code 0.
  - Run unit tests -> PASS.
