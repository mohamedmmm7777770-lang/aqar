export interface ExtendedHighlights {
  floors: string | null;
  finishing: string | null;
  tags: string[];
  keyAdvantage: string | null;
  pricePerMeter: number | null;
  formattedPricePerMeter: string | null;
  snippet: string;
}

/**
 * حساب سعر المتر المربع التقديري (السعر ÷ المساحة)
 */
export function calculatePricePerMeter(price?: number, area?: number): number | null {
  if (!price || !area || price <= 0 || area <= 0) {
    return null;
  }
  return Math.round(price / area);
}

/**
 * تنسيق سعر المتر المربع بصيغة عربية جذابة
 */
export function formatPricePerMeter(pricePerMeter: number | null): string | null {
  if (!pricePerMeter || pricePerMeter <= 0) {
    return null;
  }
  return `${pricePerMeter.toLocaleString("ar-EG")} ج.م / م²`;
}

/**
 * استخراج أهم المزايا، المواصفات، والوسوم من عنوان ووصف العقار
 */
export function extractExtendedHighlights(prop: {
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  type?: string;
  floors?: string;
}): ExtendedHighlights {
  const title = prop.title || "";
  const desc = prop.description || "";
  const text = `${title} ${desc}`.toLowerCase();
  const tags: string[] = [];

  // 1. استخراج الأدوار أو الطابق
  const floorMatch = text.match(
    /(الدور\s*(الأول|الثاني|الثالث|الرابع|الخامس|السادس|الأرضي|الأخير)|\d+\s*أدوار|\d+\s*طوابق|دورين|دور أرضي|دور واحد|دورين ونصف|\d+\s*دور|بدروم\s*\+\s*\d+\s*أدوار|أرضي\s*\+\s*\d+\s*أدوار|أرضي\s*\+\s*دورين|\d+\s*شقق)/
  );
  const floors = prop.floors || (floorMatch ? floorMatch[1] : null);

  // 2. حالة التشطيب
  let finishing: string | null = null;
  if (text.includes("سوبر ألترا") || text.includes("سوبر لوكس") || text.includes("ألترا لوكس")) {
    finishing = "سوبر لوكس";
  } else if (
    text.includes("تشطيب ممتاز") ||
    text.includes("تشطيب لوكس") ||
    text.includes("متشطب بالكامل") ||
    text.includes("متشطب")
  ) {
    finishing = "متشطب بالكامل";
  } else if (text.includes("نصف تشطيب")) {
    finishing = "نصف تشطيب";
  } else if (text.includes("طوب أحمر") || text.includes("عضم")) {
    finishing = "طوب أحمر";
  } else if (text.includes("جاهز للسكن") || text.includes("جاهزة للسكن")) {
    finishing = "جاهز للسكن";
  } else if (text.includes("حديث البناء") || text.includes("مباني حديثة")) {
    finishing = "مباني حديثة";
  }

  // 3. المزايا التخطيطية والقانونية والمرافق
  if (text.includes("أرض تابعة") || text.includes("قطعة أرض") || text.includes("أرض ملحقة") || text.includes("حديقة")) {
    tags.push("أرض ملحقة");
  }

  if (text.includes("جاهز للسكن") || text.includes("جاهزة للسكن") || text.includes("تسليم فوري")) {
    tags.push("جاهز للسكن");
  }

  if (text.includes("رخصة") || text.includes("برخصة") || text.includes("مرخصة") || text.includes("ترخيص")) {
    tags.push("مرخص رسمي");
  }

  if (text.includes("نموذج 8")) {
    tags.push("نموذج 8");
  }

  if (text.includes("كاردون مباني") || text.includes("كاردون") || text.includes("كردون")) {
    tags.push("كاردون مباني");
  }

  if (text.includes("عقد أخضر") || text.includes("ملك حر") || text.includes("ملكية حرة") || text.includes("مسجلة") || text.includes("شهر عقاري")) {
    tags.push("ملك حر");
  }

  if (text.includes("ناصية") || text.includes("واجهة وناصية") || text.includes("على ناصيتين")) {
    tags.push("ناصية");
  }

  if (
    text.includes("أول مطل") ||
    text.includes("على الطريق السريع") ||
    text.includes("على الرئيسي") ||
    text.includes("على الأسفلت") ||
    text.includes("شارع رئيسي")
  ) {
    tags.push("على الرئيسي");
  }

  if (text.includes("شارع سد") || text.includes("شارع هادئ")) {
    tags.push("شارع هادئ");
  }

  if (text.includes("باب خاص") || text.includes("مدخل خاص") || text.includes("مدخل مستقل")) {
    tags.push("مدخل خاص");
  }

  if (text.includes("غاز")) {
    tags.push("غاز طبيعي");
  }

  if (text.includes("3 فاز") || text.includes("كهرباء 3")) {
    tags.push("كهرباء 3 فاز");
  }

  // إزالة التكرار من الوسوم
  const uniqueTags = Array.from(new Set(tags));

  // 4. استخراج أهم ميزة رئيسية تبرز فوراً (Key Advantage)
  let keyAdvantage: string | null = null;
  if (uniqueTags.includes("أرض ملحقة")) keyAdvantage = "يحتوي على قطعة أرض ملحقة";
  else if (uniqueTags.includes("على الرئيسي")) keyAdvantage = "مطل على الطريق الرئيسي مباشرة";
  else if (uniqueTags.includes("مرخص رسمي")) keyAdvantage = "مباني رسمية ومرخصة بالكامل";
  else if (uniqueTags.includes("ناصية")) keyAdvantage = "موقع ناصية مميز ومفتوح";
  else if (uniqueTags.includes("جاهز للسكن")) keyAdvantage = "جاهز للتسليم والسكن الفوري";

  // 5. حساب وتنسيق سعر المتر المربع
  const pricePerMeter = calculatePricePerMeter(prop.price, prop.area);
  const formattedPricePerMeter = formatPricePerMeter(pricePerMeter);

  // 6. تجهيز مقتطف الوصف الذكي (Snippet)
  let snippet = desc.trim();
  if (snippet.length > 130) {
    // قطع ذكي عند أقرب مسافة أو فاصلة
    const sub = snippet.substring(0, 125);
    const lastComma = Math.max(sub.lastIndexOf("،"), sub.lastIndexOf("."));
    if (lastComma > 70) {
      snippet = sub.substring(0, lastComma) + "...";
    } else {
      const lastSpace = sub.lastIndexOf(" ");
      snippet = (lastSpace > 70 ? sub.substring(0, lastSpace) : sub) + "...";
    }
  }

  return {
    floors,
    finishing,
    tags: uniqueTags,
    keyAdvantage,
    pricePerMeter,
    formattedPricePerMeter,
    snippet,
  };
}
