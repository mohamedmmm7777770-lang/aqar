import assert from "node:assert";
import { normalizeArabicText, extractLandmark } from "../src/utils/landmarkMatcher.ts";

console.log("Running landmarkMatcher unit tests...");

// Test 1: Arabic text normalization
assert.strictEqual(
  normalizeArabicText("  أحمدٌ  إلى  آية، مدرسةٌ  جميلة   "),
  "احمد الي ايه مدرسه جميله",
  "Should normalize alef variants, remove harakat and normalize taa marbuta"
);

// Test 2: Match "عند الكباس"
const match1 = extractLandmark("منزل 3 أدوار – داخلي عند الكباس بشارع سد");
assert.ok(match1 !== null, "Should match 'الكباس'");
assert.strictEqual(match1?.name, "الكباس", "Matched name should be الكباس");
assert.strictEqual(match1?.confidence, "high");
assert.ok(Math.abs(match1!.coordinates.lat - 31.4011) < 0.001);
assert.ok(Math.abs(match1!.coordinates.lng - 31.7343) < 0.001);

// Test 3: Match "مسجد راشد"
const match2 = extractLandmark("بيت دورين قريب من مسجد راشد كفر البطيخ متشطب");
assert.ok(match2 !== null, "Should match 'مسجد راشد'");
assert.strictEqual(match2?.name, "مسجد راشد كفر البطيخ");
assert.ok(Math.abs(match2!.coordinates.lat - 31.401797) < 0.001);

// Test 4: Match "شارع المحطة الجديدة"
const match3 = extractLandmark("قطعة أرض فضاء في شارع المحطة الجديدة كفر البطيخ");
assert.ok(match3 !== null, "Should match 'شارع المحطة الجديدة'");
assert.ok(match3?.name.includes("شارع المحطة الجديدة"));

// Test 5: Match "شارع الثلاثيني"
const match4 = extractLandmark("منزل 4 أدوار متفرع من شارع الثلاثيني خامس نمرة");
assert.ok(match4 !== null, "Should match 'شارع الثلاثيني'");
assert.ok(match4?.name.includes("الثلاثيني"));

// Test 6: Returns null when no recognizable landmark is present
const matchNull = extractLandmark("منزل 3 أدوار مساحة 100م تشطيب سوبر لوكس للبيع كاش من المالك مباشرة");
assert.strictEqual(matchNull, null, "Should return null when no landmark is mentioned");

// Review Focus 1: Mixed Arabic letters and diacritics
const matchDiacritics = extractLandmark("عِندَ الكَبَّاسِ فِي شَارِعٍ هَادِئ");
assert.ok(matchDiacritics !== null);
assert.strictEqual(matchDiacritics?.name, "الكباس");

// Review Focus 2: Short overlapping words vs specific landmark names
const matchSpecificSchool = extractLandmark("بجوار مدرسة كفر البطيخ الإعدادية بنات وليس مدرسة عادية");
assert.ok(matchSpecificSchool !== null);
assert.strictEqual(matchSpecificSchool?.name, "مدرسة كفر البطيخ الإعدادية بنات");

// Review Focus 3: Property with multiple phrases - e.g. "القفاصين خلف البنزينة"
const matchQaffasin = extractLandmark("على الطريق السريع القفاصين خلف البنزينة ثاني نمرة");
assert.ok(matchQaffasin !== null);
assert.strictEqual(matchQaffasin?.name, "القفاصين");

// Review Focus 4: Real property #1 title and description
const matchProp1 = extractLandmark("منزل 3 أدوار – داخلي عند الكباس 3 أدوار، حوالي 100 م صافي، متشطب وجاهز للسكن فورًا، قطعة أرض 70 م تابعة للمنزل ولها باب خاص. بشارع سد في الجهة المقابلة عند الكباس. موقع داخلي وليس على الطريق.");
assert.ok(matchProp1 !== null);
assert.strictEqual(matchProp1?.name, "الكباس");
assert.strictEqual(matchProp1?.coordinates.lat, 31.40105);
assert.strictEqual(matchProp1?.coordinates.lng, 31.73435);

// Review Focus 5: Real property #18: "طريق الميناء"
const matchProp18 = extractLandmark("منزل 140 م دورين – أول مطل على طريق الميناء");
assert.ok(matchProp18 !== null);
assert.strictEqual(matchProp18?.name, "طريق الميناء");

// Review Focus 6: Real property #214: "الخارج على الخارج"
const matchProp214 = extractLandmark("أرض زراعية فدانين إلا ربع رمل ليس طين في منطقة الخارج على الخارج");
assert.ok(matchProp214 !== null);
assert.strictEqual(matchProp214?.name, "الخارج على الخارج");
assert.strictEqual(matchProp214?.coordinates.lat, 31.4185);
assert.strictEqual(matchProp214?.coordinates.lng, 31.7280);

console.log("✅ All landmarkMatcher tests passed successfully!");
