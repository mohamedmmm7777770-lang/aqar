# Landmark-Based Approximate Location Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically infer approximate geographic coordinates and calculate nearby facilities for properties without explicit GPS coordinates, based on landmarks mentioned in title, location, or description, with transparent buyer badges and seller feedback.

**Architecture:** A robust Arabic text normalizer and fuzzy landmark matcher (`landmarkMatcher.ts`) matches text against curated Kafr El-Batikh locations and aliases (e.g., "الكباس", "مسجد راشد", "الثلاثيني"). `Listings.tsx` uses this matcher as a fallback when GPS coordinates are missing, displaying an explicit "موقع تقريبي" badge and calculating nearby facilities from that landmark. `SellerDashboard.tsx` assists sellers by indicating detected landmarks in real time.

**Tech Stack:** TypeScript, React 19, Lucide React, Node.js assert (testing), Tailwind CSS.

**Spec:** `f:\aqar\docs\superpowers\specs\2026-11-19-landmark-approximate-location-design.md`

## Global Constraints

- GPS coordinates captured directly via browser geolocation must ALWAYS take precedence over text-inferred landmarks.
- Never display approximate coordinates as exact GPS: always include the landmark name and "موقع تقريبي".
- If no GPS and no landmark are found, do not fabricate coordinates; show a clear "لم يتم تحديد موقع" state.
- Pure client-side / local computation without third-party external paid geocoding APIs.

## Review Focus

1. Text with punctuation or mixed Arabic letters (e.g. "أ/إ/آ", "ة/ه", "ى/ي", diacritics) - normalizer must match correctly.
2. Short overlapping words (e.g. "مدرسة" vs "مدرسة كفر البطيخ الإعدادية بنات") - must match the longest/most specific landmark first to avoid false positives.
3. Multiple landmarks mentioned in one description - must select the landmark mentioned with highest confidence / specificity (e.g. in title or location first, then description).
4. Text mentioning no landmarks at all (e.g. "منزل 3 أدوار متشطب للبيع") - must return `null` and not generate fake coordinates.
5. Preserving existing GPS properties without alteration.

---

### Task 1: Landmark Matcher & Normalizer Engine (`src/utils/landmarkMatcher.ts`)

**Files:**
- Create: `src/utils/landmarkMatcher.ts`
- Test: `tests/landmarkMatcher.test.cjs`

**Interfaces:**
- Produces:
  ```typescript
  export interface LandmarkMatch {
    name: string;
    coordinates: { lat: number; lng: number };
    confidence: "high" | "medium";
    matchedText: string;
  }
  export function normalizeArabicText(text: string): string;
  export function extractLandmark(text: string): LandmarkMatch | null;
  ```

- [ ] **Step 1: Write the test file `tests/landmarkMatcher.test.cjs`**
  Cover:
  - Match "عند الكباس" -> lat ~31.4011, lng ~31.7343
  - Match "بجوار مسجد راشد كفر البطيخ" -> lat ~31.401797, lng ~31.733679
  - Match "شارع المحطة الجديدة" -> lat ~31.401131, lng ~31.732420
  - Match "شارع الثلاثيني" -> lat ~31.4007, lng ~31.7329
  - Return null for "شقة 120م تشطيب سوبر لوكس للبيع بدون وسيط"

- [ ] **Step 2: Run test to verify it fails**
  Run: `node tests/landmarkMatcher.test.cjs`
  Expected: FAIL with module not found or export missing.

- [ ] **Step 3: Implement `src/utils/landmarkMatcher.ts`**
  - Implement `normalizeArabicText`: removes tashkeel, standardizes alef variants (`أ`, `إ`, `آ` -> `ا`), taa marbuta (`ة` -> `ه`), yaa (`ى` -> `ي`), strips excess whitespace.
  - Build curated landmark dictionary combining `PREDEFINED_LOCATIONS` from `src/data/facilities.ts` plus popular unlisted area names (e.g. "الكباس", "الثلاثيني", "القفاصين", "السنانية", "طريق الميناء").
  - Implement `extractLandmark(text: string)`: sorts landmarks by key length descending, runs normalized search, returns highest confidence match.

- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/landmarkMatcher.test.cjs`
  Expected: All assertions pass.

---

### Task 2: Integrate Landmark Fallback & Approximate Badges in `Listings.tsx`

**Files:**
- Modify: `src/components/Listings.tsx`

**Interfaces:**
- Consumes: `extractLandmark` from `../utils/landmarkMatcher`

- [ ] **Step 1: Update location state resolution in `Listings.tsx`**
  - Import `extractLandmark` from `../utils/landmarkMatcher`.
  - In `selectedProperty` modal, determine effective coordinates and location source:
    ```typescript
    // Source: 'gps' | 'landmark' | 'none'
    ```
  - If `selectedProperty.coordinates` exists with non-zero lat/lng -> source is `'gps'`.
  - Else run `extractLandmark([selectedProperty.title, selectedProperty.location, selectedProperty.description].join(" "))`.
    If found -> source is `'landmark'` with `matchedLandmark`.
    Else -> source is `'none'`.

- [ ] **Step 2: Update modal header & quick specs**
  - If source is `'gps'`: keep current GPS badge.
  - If source is `'landmark'`: display amber badge:
    `📍 موقع تقريبي (استناداً إلى: {matchedLandmark.name})`
  - If source is `'none'`: display gray badge:
    `📍 الموقع غير محدد بدقة`.

- [ ] **Step 3: Update `nearbyFacilities` calculation and neighborhood indicator**
  - If effective coordinates exist (GPS or Landmark): calculate distances and times.
  - If source is `'landmark'`: show an alert card above facilities:
    `ℹ️ تنبيه: يتم حساب المسافات تقريبياً استناداً إلى معلم ({matchedLandmark.name}) لعدم توفر إحداثيات GPS مباشرة للعقار.`
  - If source is `'none'`: show an informative empty card inviting direct contact or physical inspection.

- [ ] **Step 4: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.

---

### Task 3: Interactive Landmark Detection in `SellerDashboard.tsx`

**Files:**
- Modify: `src/pages/SellerDashboard.tsx`

**Interfaces:**
- Consumes: `extractLandmark` from `../utils/landmarkMatcher`

- [ ] **Step 1: Add live landmark preview state in `SellerDashboard.tsx`**
  - Import `extractLandmark` from `../utils/landmarkMatcher`.
  - When seller edits `title`, `location`, or `description` and `newPropertyLocation` is null, calculate `detectedLandmark = extractLandmark(...)`.
  - Under the GPS button, if `locationStatus !== 'success'` and `detectedLandmark`:
    Show reassuring banner:
    `✨ تم رصد معلم في الوصف: ({detectedLandmark.name}) - سيتم استخدامه كموقع تقريبي ما لم تحدد GPS.`

- [ ] **Step 2: Include detected landmark coordinates on submit if GPS not set**
  - In `handleAddProperty`, if `newPropertyLocation` is null but `detectedLandmark` exists:
    Set `latitude: detectedLandmark.coordinates.lat`, `longitude: detectedLandmark.coordinates.lng`.
  - This guarantees that saved properties in the database automatically carry the approximate coordinates.

- [ ] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.

---

### Task 4: End-to-End Verification

- [ ] **Step 1: Run unit tests**
  Run: `node tests/landmarkMatcher.test.cjs`
  Expected: All tests pass.

- [ ] **Step 2: Run build / typecheck**
  Run: `npx tsc --noEmit`
  Expected: exit code 0.

- [ ] **Step 3: Verification with test cases**
  - Test property #1 "منزل 3 أدوار – داخلي عند الكباس": verify it matches "الكباس" and lists nearby places with "موقع تقريبي".
  - Test adding a property in SellerDashboard with description "بجوار مدرسة كفر البطيخ الإعدادية بنات": verify live banner appears.
