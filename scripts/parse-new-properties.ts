import fs from 'fs';
import path from 'path';

const markdownPath = path.resolve('عقارات_بدون_تكرار.md');
const content = fs.readFileSync(markdownPath, 'utf8');

const houseImages = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1000&q=80"
];

const apartmentImages = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80"
];

const landImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1000&q=80"
];

const commercialImages = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
];

const lines = content.split(/\r?\n/);

interface RawItem {
  sectionTitle: string;
  title: string;
  lines: string[];
}

const items: RawItem[] = [];
let currentSection = "";
let currentItem: RawItem | null = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line.startsWith('# ') && !line.startsWith('### ')) {
    if (currentItem) {
      items.push(currentItem);
      currentItem = null;
    }
    currentSection = line.replace(/^#\s*/, '').trim();
    continue;
  }

  if (line.startsWith('### ')) {
    if (currentItem) {
      items.push(currentItem);
    }
    const title = line.replace(/^###\s*/, '').trim();
    currentItem = {
      sectionTitle: currentSection,
      title,
      lines: []
    };
    continue;
  }

  if (currentItem) {
    if (line !== '---') {
      currentItem.lines.push(line);
    }
  }
}

if (currentItem) {
  items.push(currentItem);
}

console.log(`Found ${items.length} raw property items.`);

function parsePrice(item: RawItem): number {
  const fullText = item.lines.join(' ');
  const moneyLine = item.lines.find(l => l.includes('💰')) || "";

  // 1. Check for flat total number in 💰 line
  // Examples: 💰 1,900,000 ج or 💰 ≈ 1,425,600 ج or 💰 10,000 ج شهرياً
  const priceRegex = /💰\s*(?:≈\s*)?([0-9,]+)\s*ج/;
  const match = moneyLine.match(priceRegex);
  if (match) {
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      // Check if this was a per-meter or per-feddan price:
      if (moneyLine.includes("سعر المتر") || moneyLine.includes("للمتر")) {
        // e.g. سعر المتر 5,500 ج
        const areaMatch = fullText.match(/(\d+(?:\.\d+)?)\s*م\b/);
        if (areaMatch) {
          const area = parseFloat(areaMatch[1]);
          return Math.round(area * num);
        }
        return num;
      }
      if (moneyLine.includes("سعر الفدان") || moneyLine.includes("للفدان")) {
        // e.g. 14 فدان - سعر الفدان 4,100,000 ج
        const feddanMatch = (item.title + " " + fullText).match(/(\d+)\s*فدان/);
        if (feddanMatch) {
          const feddan = parseInt(feddanMatch[1], 10);
          return feddan * num;
        }
        return num;
      }
      return num;
    }
  }

  // Check for any number after 💰
  const anyMoneyMatch = moneyLine.match(/💰[^\d]*([0-9,]+)/);
  if (anyMoneyMatch) {
    const num = parseInt(anyMoneyMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(num) && num > 0) return num;
  }

  // Check if text says "مليون" e.g. 7 مليون
  const millionMatch = moneyLine.match(/(\d+(?:\.\d+)?)\s*مليون/);
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1]) * 1000000);
  }

  return 0;
}

function parseArea(item: RawItem): number {
  const fullText = item.title + " " + item.lines.join(' ');
  
  // 1. Check for meter match e.g. 143 م or 120م² or 100 متر
  const meterMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:م²|متر مربع|متر|م(?=[\s\,\.\،\-\—\)]|$))/);
  if (meterMatch) {
    const val = parseFloat(meterMatch[1]);
    if (!isNaN(val) && val > 0 && val < 100000) return val;
  }

  // 2. Check for feddan e.g. 14 فدان
  const feddanMatch = fullText.match(/(\d+(?:\.\d+)?)\s*فدان/);
  if (feddanMatch) {
    const val = parseFloat(feddanMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 4200); // 1 feddan = 4200 m²
  }

  // 3. Check for qirat e.g. 20 قيراط or قيراطين
  if (fullText.includes("قيراطين ونصف")) return 438;
  if (fullText.includes("قيراطين")) return 350;
  const qiratMatch = fullText.match(/(\d+(?:\.\d+)?)\s*قيراط/);
  if (qiratMatch) {
    const val = parseFloat(qiratMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 175); // 1 qirat = 175 m²
  }

  return 0;
}

function parseBedrooms(item: RawItem): number {
  const fullText = item.title + " " + item.lines.join(' ');
  const match = fullText.match(/(\d+)\s*(?:غرف|غرفة|نوم)/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0 && val < 20) return val;
  }
  if (fullText.includes("غرفتين")) return 2;
  if (fullText.includes("3 غرف") || fullText.includes("ثلاث غرف")) return 3;
  if (fullText.includes("4 غرف") || fullText.includes("أربع غرف")) return 4;
  return 0;
}

function parseBathrooms(item: RawItem): number {
  const fullText = item.title + " " + item.lines.join(' ');
  const match = fullText.match(/(\d+)\s*حمام/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0 && val < 10) return val;
  }
  if (fullText.includes("حمامين")) return 2;
  if (fullText.includes("حمام ضيوف + حمام")) return 2;
  if (fullText.includes("حمام")) return 1;
  return 0;
}

function parseType(item: RawItem): string {
  const sec = item.sectionTitle;
  const title = item.title;
  const fullText = title + " " + item.lines.join(' ');

  if (sec.includes("المنازل")) {
    if (title.includes("فيلا")) return "فيلا";
    if (title.includes("عمارة")) return "عمارة";
    return "منزل";
  }
  if (sec.includes("شقق ومحلات")) {
    if (title.includes("محل") || title.includes("تجاري") || title.includes("معرض")) return "تجاري";
    if (title.includes("دور")) return "منزل";
    return "شقة";
  }
  if (sec.includes("كاردون مباني")) {
    return "أراضي كاردون مباني";
  }
  if (sec.includes("ليست كاردون")) {
    return "أراضي بور";
  }
  if (sec.includes("أراضي زراعية")) {
    return "أراضي زراعية";
  }
  if (sec.includes("مشاريع واستثمار")) {
    if (title.includes("مصنع")) return "مصانع";
    if (title.includes("هانجر") || title.includes("هنجر")) return "هنجر";
    if (title.includes("مزرعة") || title.includes("عنبر")) return "أراضي زراعية";
    return "تجاري";
  }
  if (sec.includes("دمياط الجديدة – تمليك")) {
    if (title.includes("فيلا")) return "فيلا";
    if (title.includes("منزل") || title.includes("عمارة")) return "منزل";
    if (title.includes("محل") || title.includes("مول")) return "تجاري";
    if (title.includes("قطعة") || title.includes("أرض")) return "أراضي كاردون مباني";
    return "شقة";
  }
  if (sec.includes("إيجارات")) {
    if (title.includes("محل")) return "تجاري";
    return "شقة";
  }

  // fallback
  if (title.includes("شقة")) return "شقة";
  if (title.includes("أرض")) return "أراضي كاردون مباني";
  if (title.includes("منزل")) return "منزل";
  return "منزل";
}

function parseStatus(item: RawItem): { status: string; statusType: string } {
  const sec = item.sectionTitle;
  const title = item.title;
  if (sec.includes("إيجارات") || title.includes("إيجار") || title.includes("للإيجار")) {
    if (!title.includes("بيع أو إيجار")) {
      return { status: "للإيجار", statusType: "للإيجار" };
    }
  }
  return { status: "للبيع", statusType: "للبيع" };
}

function parseLocation(item: RawItem): { location: string; baseLat: number; baseLng: number } {
  const text = item.title + " " + item.lines.join(' ');
  
  if (text.includes("دمياط الجديدة") || item.sectionTitle.includes("دمياط الجديدة")) {
    return { location: "دمياط الجديدة", baseLat: 31.435, baseLng: 31.670 };
  }
  if (text.includes("رأس البر")) {
    return { location: "رأس البر", baseLat: 31.512, baseLng: 31.821 };
  }
  if (text.includes("فاراسكور")) {
    return { location: "فاراسكور", baseLat: 31.332, baseLng: 31.714 };
  }
  if (text.includes("السنانية")) {
    return { location: "دمياط - السنانية", baseLat: 31.418, baseLng: 31.792 };
  }
  if (text.includes("طريق الميناء")) {
    return { location: "كفر البطيخ - طريق الميناء", baseLat: 31.411, baseLng: 31.745 };
  }
  if (text.includes("الثلاثيني")) {
    return { location: "كفر البطيخ - شارع الثلاثيني", baseLat: 31.401, baseLng: 31.735 };
  }
  if (text.includes("القفاصين")) {
    return { location: "كفر البطيخ - القفاصين", baseLat: 31.405, baseLng: 31.728 };
  }
  if (text.includes("أولاد حمام")) {
    return { location: "كفر البطيخ - أولاد حمام", baseLat: 31.425, baseLng: 31.750 };
  }
  if (text.includes("الركابية")) {
    return { location: "كفر البطيخ - الركابية", baseLat: 31.415, baseLng: 31.765 };
  }
  if (text.includes("الهجارسة")) {
    return { location: "كفر البطيخ - الهجارسة", baseLat: 31.390, baseLng: 31.720 };
  }
  if (text.includes("طريق المطار")) {
    return { location: "كفر البطيخ - طريق المطار", baseLat: 31.420, baseLng: 31.690 };
  }
  if (text.includes("الكباس")) {
    return { location: "كفر البطيخ - عند الكباس", baseLat: 31.403, baseLng: 31.733 };
  }
  if (text.includes("المحطة القديمة")) {
    return { location: "كفر البطيخ - المحطة القديمة", baseLat: 31.412, baseLng: 31.746 };
  }

  // Default to Kafr El-Batikh center
  return { location: "كفر البطيخ", baseLat: 31.402, baseLng: 31.732 };
}

function getImageForType(type: string, id: number): { image: string; images: string[] } {
  return {
    image: "/property.jpg",
    images: ["/property.jpg"]
  };
}

const properties = items.map((item, index) => {
  const id = index + 1;
  const priceValue = parsePrice(item);
  const area = parseArea(item);
  const bedrooms = parseBedrooms(item);
  const bathrooms = parseBathrooms(item);
  const type = parseType(item);
  const { status, statusType } = parseStatus(item);
  const { location, baseLat, baseLng } = parseLocation(item);
  
  // Deterministic slight spread around base coordinate (approx 50m - 500m)
  const latOffset = ((id * 37) % 100 - 50) * 0.00015;
  const lngOffset = ((id * 59) % 100 - 50) * 0.00015;
  const coordinates = {
    lat: Number((baseLat + latOffset).toFixed(6)),
    lng: Number((baseLng + lngOffset).toFixed(6))
  };

  const { image, images } = getImageForType(type, id);

  // Clean description
  const descriptionLines = item.lines.filter(l => !l.startsWith('💰') && l.trim().length > 0);
  const description = descriptionLines.join(' \n');

  return {
    id,
    title: item.title,
    location,
    price: priceValue,
    priceValue: priceValue,
    bedrooms,
    bathrooms,
    area,
    image,
    images,
    type,
    status,
    statusType,
    description: description || item.title,
    owner: {
      name: "بيت العيلة",
      phone: "01279549739",
      callPhone: "01043426746"
    },
    coordinates
  };
});

console.log(`Successfully parsed ${properties.length} properties.`);

// Stats
const typeCounts: Record<string, number> = {};
properties.forEach(p => {
  typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
});
console.log("Property Types Breakdown:", typeCounts);

const priceZero = properties.filter(p => p.priceValue === 0).length;
console.log(`Properties with price > 0: ${properties.length - priceZero}, price 0: ${priceZero}`);

// Write to src/data/properties.ts
const outputFilePath = path.resolve('src/data/properties.ts');
const fileContent = `export const properties = ${JSON.stringify(properties, null, 2)};\n`;

fs.writeFileSync(outputFilePath, fileContent, 'utf8');
console.log(`Saved output to ${outputFilePath}`);
