import { PREDEFINED_LOCATIONS } from "../data/facilities.ts";

export interface LandmarkMatch {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  confidence: "high" | "medium";
  matchedText: string;
}

// تطبيع النصوص العربية لإزالة الفروق الإملائية والتشكيل
export function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    // إزالة التشكيل والتنوين
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // توحيد همزات الألف
    .replace(/[أإآٱ]/g, "ا")
    // توحيد التاء المربوطة
    .replace(/ة/g, "ه")
    // توحيد الألف المقصورة والياء
    .replace(/ى/g, "ي")
    // استبدال علامات الترقيم والرموز بمسافات
    .replace(/[-_–—/\\,،:;.!?؟()[\]{}'"`~*#]/g, " ")
    // دمج المسافات الزائدة
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

interface LandmarkDefinition {
  name: string;
  aliases: string[];
  coordinates: { lat: number; lng: number };
}

// قاموس المعالم والمناطق الحيوية في كفر البطيخ
const POPULAR_AREAS: LandmarkDefinition[] = [
  {
    name: "الكباس",
    aliases: ["الكباس", "عند الكباس", "كباس"],
    coordinates: { lat: 31.40105, lng: 31.73435 },
  },
  {
    name: "شارع الثلاثيني",
    aliases: ["شارع الثلاثيني", "الثلاثيني", "في الثلاثيني", "من شارع الثلاثيني"],
    coordinates: { lat: 31.4007, lng: 31.7329 },
  },
  {
    name: "شارع المحطة الجديدة",
    aliases: ["شارع المحطة الجديدة", "المحطة الجديدة", "شارع المحطة"],
    coordinates: { lat: 31.401131, lng: 31.732420 },
  },
  {
    name: "شارع الشباروة",
    aliases: ["شارع الشباروة", "الشباروة", "الشباروه", "شارع الشباروه"],
    coordinates: { lat: 31.399852, lng: 31.737678 },
  },
  {
    name: "المحطة القديمة",
    aliases: ["المحطة القديمة", "المحطه القديمه", "مسجد المحطة القديمة"],
    coordinates: { lat: 31.409513, lng: 31.743396 },
  },
  {
    name: "طريق الميناء",
    aliases: ["طريق الميناء", "طريق المينا", "على طريق الميناء"],
    coordinates: { lat: 31.4146, lng: 31.7402 },
  },
  {
    name: "القفاصين",
    aliases: ["القفاصين", "منطقة القفاصين", "طريق القفاصين"],
    coordinates: { lat: 31.39915, lng: 31.73205 },
  },
  {
    name: "شارع فرن أبو عبد الله",
    aliases: ["فرن ابو عبد الله", "فرن ابو عبدالله", "شارع فرن ابو عبد الله", "شارع فرن ابو عبدالله"],
    coordinates: { lat: 31.39495, lng: 31.72765 },
  },
  {
    name: "أرض راشد",
    aliases: ["ارض راشد", "شارع مصنع راشد"],
    coordinates: { lat: 31.40215, lng: 31.73305 },
  },
  {
    name: "ميدان الجمعية",
    aliases: ["ميدان الجمعية", "ميدان الجمعيه", "قريب من ميدان الجمعية"],
    coordinates: { lat: 31.40665, lng: 31.73455 },
  },
  {
    name: "مسجد السالوس",
    aliases: ["مسجد السالوس", "صيدلية السالوس", "دكتور احمد السالوس", "السالوس"],
    coordinates: { lat: 31.402194, lng: 31.733087 },
  },
  {
    name: "السنانية",
    aliases: ["السنانية", "السنانيه", "معرض حشيش"],
    coordinates: { lat: 31.41935, lng: 31.78645 },
  },
  {
    name: "الخارج على الخارج",
    aliases: ["الخارج على الخارج", "منطقة الخارج على الخارج", "الخارج"],
    coordinates: { lat: 31.4185, lng: 31.7280 },
  },
];

// بناء قائمة المعالم الكاملة مدمجة مع PREDEFINED_LOCATIONS
function buildAllLandmarks(): LandmarkDefinition[] {
  const combined: LandmarkDefinition[] = [...POPULAR_AREAS];

  for (const fac of PREDEFINED_LOCATIONS) {
    const existing = combined.find(c => c.name === fac.nameAr);
    if (!existing) {
      combined.push({
        name: fac.nameAr,
        aliases: [fac.nameAr],
        coordinates: {
          lat: fac.coordinates.latitude,
          lng: fac.coordinates.longitude,
        },
      });
    }
  }

  return combined;
}

const ALL_LANDMARKS = buildAllLandmarks();

export function extractLandmark(text: string): LandmarkMatch | null {
  if (!text || typeof text !== "string") return null;

  const normalizedInput = normalizeArabicText(text);
  if (!normalizedInput || normalizedInput.length < 3) return null;

  // إعداد الكلمات المفتاحية للمطابقة، مرتبة بالأطول أولاً لتفادي التطابقات الجزئية الخاطئة
  const candidates: { definition: LandmarkDefinition; alias: string; normalizedAlias: string }[] = [];

  for (const item of ALL_LANDMARKS) {
    for (const alias of item.aliases) {
      const normAlias = normalizeArabicText(alias);
      if (normAlias.length >= 3) {
        candidates.push({
          definition: item,
          alias,
          normalizedAlias: normAlias,
        });
      }
    }
  }

  // فرز تنازلي حسب طول الاسم
  candidates.sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length);

  for (const cand of candidates) {
    // مطابقة تامة أو كلمة كاملة داخل النص
    const escaped = cand.normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, "i");

    if (regex.test(normalizedInput)) {
      return {
        name: cand.definition.name,
        coordinates: cand.definition.coordinates,
        confidence: "high",
        matchedText: cand.alias,
      };
    }
  }

  // محاولة ثانية: البحث الجزئي إذا كانت العبارة مميزة (أكثر من 5 أحرف)
  for (const cand of candidates) {
    if (cand.normalizedAlias.length >= 6 && normalizedInput.includes(cand.normalizedAlias)) {
      return {
        name: cand.definition.name,
        coordinates: cand.definition.coordinates,
        confidence: "medium",
        matchedText: cand.alias,
      };
    }
  }

  return null;
}
