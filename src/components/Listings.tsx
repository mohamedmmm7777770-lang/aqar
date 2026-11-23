import { useState, useMemo, useEffect } from "react";
import { MapPin, BedDouble, Bath, Maximize, ArrowLeft, Filter, Search, Scale, X, Check, Heart, MessageCircle, User, ImageIcon, Star, Navigation, ChevronDown, ChevronUp, Clock, Map, Phone, Building, Layers, Car, Bike, Footprints, Compass, Sparkles, ShieldCheck, Home, Building2, Store, Trees, Tag, Coins, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { properties as staticProperties } from "../data/properties";
import { PREDEFINED_LOCATIONS } from "../data/facilities";
import { extractLandmark, type LandmarkMatch } from "../utils/landmarkMatcher";
import { extractExtendedHighlights } from "../utils/propertyHighlights";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

function getDirection(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
}

function formatTime(minutes: number) {
  if (minutes < 1) return "أقل من دقيقة";
  if (minutes < 60) return `${Math.round(minutes)} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

function extractPropertyHighlights(prop: any) {
  return extractExtendedHighlights(prop);
}

interface ListingsProps {
  heroSearch?: string;
  heroType?: string;
  onHeroTypeChange?: (type: string) => void;
}

export default function Listings({ heroSearch, heroType, onHeroTypeChange }: ListingsProps = {}) {
  const [filters, setFilters] = useState({
    status: "الكل",
    type: heroType || "الكل",
    priceRange: "الكل",
    searchQuery: heroSearch || "",
    sortBy: "newest",
  });

  useEffect(() => {
    if (heroSearch !== undefined) {
      setFilters(prev => ({ ...prev, searchQuery: heroSearch }));
    }
  }, [heroSearch]);

  useEffect(() => {
    if (heroType !== undefined) {
      setFilters(prev => ({ ...prev, type: heroType }));
    }
  }, [heroType]);

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          setProperties(staticProperties);
          setLoading(false);
          return;
        }
        // Enrich data with locations from static file if missing
        const enrichedData = data.map((item: any) => {
          if (item.latitude && item.longitude) {
            item.coordinates = { lat: item.latitude, lng: item.longitude };
          }
          if (!item.location || !item.coordinates) {
            const staticProp = staticProperties.find(p => p.title === item.title);
            if (staticProp) {
              if (!item.location && staticProp.location) item.location = staticProp.location;
              if (!item.coordinates && staticProp.coordinates) item.coordinates = staticProp.coordinates;
            }
          }
          return item;
        });
        setProperties(enrichedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching properties, falling back to static", err);
        setProperties(staticProperties);
        setLoading(false);
      });
  }, []);

  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("kafrElbatikhFavorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // إحداثيات مستخرجة من المعالم في النص لو ما فيش GPS
  const [detectedLandmark, setDetectedLandmark] = useState<LandmarkMatch | null>(null);

  // استخراج المعلم الأقرب عند تغيير العقار المحدد
  useEffect(() => {
    if (!selectedProperty) {
      setDetectedLandmark(null);
      return;
    }
    // لو عنده إحداثيات GPS حقيقية غير صفرية → الأولوية لها ولا نحتاج الاستخراج
    if (selectedProperty.coordinates?.lat && selectedProperty.coordinates?.lng) {
      setDetectedLandmark(null);
      return;
    }
    // فحص العنوان والوصف والموقع لاستخراج المعلم
    const fullText = [
      selectedProperty.title,
      selectedProperty.location,
      selectedProperty.description,
    ]
      .filter(Boolean)
      .join(" ");
    const match = extractLandmark(fullText);
    setDetectedLandmark(match);
  }, [selectedProperty]);

  // الموقع الفعال للعقار: GPS دقيق -> معلم تقريبي -> غير محدد
  const effectiveLocation = useMemo(() => {
    if (selectedProperty?.coordinates?.lat && selectedProperty?.coordinates?.lng) {
      return {
        lat: selectedProperty.coordinates.lat,
        lng: selectedProperty.coordinates.lng,
        source: "gps" as const,
        name: "نطاق الشارع (GPS)",
      };
    }
    if (detectedLandmark) {
      return {
        lat: detectedLandmark.coordinates.lat,
        lng: detectedLandmark.coordinates.lng,
        source: "landmark" as const,
        name: detectedLandmark.name,
      };
    }
    return null;
  }, [selectedProperty, detectedLandmark]);

  const nearbyFacilities = useMemo(() => {
    // أولوية النقطة المرجعية: موقع المستخدم الحالي -> الموقع الفعال للعقار
    let targetLat: number | null = null;
    let targetLng: number | null = null;

    if (userLocation) {
      targetLat = userLocation.lat;
      targetLng = userLocation.lng;
    } else if (effectiveLocation) {
      targetLat = effectiveLocation.lat;
      targetLng = effectiveLocation.lng;
    }

    if (targetLat === null || targetLng === null) return {};

    const facilitiesWithDist = PREDEFINED_LOCATIONS.map(fac => {
      const dist = getDistance(
        targetLat, 
        targetLng, 
        fac.coordinates.latitude, 
        fac.coordinates.longitude
      );
      return {
        ...fac,
        distance: dist,
        walkingTime: formatTime((dist / 5000) * 60),
        cyclingTime: formatTime((dist / 25000) * 60),
        drivingTime: formatTime((dist / 60000) * 60),
        direction: getDirection(
          targetLat, 
          targetLng, 
          fac.coordinates.latitude, 
          fac.coordinates.longitude
        )
      };
    }).sort((a, b) => a.distance - b.distance);

    const grouped: Record<string, typeof facilitiesWithDist> = {};
    facilitiesWithDist.forEach(fac => {
      if (!grouped[fac.category]) grouped[fac.category] = [];
      grouped[fac.category].push(fac);
    });
    
    return grouped;
  }, [effectiveLocation, userLocation]);

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          alert("تعذر الحصول على موقعك. يرجى تفعيل الـ GPS في متصفحك أو جهازك.");
        }
      );
    } else {
      alert("متصفحك لا يدعم تحديد الموقع الجغرافي.");
    }
  };

  const [reviews, setReviews] = useState<Record<number, { id: number, rating: number, comment: string, date: string }[]>>(() => {
    const saved = localStorage.getItem("kafrElbatikhReviews");
    return saved ? JSON.parse(saved) : {};
  });
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    localStorage.setItem("kafrElbatikhFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("kafrElbatikhReviews", JSON.stringify(reviews));
  }, [reviews]);

  const handleAddReview = () => {
    if (!selectedProperty || newRating === 0) return;
    
    const review = {
      id: Date.now(),
      rating: newRating,
      comment: newComment,
      date: new Date().toLocaleDateString("ar-EG")
    };
    
    setReviews(prev => ({
      ...prev,
      [selectedProperty.id]: [review, ...(prev[selectedProperty.id] || [])]
    }));
    
    setNewRating(0);
    setNewComment("");
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const categoryPills = [
    { label: "الكل", value: "الكل", icon: Sparkles },
    { label: "منازل وبيوت", value: "منازل وبيوت", icon: Home },
    { label: "شقق سكنية", value: "شقق سكنية", icon: Building2 },
    { label: "أراضي وبناء", value: "أراضي وبناء", icon: Trees },
    { label: "تجاري ومحلات", value: "تجاري ومحلات", icon: Store },
  ];

  const isPillActive = (pillValue: string) => {
    if (pillValue === "الكل") return filters.type === "الكل";
    if (pillValue === "منازل وبيوت") {
      return ["منازل وبيوت", "منزل", "فيلا", "عمارة"].includes(filters.type);
    }
    if (pillValue === "شقق سكنية") {
      return ["شقق سكنية", "شقة"].includes(filters.type);
    }
    if (pillValue === "أراضي وبناء") {
      return ["أراضي وبناء", "أرض", "أراضي زراعية", "أراضي كاردون مباني", "أراضي بور"].includes(filters.type);
    }
    if (pillValue === "تجاري ومحلات") {
      return ["تجاري ومحلات", "تجاري", "مصانع", "هنجر"].includes(filters.type);
    }
    return filters.type === pillValue;
  };

  const filteredProperties = useMemo(() => {
    let result = properties.filter(p => {
      if (showFavoritesOnly && !favorites.includes(p.id)) return false;
      if (filters.status !== "الكل" && p.statusType !== filters.status) return false;
      if (filters.type !== "الكل") {
        if (filters.type === "أرض" || filters.type === "أراضي وبناء") {
          if (!p.type.includes("أرض") && !p.type.includes("أراضي")) return false;
        } else if (filters.type === "منازل وبيوت") {
          if (!p.type.includes("منزل") && !p.type.includes("فيلا") && !p.type.includes("عمارة") && !p.type.includes("بيت")) return false;
        } else if (filters.type === "شقق سكنية") {
          if (!p.type.includes("شقة")) return false;
        } else if (filters.type === "تجاري ومحلات") {
          if (!p.type.includes("تجاري") && !p.type.includes("محل") && !p.type.includes("مصانع") && !p.type.includes("هنجر")) return false;
        } else if (p.type !== filters.type) {
          return false;
        }
      }
      if (filters.priceRange !== "الكل") {
        const [min, max] = filters.priceRange.split("-").map(Number);
        if (p.price < min) return false;
        if (max && p.price > max) return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const titleMatch = p.title ? p.title.toLowerCase().includes(query) : false;
        const locationMatch = p.location ? p.location.toLowerCase().includes(query) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(query) : false;
        if (!titleMatch && !locationMatch && !descMatch) {
          return false;
        }
      }
      return true;
    });

    if (filters.sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [properties, filters, showFavoritesOnly, favorites]);

  return (
    <section id="listings" className="pt-6 sm:pt-8 pb-16 sm:pb-20 bg-slate-50 relative overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 left-10 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 font-extrabold text-xs shadow-xs border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>منصة كفر البطيخ ودمياط الموثقة • معلنة مباشرة من الملاك</span>
            </div>
            
            <div className="flex items-center gap-3.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 bg-clip-text text-transparent tracking-tight leading-tight">
                أحدث العقارات المتاحة
              </h2>
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full shadow-2xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>{filteredProperties.length} عقار متوفر</span>
              </span>
            </div>
            
            <p className="text-slate-600 max-w-2xl text-sm sm:text-base font-medium leading-relaxed">
              تصفح أفضل العروض السكنية والتجارية مع مؤشر دقيق لخدمات ومرافق الحي وأسعار مباشرة من الملاك قابلة للتفاوض.
            </p>
          </motion.div>

          {/* Quick Trust Badges on the side */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>مؤشر خدمات الحي</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>معلن من المالك مباشرة</span>
            </div>
          </div>
        </div>
        
        {/* Modern Vibrant Bento Filter Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-b from-white via-white to-emerald-50/25 p-4 sm:p-6 rounded-3xl shadow-lg shadow-emerald-950/5 border border-emerald-100/90 mb-8 sm:mb-10 overflow-hidden"
        >
          {/* Subtle top emerald accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>

          {/* Quick Category Pills Bar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              {categoryPills.map((pill) => {
                const active = isPillActive(pill.value);
                const Icon = pill.icon;
                return (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setFilters({ ...filters, type: active && pill.value !== "الكل" ? "الكل" : pill.value })}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 shrink-0 cursor-pointer ${
                      active
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20"
                        : "bg-slate-50 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-emerald-100" : "text-emerald-600"}`} />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reset / active filters badge */}
            {(filters.type !== "الكل" || filters.status !== "الكل" || filters.priceRange !== "الكل" || filters.searchQuery || showFavoritesOnly) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    status: "الكل",
                    type: "الكل",
                    priceRange: "الكل",
                    searchQuery: "",
                    sortBy: "newest"
                  });
                  setShowFavoritesOnly(false);
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 border border-rose-200/60 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>إعادة تعيين الفلاتر</span>
              </button>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="relative mb-4 group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                <Search className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <input
              type="text"
              className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border-2 border-slate-200/80 focus:border-emerald-500 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 block p-3 pr-14 pl-28 outline-none transition-all text-sm font-medium placeholder-slate-400 shadow-2xs"
              placeholder="ابحث بالحي، الشارع، أو نوع العقار (مثال: عند الكباس، شارع الثلاثيني، شقة 100م...)"
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
            />
            
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 gap-1.5">
              {filters.searchQuery && (
                <button 
                  onClick={() => setFilters({...filters, searchQuery: ""})}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="مسح البحث"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50/90 px-2.5 py-1 rounded-xl border border-emerald-200/60">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>بحث ذكي بالمعالم</span>
              </span>
            </div>
          </div>

          {/* Colorful Filter Selects Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
            {/* نوع العرض */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <label className="text-[11px] font-extrabold text-blue-900 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-600" />
                  <span>نوع العرض</span>
                </label>
              </div>
              <div className="relative">
                <select 
                  className="w-full bg-white hover:bg-blue-50/30 border border-blue-200/90 text-slate-800 rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-2xs"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="الكل">كل العروض</option>
                  <option value="للبيع">للبيع</option>
                  <option value="للإيجار">للإيجار</option>
                </select>
              </div>
            </div>
            
            {/* نوع العقار */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <label className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-600" />
                  <span>نوع العقار</span>
                </label>
              </div>
              <div className="relative">
                <select 
                  className="w-full bg-white hover:bg-emerald-50/30 border border-emerald-200/90 text-slate-800 rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-2xs"
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                  <option value="الكل">كل الأنواع</option>
                  <option value="شقة">شقة</option>
                  <option value="فيلا">فيلا</option>
                  <option value="منزل">منزل</option>
                  <option value="عمارة">عمارة</option>
                  <option value="أرض">أرض (عام)</option>
                  <option value="أراضي زراعية">أراضي زراعية</option>
                  <option value="أراضي كاردون مباني">أراضي كاردون مباني</option>
                  <option value="أراضي بور">أراضي بور</option>
                  <option value="تجاري">محل / تجاري</option>
                  <option value="مصانع">مصانع</option>
                  <option value="هنجر">هنجر</option>
                </select>
              </div>
            </div>

            {/* النطاق السعري */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <label className="text-[11px] font-extrabold text-purple-900 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-purple-600" />
                  <span>النطاق السعري</span>
                </label>
              </div>
              <div className="relative">
                <select 
                  className="w-full bg-white hover:bg-purple-50/30 border border-purple-200/90 text-slate-800 rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer shadow-2xs"
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                >
                  <option value="الكل">أي سعر</option>
                  <option value="0-10000">أقل من 10,000 ج.م</option>
                  <option value="10000-500000">10,000 - 500,000 ج.م</option>
                  <option value="500000-1000000">500,000 - 1,000,000 ج.م</option>
                  <option value="1000000-5000000">1,000,000 - 5,000,000 ج.م</option>
                  <option value="5000000-">أكثر من 5,000,000 ج.م</option>
                </select>
              </div>
            </div>
            
            {/* الترتيب */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <label className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-amber-600" />
                  <span>الترتيب</span>
                </label>
              </div>
              <div className="relative">
                <select 
                  className="w-full bg-white hover:bg-amber-50/30 border border-amber-200/90 text-slate-800 rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer shadow-2xs"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                </select>
              </div>
            </div>

            {/* المفضلة فقط */}
            <div className="col-span-2 sm:col-span-1 flex flex-col justify-end space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <label className="text-[11px] font-extrabold text-rose-900 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-600" />
                  <span>المفضلة</span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold transition-all border text-xs sm:text-sm cursor-pointer ${
                  showFavoritesOnly 
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25 ring-2 ring-rose-400/30' 
                    : 'bg-white hover:bg-rose-50/40 text-slate-700 hover:text-rose-700 border-slate-200/90 hover:border-rose-200 shadow-2xs'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current text-white' : 'text-rose-500'}`} />
                <span>{showFavoritesOnly ? 'كل العقارات' : 'المفضلة فقط'}</span>
              </button>
            </div>
          </div>
        </motion.div>
        
        {filteredProperties.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredProperties.map(property => (
                <motion.div 
                  layout
                  variants={itemVariants} 
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={property.id} 
                  onClick={() => {
                    setSelectedProperty(property);
                    setActiveImageIndex(0);
                  }}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                >
                  {/* Card Image Banner */}
                  <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20"></div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-emerald-600/90 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                        {property.type} • {property.statusType || "للبيع"}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                      className="absolute top-3 left-3 z-10 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md shadow-md hover:scale-110 transition-transform"
                      title={favorites.includes(property.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(property.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>

                    {/* Price Tag Floating over Image */}
                    <div className="absolute bottom-3 right-3 left-3 flex justify-between items-end z-10">
                      <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white shadow-lg border border-white/10">
                        {property.price > 0 ? (
                          <p className="font-black text-lg sm:text-xl leading-tight">
                            {property.price.toLocaleString("ar-EG")} <span className="text-xs font-bold text-emerald-400">ج.م</span>
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm font-bold text-amber-300 leading-tight">
                            السعر عند التواصل
                          </p>
                        )}
                      </div>

                      {reviews[property.id] && reviews[property.id].length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-amber-400 border border-white/10 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {(reviews[property.id].reduce((sum, r) => sum + r.rating, 0) / reviews[property.id].length).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                    <div className="space-y-2.5">
                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors" title={property.title}>
                        {property.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{property.location || "غير محدد"}</span>
                      </div>

                      {/* Prominent Spotlight for Area & Floors */}
                      {(() => {
                        const highlights = extractPropertyHighlights(property);
                        const floorsValue = highlights.floors || (property.type === "شقة" ? "شقة" : property.type === "أرض" ? "أرض" : null);

                        return (
                          <>
                            <div className="my-1 grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs">
                              {/* المساحة - بارزة وواضحة جداً */}
                              <div className="flex items-center gap-2.5 px-1.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                                  <Maximize className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[11px] font-bold text-slate-500 block leading-tight">المساحة</span>
                                  <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight block leading-tight truncate" dir="ltr">
                                    {property.area > 0 ? `${property.area} م²` : "حسب المعاينة"}
                                  </span>
                                </div>
                              </div>

                              {/* عدد الأدوار - بارزة وواضحة جداً */}
                              <div className="flex items-center gap-2.5 px-1.5 border-r border-slate-200">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                                  <Building className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[11px] font-bold text-slate-500 block leading-tight">
                                    {property.type === "شقة" ? "الدور" : "عدد الأدوار"}
                                  </span>
                                  <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight block leading-tight truncate" title={floorsValue || "حسب الطلب"}>
                                    {floorsValue || "غير محدد"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Secondary Feature Highlights (Finishing & Tags) */}
                            {(highlights.finishing || highlights.tags.length > 0) && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {highlights.finishing && (
                                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                                    {highlights.finishing}
                                  </span>
                                )}
                                {highlights.tags.slice(0, 3).map((tag: string, idx: number) => (
                                  <span key={idx} className="bg-amber-50 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Smart Description Snippet */}
                            {property.description && (
                              <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 text-xs text-slate-600 leading-relaxed group-hover:bg-emerald-50/20 group-hover:border-emerald-100/60 transition-colors">
                                <p className="line-clamp-2 leading-normal" title={property.description}>
                                  {property.description}
                                </p>
                              </div>
                            )}

                            {/* Quick Value Metrics (Price per m² & Key Advantage) */}
                            {highlights.formattedPricePerMeter ? (
                              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-emerald-50/70 rounded-xl border border-emerald-100 text-[11px] font-bold text-emerald-900">
                                <div className="flex items-center gap-1.5">
                                  <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="text-slate-500 font-medium">سعر المتر:</span>
                                  <span className="font-black text-emerald-700" dir="ltr">{highlights.formattedPricePerMeter}</span>
                                </div>
                                {highlights.keyAdvantage && (
                                  <span className="text-emerald-700 font-semibold truncate text-[11px]" title={highlights.keyAdvantage}>
                                    {highlights.keyAdvantage}
                                  </span>
                                )}
                              </div>
                            ) : highlights.keyAdvantage ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] font-bold text-blue-900">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">{highlights.keyAdvantage}</span>
                              </div>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>

                    {/* Footer specs & Compare Button */}
                    <div className="space-y-3 pt-2">
                      {/* Specs Row */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-600 text-xs font-bold">
                        <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                          <span>كود العقار: #{property.id}</span>
                        </div>

                        {property.bedrooms > 0 || property.bathrooms > 0 ? (
                          <div className="flex items-center gap-2.5">
                            {property.bedrooms > 0 && (
                              <div className="flex items-center gap-1 text-slate-800">
                                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                                <span>{property.bedrooms} غرف</span>
                              </div>
                            )}
                            {property.bathrooms > 0 && (
                              <div className="flex items-center gap-1 text-slate-800">
                                <Bath className="w-3.5 h-3.5 text-slate-400" />
                                <span>{property.bathrooms} حمام</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-bold border border-emerald-200/60">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>
                              {(() => {
                                const h = extractPropertyHighlights(property);
                                return h.tags.includes("جاهز للسكن") ? "جاهز للتسليم" : property.statusType || "متاح للبيع";
                              })()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Compare toggle button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForComparison(prev => 
                            prev.includes(property.id) 
                              ? prev.filter(id => id !== property.id)
                              : [...prev, property.id]
                          );
                        }}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all border text-xs ${
                          selectedForComparison.includes(property.id) 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {selectedForComparison.includes(property.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            تمت الإضافة للمقارنة
                          </>
                        ) : (
                          <>
                            <Scale className="w-3.5 h-3.5 text-slate-400" />
                            أضف للمقارنة
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200"
          >
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">لا توجد نتائج مطابقة</h3>
            <p className="text-slate-500">جرب تغيير خيارات البحث لرؤية المزيد من العقارات.</p>
            <button 
              onClick={() => setFilters({ status: "الكل", type: "الكل", priceRange: "الكل", searchQuery: "", sortBy: "newest" })}
              className="mt-6 text-emerald-600 font-bold hover:text-emerald-700 underline"
            >
              مسح عوامل التصفية
            </button>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button for Comparison */}
      <AnimatePresence>
        {selectedForComparison.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <span className="font-bold">{selectedForComparison.length} عقارات محددة</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowComparisonModal(true)}
                disabled={selectedForComparison.length < 2}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 px-4 py-2 rounded-full font-bold transition-colors text-sm"
              >
                قارن الآن
              </button>
              <button 
                onClick={() => setSelectedForComparison([])}
                className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparisonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowComparisonModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-auto max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 z-10"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <div className="flex items-center gap-3 text-slate-900">
                  <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shadow-sm">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">مقارنة العقارات</h2>
                    <p className="text-xs text-slate-500 font-bold">مقارنة دقيقة للمواصفات والأسعار وجهاً لوجه</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowComparisonModal(false)}
                  className="p-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full transition-colors"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 text-right bg-slate-50 border border-slate-200/80 rounded-tr-2xl font-bold text-slate-700 w-36">الميزة</th>
                      {selectedForComparison.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return (
                          <th key={id} className="p-4 text-center border border-slate-200/80 bg-white">
                            <div className="flex flex-col items-center">
                              <img src={prop?.image} alt={prop?.title} className="w-24 h-20 object-cover rounded-xl mb-2.5 shadow-sm border border-slate-100" />
                              <h3 className="font-black text-slate-900 text-xs sm:text-sm max-w-[180px] line-clamp-1 leading-snug">{prop?.title}</h3>
                              <button
                                onClick={() => setSelectedForComparison(prev => prev.filter(pId => pId !== id))}
                                className="text-xs text-rose-500 hover:text-rose-700 font-bold mt-1.5 transition-colors"
                              >
                                إزالة من المقارنة
                              </button>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border border-slate-200/80 font-bold text-slate-700 bg-slate-50">السعر</td>
                      {selectedForComparison.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return (
                          <td key={`price-${id}`} className="p-4 text-center border border-slate-200/80 font-black text-emerald-600 text-base sm:text-lg">
                            {prop?.price ? `${prop.price.toLocaleString("ar-EG")} ج.م` : "عند التواصل"}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 border border-slate-200/80 font-bold text-slate-700 bg-slate-50">المساحة</td>
                      {selectedForComparison.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return <td key={`area-${id}`} className="p-4 text-center border border-slate-200/80 font-bold text-slate-800" dir="ltr">{prop?.area ? `${prop.area} م²` : "-"}</td>
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 border border-slate-200/80 font-bold text-slate-700 bg-slate-50">الموقع</td>
                      {selectedForComparison.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return <td key={`loc-${id}`} className="p-4 text-center border border-slate-200/80 text-xs sm:text-sm text-slate-600 font-semibold">{prop?.location}</td>
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 border border-slate-200/80 font-bold text-slate-700 bg-slate-50">النوع</td>
                      {selectedForComparison.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return <td key={`type-${id}`} className="p-4 text-center border border-slate-200/80 font-bold text-slate-800">{prop?.type}</td>
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 border border-slate-200/80 font-bold text-slate-700 bg-slate-50">الحالة</td>
                      {selectedForComparison.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return (
                          <td key={`status-${id}`} className="p-4 text-center border border-slate-200/80">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${prop?.status === 'للبيع' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              {prop?.status || "للبيع"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 border border-slate-200/80 font-bold text-slate-700 bg-slate-50 rounded-br-2xl">الغرف / الحمامات</td>
                      {selectedForComparison.map(id => {
                        const prop = properties.find(p => p.id === id);
                        return (
                          <td key={`rooms-${id}`} className="p-4 text-center border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-700">
                            {prop?.bedrooms ? `${prop.bedrooms} نوم` : "-"} / {prop?.bathrooms ? `${prop.bathrooms} حمام` : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Property Details Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedProperty(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-auto max-h-[92vh] overflow-y-auto flex flex-col border border-slate-100 z-10"
            >
              {/* Top Media Hero Banner */}
              <div className="relative w-full h-72 sm:h-80 md:h-96 bg-slate-900 overflow-hidden shrink-0">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={selectedProperty.images?.[activeImageIndex] || selectedProperty.image}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none"></div>

                {/* Top Actions Row: Badges on Start, Close on End */}
                <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                      {selectedProperty.type} • {selectedProperty.statusType || "للبيع"}
                    </span>
                    {selectedProperty.price > 0 && (
                      <span className="hidden sm:inline-flex bg-slate-900/80 text-emerald-400 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/10">
                        {selectedProperty.price.toLocaleString("ar-EG")} ج.م
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="p-2.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full shadow-lg transition-all backdrop-blur-md hover:scale-105"
                    title="إغلاق النافذة"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Bottom Gallery Thumbnails */}
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 px-4 z-10">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-full overflow-x-auto">
                      {selectedProperty.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            activeImageIndex === idx ? 'border-emerald-400 scale-105 shadow-lg' : 'border-white/40 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 lg:p-10 space-y-8">
                {/* Title & Price Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                      {selectedProperty.title}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-600 text-base sm:text-lg">
                      <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{selectedProperty.location || "غير محدد"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end shrink-0">
                    {selectedProperty.price > 0 ? (
                      <div>
                        <span className="text-xs text-slate-500 font-bold block mb-1">السعر المطلوب</span>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                          {selectedProperty.price.toLocaleString("ar-EG")} <span className="text-lg font-bold text-slate-600">ج.م</span>
                        </div>
                      </div>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-lg font-black px-4 py-2 rounded-xl">
                        السعر عند التواصل
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Specs Grid (Bedrooms, Bathrooms, Area, Coordinates) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {selectedProperty.bedrooms > 0 ? (
                    <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <BedDouble className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900">{selectedProperty.bedrooms}</div>
                        <div className="text-xs font-bold text-slate-500">غرف نوم</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-800">مبنى / عقار</div>
                        <div className="text-xs font-bold text-slate-500">النوع</div>
                      </div>
                    </div>
                  )}

                  {selectedProperty.bathrooms > 0 ? (
                    <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Bath className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900">{selectedProperty.bathrooms}</div>
                        <div className="text-xs font-bold text-slate-500">حمامات</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-800">{selectedProperty.status || "للبيع"}</div>
                        <div className="text-xs font-bold text-slate-500">الحالة</div>
                      </div>
                    </div>
                  )}

                  {selectedProperty.area > 0 ? (
                    <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Maximize className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900" dir="ltr">{selectedProperty.area} م²</div>
                        <div className="text-xs font-bold text-slate-500">المساحة الإجمالية</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                        <Maximize className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">حسب المعاينة</div>
                        <div className="text-xs font-bold text-slate-500">المساحة</div>
                      </div>
                    </div>
                  )}

                  {effectiveLocation ? (
                    effectiveLocation.source === "gps" ? (
                      <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-2xl flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-purple-500 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <Navigation className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-black text-purple-900 font-mono truncate" dir="ltr" title={`${effectiveLocation.lat.toFixed(4)}, ${effectiveLocation.lng.toFixed(4)}`}>
                            {effectiveLocation.lat.toFixed(4)}, {effectiveLocation.lng.toFixed(4)}
                          </div>
                          <div className="text-xs font-bold text-slate-500">نطاق الشارع (GPS)</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-black text-amber-900 truncate" title={effectiveLocation.name}>
                            {effectiveLocation.name}
                          </div>
                          <div className="text-xs font-bold text-amber-700">موقع تقريبي (معلم)</div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">غير محدد</div>
                        <div className="text-xs font-bold text-slate-500">الموقع الجغرافي</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlights Badges */}
                {(() => {
                  const highlights = extractPropertyHighlights(selectedProperty);
                  return (highlights.floors || highlights.finishing || highlights.tags.length > 0) ? (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {highlights.floors && (
                        <span className="bg-blue-100 text-blue-900 text-sm font-bold px-3.5 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 shadow-sm">
                          <Building className="w-4 h-4 text-blue-600" />
                          {highlights.floors}
                        </span>
                      )}
                      {highlights.finishing && (
                        <span className="bg-emerald-100 text-emerald-900 text-sm font-bold px-3.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                          <Check className="w-4 h-4 text-emerald-600" />
                          {highlights.finishing}
                        </span>
                      )}
                      {highlights.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-amber-100 text-amber-900 text-sm font-bold px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}

                {/* Main Split: 2 Columns on desktop (65% Content / 35% Sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left Column: Details, Facilities, Map, Reviews (2 cols) */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Description Section */}
                    <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80">
                      <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        وصف العقار
                      </h3>
                      <p className="text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-line font-medium">
                        {selectedProperty.description || "لا يوجد وصف إضافي لهذا العقار."}
                      </p>
                    </div>

                    {/* Nearby Facilities Section */}
                    {effectiveLocation ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Compass className="w-5 h-5 text-emerald-600" />
                                المرافق والأماكن القريبة
                              </h3>
                              {effectiveLocation.source === "gps" ? (
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shadow-xs">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                  مؤشر خدمات الحي • نطاق الشارع
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/90 flex items-center gap-1 shadow-xs">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                  موقع تقريبي بناءً على: {effectiveLocation.name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              مسافات وزمن الوصول بالسيارة والدراجة والمشي
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={handleGetUserLocation}
                              className="text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Navigation className="w-4 h-4" />
                              {userLocation ? "المسافة من موقعك الحالي" : "حساب من موقعي"}
                            </button>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${effectiveLocation.lat},${effectiveLocation.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Map className="w-4 h-4" />
                              الاتجاهات عبر الخريطة
                            </a>
                          </div>
                        </div>

                        {/* High-Trust Neighborhood Banner */}
                        {effectiveLocation.source === "landmark" ? (
                          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xs">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                              <span className="font-bold">موقع تقريبي استناداً إلى ({effectiveLocation.name}): </span>
                              تم استخراج المعلم المذكور في بيانات العقار وحساب المسافات وأوقات الوصول تقريبياً بناءً عليه لعدم توفر إحداثيات GPS مباشرة.
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xs">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                              <span className="font-bold text-slate-900">مؤشر خدمات الحي: </span>
                              مسافات وتقديرات مدروسة وفق نطاق الشارع، لتمنحك تصوّراً شاملاً عن حيوية المنطقة وسهولة الوصول لأهم الخدمات قبل المعاينة على الطبيعة.
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {Object.entries(nearbyFacilities).map(([category, facilities]) => {
                            const isExpanded = expandedCategories[category] !== false;
                            return (
                              <div key={category} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <button
                                  onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !isExpanded }))}
                                  className="w-full flex justify-between items-center p-4 bg-slate-50/80 hover:bg-slate-100 transition-colors"
                                >
                                  <span className="font-black text-slate-800 text-base flex items-center gap-2">
                                    {category}
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                      {facilities.length} مكان
                                    </span>
                                  </span>
                                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                </button>
                                
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="border-t border-slate-100 divide-y divide-slate-100"
                                    >
                                      <div className="p-3 sm:p-4 space-y-2.5">
                                        {facilities.slice(0, 5).map(fac => (
                                          <div key={fac.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-slate-50/60 rounded-xl hover:bg-slate-100/80 transition-colors border border-slate-100">
                                            <div className="min-w-0">
                                              <h4 className="font-bold text-slate-900 text-base leading-snug">{fac.nameAr}</h4>
                                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
                                                <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span className="font-bold text-slate-700">يبعد {fac.distance < 1000 ? `${Math.round(fac.distance)} متر` : `${(fac.distance / 1000).toFixed(1)} كم`}</span>
                                                <span className="text-slate-300">•</span>
                                                <span>باتجاه {fac.direction}</span>
                                              </div>
                                            </div>

                                            {/* Transport Time Badges with whitespace-nowrap and clean icons */}
                                            <div className="flex items-center gap-2 text-xs font-bold shrink-0 flex-wrap">
                                              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap shadow-2xs">
                                                <Car className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{fac.drivingTime}</span>
                                              </span>
                                              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap shadow-2xs">
                                                <Bike className="w-3.5 h-3.5 text-blue-600" />
                                                <span>{fac.cyclingTime}</span>
                                              </span>
                                              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap shadow-2xs">
                                                <Footprints className="w-3.5 h-3.5 text-amber-600" />
                                                <span>{fac.walkingTime}</span>
                                              </span>
                                            </div>
                                          </div>
                                        ))}

                                        {facilities.length > 5 && (
                                          <div className="text-center pt-2">
                                            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
                                              و {facilities.length - 5} أماكن إضافية في نفس الفئة...
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 text-center space-y-3">
                        <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800">لم يتم تحديد موقع جغرافي لهذا العقار بعد</h4>
                        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                          لم يسجل المعلن إحداثيات GPS مباشرة للعقار ولم يتم رصد معلم رئيسي محدد في الوصف. يمكنك التواصل مع المعلن مباشرة لتحديد موقع العقار والمعاينة.
                        </p>
                      </div>
                    )}

                    {/* Google Map View */}
                    {effectiveLocation && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Map className="w-5 h-5 text-emerald-600" />
                            الموقع على الخريطة
                          </h3>
                          {effectiveLocation.source === "landmark" && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              تقريبي استناداً إلى: {effectiveLocation.name}
                            </span>
                          )}
                        </div>
                        <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps?q=${effectiveLocation.lat},${effectiveLocation.lng}&hl=ar&z=15&output=embed`}
                            allowFullScreen
                            title="Property Map Location"
                          ></iframe>
                        </div>
                      </div>
                    )}

                    {/* Reviews Section */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        التقييمات والآراء
                      </h3>
                      
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-800 mb-3">أضف تقييمك للعقار</h4>
                        <div className="flex items-center gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setNewRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110 p-1"
                              title={`${star} نجوم`}
                            >
                              <Star className={`w-7 h-7 ${newRating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea 
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="شاركنا رأيك أو استفسارك حول هذا العقار..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none mb-3 font-medium"
                          rows={2}
                        ></textarea>
                        <button
                          onClick={handleAddReview}
                          disabled={newRating === 0}
                          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-sm"
                        >
                          نشر التقييم
                        </button>
                      </div>

                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {reviews[selectedProperty.id] && reviews[selectedProperty.id].length > 0 ? (
                          reviews[selectedProperty.id].map(review => (
                            <div key={review.id} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className={`w-3.5 h-3.5 ${review.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-slate-400 font-medium">{review.date}</span>
                              </div>
                              {review.comment && (
                                <p className="text-slate-700 text-sm mt-1.5 leading-relaxed font-medium">{review.comment}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-slate-400 text-sm py-4 font-semibold">لا توجد تقييمات حتى الآن. كن أول من يقيّم هذا العقار!</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Sidebar): Contact & Action Card (1 col) */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Owner & Direct Contact Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5 sticky top-4">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">بيانات البائع المباشر</span>
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-bold shadow-inner">
                            <User className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-tight">{selectedProperty.owner?.name || "معلن موثوق"}</p>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                              <Check className="w-3 h-3" /> بائع موثق بالمنصة
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <a 
                          href={`https://wa.me/20${(selectedProperty.owner?.phone || "01279549739").replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
                        >
                          <MessageCircle className="w-5 h-5 fill-white" />
                          <span dir="ltr">واتساب: {selectedProperty.owner?.phone || "01279549739"}</span>
                        </a>

                        {selectedProperty.owner?.callPhone && (
                          <a 
                            href={`tel:${selectedProperty.owner.callPhone}`}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:scale-[1.02]"
                          >
                            <Phone className="w-5 h-5" />
                            <span dir="ltr">اتصال: {selectedProperty.owner.callPhone}</span>
                          </a>
                        )}
                      </div>

                      {/* Quick Comparison Action inside Modal */}
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedForComparison(prev => 
                              prev.includes(selectedProperty.id) 
                                ? prev.filter(id => id !== selectedProperty.id)
                                : [...prev, selectedProperty.id]
                            );
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border text-sm ${
                            selectedForComparison.includes(selectedProperty.id)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {selectedForComparison.includes(selectedProperty.id) ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              تمت الإضافة لقائمة المقارنة
                            </>
                          ) : (
                            <>
                              <Scale className="w-4 h-4 text-slate-600" />
                              إضافة العقار للمقارنة
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
