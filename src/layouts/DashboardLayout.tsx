import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Home, LayoutDashboard, Heart, Search, MessageSquare, PlusCircle, BarChart3, Settings, LogOut, Menu, X, Bell, User } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "buyer" | "seller";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch(e){}
    }
  }, []);

  const buyerLinks = [
    { name: "الرئيسية", path: "/dashboard/buyer", icon: LayoutDashboard },
    { name: "العقارات المفضلة", path: "#", icon: Heart },
    { name: "عمليات البحث", path: "#", icon: Search },
    { name: "الرسائل", path: "#", icon: MessageSquare },
  ];

  const sellerLinks = [
    { name: "الرئيسية", path: "/dashboard/seller", icon: LayoutDashboard },
    { name: "إضافة عقار", path: "#", icon: PlusCircle },
    { name: "عقاراتي", path: "#", icon: Home },
    { name: "الإحصائيات", path: "#", icon: BarChart3 },
    { name: "الطلبات", path: "#", icon: MessageSquare },
  ];

  const links = role === "buyer" ? buyerLinks : sellerLinks;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex" dir="rtl">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 right-0 z-50 w-64 bg-slate-900 border-l border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">عقارات</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800">
            <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">الإعدادات</span>
            </Link>
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all mt-1">
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">تسجيل الخروج</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-2"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.name || "المستخدم"}</p>
                <p className="text-xs text-slate-400">{role === "buyer" ? "مشتري" : "بائع"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-4 lg:p-8 relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-0 w-full h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
