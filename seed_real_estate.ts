import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const properties = [
  // --- المنازل ---
  {
    title: "منزل بجوار مطعم أبو عيسى على الطريق السريع",
    price: 1100000,
    type: "منزل",
    area: 100,
    bedrooms: 2,
    bathrooms: 1,
    description: "مساحة حوالي 100 متر، دورين، على شارع جانبي متفرع من الطريق السريع، عرض الشارع حوالي 5 متر، الشارع واصل بين الطريق الرئيسي وطريق الميناء. مميزات: سعر مناسب، موقع قريب من الطريق السريع، دورين جاهزين. عيوب: عمر البيت وسط.",
    latitude: 31.401887,
    longitude: 31.732242,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل ناصية وسط البلد",
    price: 1350000,
    type: "منزل",
    area: 85,
    bedrooms: 2,
    bathrooms: 1,
    description: "مساحة 85 متر، دورين – ناصية، الأرضي: محلين متشطبين، الثاني: شقة متشطبة، عدادات كهرباء + مياه. مميزات: ناصية وسط البلد، موقع حيوي.",
    latitude: 31.398865,
    longitude: 31.736123,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل بعد المحطة القديمة عند قهوة أبو سالم",
    price: 1400000,
    type: "منزل",
    area: 82,
    bedrooms: 3,
    bathrooms: 1,
    description: "دور أرضي، 3 غرف + 2 صالة، يبعد عن الطريق السريع ~100م، عرض الشارع 6م، مباني حديثة برخصة (3 أدوار)، أساسات قوية.",
    latitude: 31.412944,
    longitude: 31.746966,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل شارع بعد شريف الزيني",
    price: 1500000,
    type: "منزل",
    area: 110,
    bedrooms: 2,
    bathrooms: 1,
    description: "دورين – دور متشطب. موقع كويس، شارع ضيق.",
    latitude: 31.400704,
    longitude: 31.728615,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل في شارع أبو عبده",
    price: 1500000,
    type: "منزل",
    area: 80,
    bedrooms: 2,
    bathrooms: 1,
    description: "دورين – ناصية على شارعين، الأرضي: محلات، الثاني: شقة سكنية.",
    latitude: 31.402461,
    longitude: 31.735665,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل عند كوبري راشد",
    price: 1800000,
    type: "منزل",
    area: 90,
    bedrooms: 2,
    bathrooms: 1,
    description: "دورين متشطبين، على شارعين، غاز طبيعي، يبعد 4 بيوت عن طريق الميناء.",
    latitude: 31.403556,
    longitude: 31.733040,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "فيلا على البحر قبل الحزازوة + أرض زراعية",
    price: 2300000,
    type: "فيلا",
    area: 875, // approx 5 qirat
    bedrooms: 4,
    bathrooms: 3,
    description: "5 قيراط ملك حر + 11 قيراط إصلاح + 22 قيراط ضريبة، فيلا 3 أدوار على البحر.",
    latitude: null, // User didn't provide
    longitude: null,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل آخر شارع الإدارة التعليمية القديمة",
    price: 2400000,
    type: "منزل",
    area: 100,
    bedrooms: 3,
    bathrooms: 2,
    description: "3 أدوار، تشطيب لوكس، مباني حديثة، رخصة، غاز + كهرباء + مياه.",
    latitude: 31.398075,
    longitude: 31.737378,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل في الثلاثيني ناصية على واجهتين",
    price: 2500000,
    type: "منزل",
    area: 100,
    bedrooms: 2,
    bathrooms: 2,
    description: "دورين – تشطيب لوكس، مباني 2020، ناصية على واجهتين، رخصة + نموذج 8 للدور الثالث.",
    latitude: 31.400485,
    longitude: 31.735524,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل بجوار جامع راشد",
    price: 3000000,
    type: "منزل",
    area: 150,
    bedrooms: 4,
    bathrooms: 3,
    description: "أرضي + أول + ثاني، مباني حديثة، الأرضي تشطيب لوكس، الأول والثاني واقف على المحارة.",
    latitude: 31.401668,
    longitude: 31.733725,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "فيلا بجوار مركز شباب عزبة الكحيل",
    price: 3000000,
    type: "فيلا",
    area: 350,
    bedrooms: 3,
    bathrooms: 2,
    description: "أرض 350 متر، صافي مباني 200 متر، دورين، مدخلين على شارعين.",
    latitude: 31.383987,
    longitude: 31.734025,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل في الثلاثيني على الطريق مباشرة",
    price: 3200000,
    type: "منزل",
    area: 130,
    bedrooms: 4,
    bathrooms: 2,
    description: "3 أدوار، على الطريق الرئيسي مباشرة، خلفه 50م أرض ملحق، تشطيب ممتاز.",
    latitude: 31.400485,
    longitude: 31.735524,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل أمام مصنع راشد",
    price: 3300000,
    type: "منزل",
    area: 146,
    bedrooms: 4,
    bathrooms: 2,
    description: "دورين تشطيب سوبر لوكس، ثالث مطل من الطريق الرئيسي، مباني حديثة.",
    latitude: 31.401668,
    longitude: 31.733725,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل رابع مطل من مدخل دمياط الجديدة",
    price: 4000000,
    type: "منزل",
    area: 175,
    bedrooms: 3,
    bathrooms: 2,
    description: "دورين + الثالث على الصبة، جراج جانبي، صافي 130 متر.",
    latitude: 31.437585,
    longitude: 31.713783,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل ثاني مطل من مدخل دمياط الجديدة",
    price: 4200000,
    type: "منزل",
    area: 350,
    bedrooms: 4,
    bathrooms: 2,
    description: "دورين تشطيب لوكس، حديقة + مسقط خلفي 3م، فراغ من ثلاث جهات.",
    latitude: 31.437585,
    longitude: 31.713783,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل 3 أدوار بمحلات وسندرة",
    price: 4500000,
    type: "منزل",
    area: 138,
    bedrooms: 3,
    bathrooms: 2,
    description: "3 أدوار، الأرضي: محلات + سندرة، منطقة كوبري المدرسة.",
    latitude: 31.402329,
    longitude: 31.733247,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل تاني مطل من طريق مدخل دمياط الجديدة",
    price: 5000000,
    type: "منزل",
    area: 175,
    bedrooms: 3,
    bathrooms: 2,
    description: "دورين تشطيب لوكس، الأرضي 2 مخزن، الثاني شقة متشطبة.",
    latitude: 31.437585,
    longitude: 31.713783,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل في السنانية شارع المزلقان",
    price: 5000000,
    type: "عمارة",
    area: 75,
    bedrooms: 10,
    bathrooms: 5,
    description: "5 أدوار – كل دور شقتين، مباني 2004، غاز طبيعي، موقع حيوي يصلح للإيجار.",
    latitude: 31.422552,
    longitude: 31.796836,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "منزل أهالي في مدخل دمياط الجديدة",
    price: 6000000,
    type: "منزل",
    area: 120,
    bedrooms: 4,
    bathrooms: 3,
    description: "3 أدوار + الرابع على أعمدة، تشطيب سوبر لوكس، داخل الحيز العمراني.",
    latitude: 31.437585,
    longitude: 31.713783,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },

  // --- أراضي كاردون مباني ---
  {
    title: "أرض شارع الإدارة التعليمية القديمة",
    price: 480000,
    type: "أراضي كاردون مباني",
    area: 100,
    description: "واجهة 8 متر تقريبًا، داخل الكاردون، جاهزة للبناء.",
    latitude: 31.398058,
    longitude: 31.736660,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "أرض خلف أرض القطب شمس الدين",
    price: 720000,
    type: "أراضي كاردون مباني",
    area: 120,
    description: "كاردون مباني، موقع مميز في وسط البلد.",
    latitude: 31.399690,
    longitude: 31.736305,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "أرض بجوار ملعب أسامة رضوان",
    price: 946000,
    type: "أراضي كاردون مباني",
    area: 220,
    description: "كاردون مباني، مساحة ممتازة، موقع حيوي.",
    latitude: 31.403895,
    longitude: 31.741951,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "أرض آخر شارع الإدارة التعليمية القديمة أول البلد",
    price: 1162000,
    type: "أراضي كاردون مباني",
    area: 166,
    description: "كاردون مباني + رخصة 3 أدوار، واجهة وناصية على شارعين.",
    latitude: 31.398058,
    longitude: 31.736660,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "قطعتين أرض أول البلد كفر البطيخ",
    price: 1500000,
    type: "أراضي كاردون مباني",
    area: 150,
    description: "كاملة الخدمات، طريق 18، بجوار مسجد أبو نزهة.",
    latitude: 31.398583,
    longitude: 31.733291,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "قطعة أرض كاردون مقابل سور ميناء دمياط الجديدة",
    price: 8125000,
    type: "أراضي كاردون مباني",
    area: 1250,
    description: "ملك حر، بها منزل قديم دورين، مساحة كبيرة بجوار الميناء.",
    latitude: 31.439696,
    longitude: 31.763146,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "قطعة أرض في الحربي أمام موقف عزبة البرج",
    price: 35490000,
    type: "أراضي كاردون مباني",
    area: 1365,
    description: "على الطريق العمومي، داخل الكردون، مساحة كبيرة قابلة للتقسيم.",
    latitude: 31.422552, // placeholder
    longitude: 31.796836,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "قطعة أرض كاردون طريق رأس البر مقابل الأعصر",
    price: 46400000,
    type: "أراضي كاردون مباني",
    area: 160,
    description: "أول مطل على طريق رأس البر مباشرة، خارج حرم الطريق.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "قطعة أرض في قلب دمياط بجوار مركز عزبة اللحم",
    price: 108000000,
    type: "أراضي كاردون مباني",
    area: 3600,
    description: "موقع حيوي جدا، مساحة ضخمة.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },

  // --- الأراضي الزراعية ---
  {
    title: "أرض زراعية في الهجارسة",
    price: 12000000,
    type: "أراضي زراعية",
    area: 12600, // 3 faddan
    description: "3 فدادين ملك حر، أرض طينية خصبة، ري مباشر من البحر.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "فدانين ونصف على الطريق السريع قرب الإسماعيلية الجديدة",
    price: 3400000,
    type: "أراضي زراعية",
    area: 10500,
    description: "ملك حر، محاطة بالمباني من 3 اتجاهات، أرض طينية.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "فدانين على 3 ناصيات في أم رضا",
    price: 6000000,
    type: "أراضي زراعية",
    area: 8400,
    description: "بهم 70 نخلة، أرض مزروعة مانجو، على ترعة رئيسية.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "فدان ونصف مزروع مانجو في أم رضا",
    price: 4500000,
    type: "أراضي زراعية",
    area: 6300,
    description: "بهم 40 نخلة، على ترعة رئيسية.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "14 فدان رمل أرض مانجا ومزرعة مواشي ومنزل في أم رضا",
    price: 35000000, // estimated
    type: "أراضي زراعية",
    area: 58800,
    description: "14 فدان رمل أرض مانجا مزروعه بها مزرعة مواشي ومنزل دورين وبه مياه ونور.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },

  // --- أراضي بور ---
  {
    title: "قطعة أرض بور ملك حر خلف سيسكو ترانس",
    price: 500000, // estimated since not defined
    type: "أراضي بور",
    area: 1575, // 9 qirat
    description: "9 قيراط ملك حر، محيطة بأشجار نخل.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    sellerId: 1
  },

  // --- مشاريع / مصانع / تجاري ---
  {
    title: "مزرعة دواجن على طريق أسفلت أولاد حمام",
    price: 3200000,
    type: "تجاري", // or مصانع
    area: 800,
    description: "الحوش 500 متر، مزرعة قائمة بالكامل بمعدات ونظام تبريد، عداد 3 فاز.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "مزرعة فراخ في أولاد حمام",
    price: 5600000, // 1600 * 3500
    type: "تجاري",
    area: 1600,
    description: "20 قيراط، ملك حر، عنبرين، كامل المعدات.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "مبنى إداري ومخازن بمدخل دمياط الجديدة - المطار",
    price: 8000000,
    type: "مصانع",
    area: 1050, // 6 qirat
    description: "6 قيراط مبنى إداري دورين + 3 مخازن، ملك حر.",
    latitude: null,
    longitude: null,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  },
  {
    title: "شقة + محل على الطريق السريع",
    price: 1250000,
    type: "تجاري",
    area: 90,
    description: "أول مطل على الأسفلت مباشرة، الدور الأول محل والثاني شقة.",
    latitude: 31.399883,
    longitude: 31.726961,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80",
    sellerId: 1
  }
];

async function seed() {
  try {
    // First, ensure there is a user with id=1
    let user = await prisma.user.findFirst({ where: { id: 1 } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "البائع الأول",
          email: "seller1@test.com",
          role: "seller"
        }
      });
    }

    // Insert all properties
    for (const prop of properties) {
      await prisma.property.create({
        data: {
          ...prop,
          sellerId: user.id
        }
      });
    }
    
    console.log("Successfully seeded", properties.length, "properties.");
  } catch (error) {
    console.error("Error seeding properties:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
