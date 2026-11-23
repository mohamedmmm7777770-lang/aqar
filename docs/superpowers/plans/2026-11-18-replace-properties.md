# Replace Properties with عقارات_بدون_تكرار.md Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all existing real estate data in `F:\aqar` with the 213 deduplicated properties parsed from `عقارات_بدون_تكرار.md`, update property definitions and types, fix Vite watch crash, and restart the server.

**Architecture:** A parser script reads and structures `عقارات_بدون_تكرار.md` into standard property objects (with coordinates, categories, pricing, area, and images). The result is written directly to `src/data/properties.ts`. Vite configuration is updated with file watcher ignore patterns for markdown/log files to prevent Windows `EBUSY` crashes. The application server is restarted and verified.

**Tech Stack:** TypeScript, React, Vite, Express, Node.js

**Spec:** User request: "عقارات_بدون_تكرار.md F:\aqar ضع هذه العقارات واحذف الموجود كله"

## Global Constraints
- Target directory: `F:\aqar`
- Input data source: `F:\aqar\عقارات_بدون_تكرار.md`
- Target data destination: `F:\aqar\src\data\properties.ts`
- Contact phone number: `01095801925` (as specified in `عقارات_بدون_تكرار.md`)
- Ensure backward compatibility with `Listings.tsx` (all fields: `id`, `title`, `price`, `priceValue`, `type`, `status`, `statusType`, `location`, `description`, `area`, `bedrooms`, `bathrooms`, `coordinates`, `image`, `images`, `owner`)

## Review Focus
1. Price extraction handles multiple formats (flat amount `1,900,000 ج`, per meter `سعر المتر 5,500 ج`, monthly rent `10,000 ج شهرياً`, approximations `≈ 1,425,600 ج`).
2. Type mapping accurately maps 8 markdown sections to UI filter types ("منزل", "شقة", "فيلا", "عمارة", "أراضي كاردون مباني", "أراضي زراعية", "أراضي بور", "تجاري", "مصانع", "هنجر").
3. Coordinates fall within realistic regional ranges (Kafr El-Batikh, Damietta, New Damietta, Ras El-Bar) with slight offsets so all markers display on map.
4. Vite file watcher does not crash with EBUSY on `.md` files.
5. Dev server starts and returns HTTP 200 on `http://localhost:3000`.

---

### Task 1: Fix Vite Watcher EBUSY Error

**Files:**
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: Vite config ignoring `**/*.md`, `**/*.log`, and `dev.db` in file watching.

- [ ] **Step 1: Update `vite.config.ts` to ignore watching non-code files**
  Add `ignored: ['**/*.md', '**/*.log', '**/prisma/dev.db*']` to `server.watch`.

- [ ] **Step 2: Verify `vite.config.ts` syntax**
  Check that configuration is valid TypeScript.

---

### Task 2: Build Parser Script & Convert `عقارات_بدون_تكرار.md` to `src/data/properties.ts`

**Files:**
- Create: `scripts/parse-new-properties.ts`
- Overwrite: `src/data/properties.ts`

**Interfaces:**
- Consumes: `عقارات_بدون_تكرار.md`
- Produces: `export const properties = [...]` in `src/data/properties.ts` with 213 items.

- [ ] **Step 1: Write `scripts/parse-new-properties.ts`**
  Implement regex/parsing logic to parse all 8 sections and 213 properties:
  - Extract `title`, `price`, `priceValue`, `area`, `bedrooms`, `bathrooms`, `description`, `location`, `type`, `statusType`.
  - Assign category-appropriate realistic coordinates (Kafr El-Batikh 31.40x/31.73x, Damietta 31.41x/31.81x, New Damietta 31.43x/31.67x, Ras El-Bar 31.51x/31.82x).
  - Assign curated Unsplash real estate images matching property type.
  - Set owner to `{ name: "المعلن", phone: "01095801925" }`.

- [ ] **Step 2: Execute parser script**
  Run `npx tsx scripts/parse-new-properties.ts` to generate `src/data/properties.ts`.

- [ ] **Step 3: Verify output count and schema**
  Verify that `src/data/properties.ts` exports exactly 213 properties and has valid syntax.

---

### Task 3: Verify and Adjust `Listings.tsx`

**Files:**
- Modify: `src/components/Listings.tsx`

**Interfaces:**
- Consumes: `src/data/properties.ts`
- Produces: Correct rendering, filtering, sorting, and dynamic WhatsApp contact link (`01095801925`).

- [ ] **Step 1: Check WhatsApp link in `Listings.tsx`**
  Ensure the contact button links to `selectedProperty.owner?.phone || "01095801925"`.

- [ ] **Step 2: Ensure type filter options in `Listings.tsx` cover the new categories**
  Confirm options: "منزل", "فيلا", "شقة", "عمارة", "أراضي كاردون مباني", "أراضي ليست كاردون", "أراضي زراعية", "أراضي بور", "تجاري", "مصانع", "هنجر".

---

### Task 4: Start Dev Server & Verify Everything Works

**Files:**
- Run: `npm run dev`

**Interfaces:**
- Produces: Working server at `http://localhost:3000`.

- [ ] **Step 1: Start background server with `npm run dev`**
- [ ] **Step 2: Verify `http://localhost:3000` responds with HTTP 200**
- [ ] **Step 3: Verify properties API or data loading**
