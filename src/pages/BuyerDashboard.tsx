import DashboardLayout from "../layouts/DashboardLayout";
import { Home, Heart, Search, MapPin } from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{name: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      navigate("/auth");
      return;
    }
    if (userStr) setUser(JSON.parse(userStr));
    
    fetchSavedProperties(token);
  }, [navigate]);

  const fetchSavedProperties = async (token: string) => {
    try {
      const res = await fetch("/api/saved-properties", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedProperties(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaved = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/saved-properties/${id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSavedProperties(token!);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout role="buyer">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">مرحباً، {user?.name || "المستخدم"} 👋</h1>
        <p className="text-slate-400">إليك نظرة عامة على نشاطك وعقاراتك المفضلة.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
          <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30 text-emerald-400">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">العقارات المفضلة</p>
            <h3 className="text-3xl font-bold text-white">{savedProperties.length}</h3>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30 text-blue-400">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">عمليات البحث المحفوظة</p>
            <h3 className="text-3xl font-bold text-white">0</h3>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
          <div className="bg-amber-500/20 p-4 rounded-2xl border border-amber-500/30 text-amber-400">
            <Home className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">عقارات تمت زيارتها</p>
            <h3 className="text-3xl font-bold text-white">0</h3>
          </div>
        </div>
      </div>

      {/* Saved Properties */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">آخر العقارات المفضلة</h2>
          <a href="#" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">عرض الكل</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
            <div key={property.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button 
                  onClick={() => toggleSaved(property.id)}
                  className="absolute top-4 left-4 p-2 bg-slate-900/80 backdrop-blur-md rounded-full text-emerald-500 hover:bg-slate-900 transition-colors">
                  <Heart className="w-5 h-5 fill-emerald-500" />
                </button>
                <div className="absolute bottom-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-emerald-500/30">
                  {property.price}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">{property.title}</h3>
                <div className="flex items-center text-slate-400 text-sm mb-4">
                  <MapPin className="w-4 h-4 ml-1 text-emerald-500" />
                  {property.location}
                </div>
                <div className="flex justify-between items-center py-4 border-t border-slate-800">
                  <div className="text-center">
                    <span className="block text-slate-400 text-xs mb-1">غرف النوم</span>
                    <span className="font-bold text-white">{property.beds}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="text-center">
                    <span className="block text-slate-400 text-xs mb-1">الحمامات</span>
                    <span className="font-bold text-white">{property.baths}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="text-center">
                    <span className="block text-slate-400 text-xs mb-1">المساحة</span>
                    <span className="font-bold text-white">{property.area}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
