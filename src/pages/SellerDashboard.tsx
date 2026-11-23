import DashboardLayout from "../layouts/DashboardLayout";
import { Home, TrendingUp, Users, Eye, PlusCircle, Edit, Trash2, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { extractLandmark, type LandmarkMatch } from "../utils/landmarkMatcher";

export default function SellerDashboard() {
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{name: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/auth");

      const res = await fetch("/api/properties/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyProperties(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العقار؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchProperties();
    } catch (error) {
      console.error(error);
    }
  };

  const totalViews = myProperties.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLeads = myProperties.reduce((sum, p) => sum + (p.leads || 0), 0);
  const conversionRate = totalViews > 0 ? Math.round((totalLeads / totalViews) * 100) : 0;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropertyLocation, setNewPropertyLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const [newPropertyForm, setNewPropertyForm] = useState({
    title: "",
    location: "",
    price: "",
    area: "",
    description: "",
    type: "منزل",
    status: "للبيع",
  });

  // كشف المعلم من العنوان أو الوصف تلقائياً في حال عدم تفعيل GPS
  const detectedLandmark = useMemo<LandmarkMatch | null>(() => {
    if (locationStatus === "success" && newPropertyLocation) return null;
    const fullText = [newPropertyForm.title, newPropertyForm.location, newPropertyForm.description]
      .filter(Boolean)
      .join(" ");
    return extractLandmark(fullText);
  }, [newPropertyForm.title, newPropertyForm.location, newPropertyForm.description, locationStatus, newPropertyLocation]);

  const handleGetCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("متصفحك لا يدعم تحديد الموقع الجغرافي.");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewPropertyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("success");
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationStatus("error");
      },
      {
        enableHighAccuracy: true,   // يطلب أعلى دقة ممكنة من GPS الجهاز
        timeout: 15000,             // ينتظر حتى 15 ثانية
        maximumAge: 0,              // لا يقبل موقع مخزن مؤقتاً - يأخذ موقع جديد دائماً
      }
    );
  };

  const handleAddProperty = async () => {
    if (!newPropertyForm.title.trim()) {
      setSubmitError("يرجى إدخال اسم العقار.");
      return;
    }
    setSubmitStatus("loading");
    setSubmitError("");
    try {
      const token = localStorage.getItem("token");

      // الأولوية: GPS الحقيقي -> المعلم المكتشف من النص -> null
      const finalLat = newPropertyLocation
        ? newPropertyLocation.lat
        : detectedLandmark
        ? detectedLandmark.coordinates.lat
        : null;
      const finalLng = newPropertyLocation
        ? newPropertyLocation.lng
        : detectedLandmark
        ? detectedLandmark.coordinates.lng
        : null;

      const payload = {
        title: newPropertyForm.title.trim(),
        location: newPropertyForm.location.trim() || "كفر البطيخ",
        price: Number(newPropertyForm.price) || 0,
        area: Number(newPropertyForm.area) || 0,
        description: newPropertyForm.description.trim(),
        type: newPropertyForm.type,
        status: newPropertyForm.status,
        statusType: newPropertyForm.status,
        image: "/property.jpg",
        images: ["/property.jpg"],
        latitude: finalLat,
        longitude: finalLng,
      };
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "حدث خطأ أثناء الإضافة");
      }
      setSubmitStatus("success");
      setTimeout(() => {
        setShowAddModal(false);
        setSubmitStatus("idle");
        setNewPropertyLocation(null);
        setLocationStatus("idle");
        setNewPropertyForm({ title: "", location: "", price: "", area: "", description: "", type: "منزل", status: "للبيع" });
        fetchProperties();
      }, 1500);
    } catch (err: any) {
      setSubmitStatus("error");
      setSubmitError(err.message || "حدث خطأ غير متوقع.");
    }
  };

  return (
    <DashboardLayout role="seller">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك، أ. {user?.name || "المستخدم"} 📊</h1>
          <p className="text-slate-400">إليك ملخص أداء عقاراتك المعروضة.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20">
          <PlusCircle className="w-5 h-5" />
          إضافة عقار جديد
        </button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400">
              <Home className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">إجمالي العقارات</p>
          <h3 className="text-2xl font-bold text-white">{myProperties.length}</h3>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">المشاهدات الكلية</p>
          <h3 className="text-2xl font-bold text-white">{totalViews}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">العملاء المحتملين</p>
          <h3 className="text-2xl font-bold text-white">{totalLeads}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-500/20 p-3 rounded-xl text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">معدل التحويل</p>
          <h3 className="text-2xl font-bold text-white">{conversionRate}%</h3>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">عقاراتي</h2>
          <a href="#" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">عرض الكل</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-950/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">العقار</th>
                <th className="px-6 py-4 font-medium">السعر</th>
                <th className="px-6 py-4 font-medium">المشاهدات</th>
                <th className="px-6 py-4 font-medium">العملاء</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {myProperties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={property.image} alt={property.title} className="w-12 h-12 rounded-lg object-cover" />
                      <span className="font-medium text-white">{property.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-400">{property.price}</td>
                  <td className="px-6 py-4 text-slate-300">{property.views}</td>
                  <td className="px-6 py-4 text-slate-300">{property.leads}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === "نشط" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors" title="تعديل">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">إضافة عقار جديد</h2>
              <button 
                onClick={() => { setShowAddModal(false); setSubmitStatus("idle"); setSubmitError(""); setLocationStatus("idle"); setNewPropertyLocation(null); }} 
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
            
            {submitStatus === "success" ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                <p className="text-xl font-black text-white">تم نشر العقار بنجاح! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* اسم العقار */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">اسم العقار *</label>
                  <input
                    type="text"
                    value={newPropertyForm.title}
                    onChange={e => setNewPropertyForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="مثال: منزل 3 أدوار متشطب"
                  />
                </div>

                {/* الموقع النصي */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">الموقع (الحي / المنطقة)</label>
                  <input
                    type="text"
                    value={newPropertyForm.location}
                    onChange={e => setNewPropertyForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="مثال: كفر البطيخ - عند الكباس"
                  />
                </div>

                {/* السعر والمساحة */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">السعر (ج.م)</label>
                    <input
                      type="number"
                      value={newPropertyForm.price}
                      onChange={e => setNewPropertyForm(p => ({ ...p, price: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="1500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">المساحة (م²)</label>
                    <input
                      type="number"
                      value={newPropertyForm.area}
                      onChange={e => setNewPropertyForm(p => ({ ...p, area: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* النوع والحالة */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">نوع العقار</label>
                    <select
                      value={newPropertyForm.type}
                      onChange={e => setNewPropertyForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option>منزل</option>
                      <option>شقة</option>
                      <option>أرض</option>
                      <option>تجاري</option>
                      <option>مصنع</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">حالة العرض</label>
                    <select
                      value={newPropertyForm.status}
                      onChange={e => setNewPropertyForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option>للبيع</option>
                      <option>للإيجار</option>
                    </select>
                  </div>
                </div>

                {/* الوصف */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">وصف العقار</label>
                  <textarea
                    value={newPropertyForm.description}
                    onChange={e => setNewPropertyForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium resize-none"
                    placeholder="اكتب وصفاً تفصيلياً للعقار..."
                  />
                </div>

                {/* زر GPS - القلب النابض */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    موقع العقار الجغرافي (GPS) — <span className="text-slate-500 font-medium">اختياري</span>
                  </label>
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={locationStatus === "loading"}
                    className={`w-full flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold transition-all border ${
                      locationStatus === "success"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : locationStatus === "error"
                        ? "bg-red-500/10 border-red-500/50 text-red-400"
                        : "bg-slate-800/90 hover:bg-slate-800 border-emerald-500/40 text-emerald-400"
                    }`}
                  >
                    {locationStatus === "loading" ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />جاري تحديد الموقع...</>
                    ) : locationStatus === "success" ? (
                      <><CheckCircle2 className="w-5 h-5" />تم تحديد الموقع بنجاح ✓</>
                    ) : locationStatus === "error" ? (
                      <><AlertCircle className="w-5 h-5" />فشل التحديد – اضغط مرة أخرى</>
                    ) : (
                      <><MapPin className="w-5 h-5" />📍 تحديد موقع العقار الحالي (GPS)</>
                    )}
                  </button>

                  {/* حالة الموقع والمعلم المكتشف */}
                  {locationStatus === "success" && newPropertyLocation ? (
                    <div className="mt-2 text-xs rounded-xl p-3 border bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
                      <span className="font-mono font-bold">
                        📌 إحداثيات GPS الدقيقة: {newPropertyLocation.lat.toFixed(6)}, {newPropertyLocation.lng.toFixed(6)}
                      </span>
                    </div>
                  ) : detectedLandmark ? (
                    <div className="mt-2 text-xs rounded-xl p-3 border bg-blue-500/10 border-blue-500/30 text-blue-300 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block mb-0.5">
                          🎯 تم رصد المعلم: "{detectedLandmark.name}" تلقائياً!
                        </span>
                        <span>
                          سيتم استخدام إحداثيات هذا المعلم كموقع تقريبي وعرض الخدمات القريبة منه للمشترين ما لم تحدد موقع الـ GPS بنفسك.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs rounded-xl p-3 border bg-amber-500/10 border-amber-500/30 text-amber-300">
                      <span>
                        💡 <strong>مستحسن:</strong> افتح الصفحة على موبايلك وأنت <strong>واقف داخل العقار</strong>، ثم اضغط الزر للحصول على أدق موقع ممكن. يمكن أيضاً كتابة اسم معلم أو شارع معروف في الوصف (مثل: "عند الكباس").
                      </span>
                    </div>
                  )}
                </div>

                {/* رسالة الخطأ */}
                {submitError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* زر الحفظ */}
                <button
                  onClick={handleAddProperty}
                  disabled={submitStatus === "loading"}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black py-3.5 rounded-xl transition-all mt-2 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {submitStatus === "loading" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />جاري النشر...</>
                  ) : (
                    "حفظ ونشر العقار"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
