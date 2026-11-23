import assert from "node:assert";
import {
  calculatePricePerMeter,
  formatPricePerMeter,
  extractExtendedHighlights
} from "../src/utils/propertyHighlights.ts";

console.log("Running propertyHighlights unit tests...");

// Test 1: calculatePricePerMeter
assert.strictEqual(
  calculatePricePerMeter(1900000, 100),
  19000,
  "Should calculate 1,900,000 / 100 = 19,000"
);

assert.strictEqual(
  calculatePricePerMeter(5600000, 120),
  46667,
  "Should calculate 5,600,000 / 120 rounded to 46,667"
);

assert.strictEqual(
  calculatePricePerMeter(0, 100),
  null,
  "Should return null if price is 0"
);

assert.strictEqual(
  calculatePricePerMeter(1000000, 0),
  null,
  "Should return null if area is 0"
);

assert.strictEqual(
  calculatePricePerMeter(undefined, 100),
  null,
  "Should return null if price is undefined"
);

// Test 2: formatPricePerMeter
assert.strictEqual(
  formatPricePerMeter(19000),
  `${(19000).toLocaleString("ar-EG")} ج.م / م²`,
  "Should format number with Egyptian pound and per m² suffix"
);

assert.strictEqual(
  formatPricePerMeter(null),
  null,
  "Should return null if pricePerMeter is null"
);

// Test 3: extractExtendedHighlights
const sampleProp1 = {
  title: "منزل 3 أدوار – داخلي عند الكباس",
  description: "3 أدوار، حوالي 100 م صافي، متشطب وجاهز للسكن فورًا، قطعة أرض 70 م تابعة للمنزل ولها باب خاص. بشارع سد في الجهة المقابلة عند الكباس. موقع داخلي وليس على الطريق.",
  price: 1900000,
  area: 100,
  type: "منزل"
};

const highlights1 = extractExtendedHighlights(sampleProp1);
assert.strictEqual(highlights1.floors, "3 أدوار");
assert.strictEqual(highlights1.finishing, "متشطب بالكامل");
assert.strictEqual(highlights1.pricePerMeter, 19000);
assert.ok(highlights1.tags.includes("أرض ملحقة"), "Should detect attached land tag");
assert.ok(highlights1.tags.includes("جاهز للسكن"), "Should detect ready to move in tag");
assert.ok(highlights1.snippet.length > 0, "Should generate a valid snippet");

// Test 4: Property with commercial/land tags
const sampleProp2 = {
  title: "قطعة أرض كاردون مباني مرخصة على الطريق الرئيسي",
  description: "أرض 200م مسجلة شهر عقاري وبها رخصة مباني وتطل على الأسفلت مباشرة وبها عداد مياه وغاز طبيعي.",
  price: 2000000,
  area: 200,
  type: "أراضي كاردون مباني"
};

const highlights2 = extractExtendedHighlights(sampleProp2);
assert.strictEqual(highlights2.pricePerMeter, 10000);
assert.ok(highlights2.tags.includes("مرخص رسمي"));
assert.ok(highlights2.tags.includes("على الرئيسي"));
assert.ok(highlights2.tags.includes("غاز طبيعي"));
assert.ok(highlights2.tags.includes("كاردون مباني"));

console.log("✅ All propertyHighlights tests passed!");
