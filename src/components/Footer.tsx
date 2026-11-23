import { Home, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Send } from "lucide-react";
import { motion } from "motion/react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 pt-24 pb-12 border-t border-slate-900 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-[100%] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Newsletter Section */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 text-center md:text-right">
            <h3 className="text-2xl font-bold text-white mb-2">اشترك في النشرة الإخبارية</h3>
            <p className="text-slate-400">احصل على أحدث عروض العقارات في كفر البطيخ مباشرة في بريدك الإلكتروني.</p>
          </div>
          <div className="w-full md:w-1/2">
            <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="أدخل بريدك الإلكتروني..." 
                className="w-full bg-slate-950 border border-slate-700 rounded-full py-4 px-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-white"
                dir="rtl"
              />
              <button 
                type="submit" 
                className="absolute left-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full flex items-center justify-center transition-transform hover:scale-105"
              >
                <Send className="w-5 h-5 -ml-1 rotate-180" />
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">عقارات</h2>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-8 text-slate-400">
              بوابتك الأولى للبحث عن العقارات المميزة في مدينة كفر البطيخ ومحافظة دمياط. نقدم لك أفضل العروض بأسعار تنافسية وتقنيات حديثة.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-6">روابط سريعة</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-400 flex items-center gap-2 transition-colors before:content-[''] before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full"><span className="mt-1">الرئيسية</span></a></li>
              <li><a href="#listings" className="hover:text-emerald-400 flex items-center gap-2 transition-colors before:content-[''] before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full"><span className="mt-1">العقارات للبيع</span></a></li>
              <li><a href="#listings" className="hover:text-emerald-400 flex items-center gap-2 transition-colors before:content-[''] before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full"><span className="mt-1">العقارات للإيجار</span></a></li>
              <li><a href="#ai-assistant" className="hover:text-emerald-400 flex items-center gap-2 transition-colors before:content-[''] before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full"><span className="mt-1">المساعد الذكي</span></a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-6">مناطق التغطية</h3>
            <ul className="space-y-4 text-sm">
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer block">السوق الرئيسي</span></li>
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer block">شارع المحطة</span></li>
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer block">بجوار النادي</span></li>
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer block">طريق الميناء</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-6">تواصل معنا</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">كفر البطيخ، الشارع الرئيسي، محافظة دمياط، مصر</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span dir="ltr" className="hover:text-emerald-400 transition-colors cursor-pointer">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span dir="ltr" className="hover:text-emerald-400 transition-colors cursor-pointer">info@kafr-elbatikh.eg</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium">© {new Date().getFullYear()} عقارات. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-emerald-400 transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
