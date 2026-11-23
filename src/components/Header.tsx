import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "العقارات المتاحة", href: "/#listings" },
    { name: "المساعد الذكي", href: "/#ai-assistant" },
    { name: "اتصل بنا", href: "/#contact" },
  ];

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-950/80 backdrop-blur-xl shadow-2xl py-3 border-b border-white/10 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <Home className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">عقارات</h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  كفر البطيخ
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide">المنصة العقارية الموثقة</span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-7 font-bold">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="text-slate-300 hover:text-emerald-400 transition-colors relative group text-sm py-1 font-semibold"
              >
                {link.name}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-slate-300 hover:text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              تسجيل الدخول
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20"
            >
              حساب جديد
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 lg:hidden"
          >
            <div className="flex flex-col h-full p-4 sm:p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2 rounded-xl">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">القائمة</h2>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex flex-col gap-2 text-base font-semibold flex-1 overflow-y-auto">
                {navLinks.map((link, i) => (
                  <motion.a 
                    key={link.name}
                    href={link.href}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto border-t border-slate-800 pt-6 space-y-3"
              >
                <button onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }} className="w-full bg-slate-800 hover:bg-slate-700 py-3 sm:py-4 rounded-xl font-bold transition-all text-base">
                  تسجيل الدخول
                </button>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate("/register"); }} className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 sm:py-4 rounded-xl font-bold transition-all text-base shadow-lg shadow-emerald-500/20">
                  إنشاء حساب جديد
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
