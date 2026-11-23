import Scene from './Scene';
import { motion } from 'motion/react';
import { Home, Star } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-slate-900 overflow-hidden min-h-[90vh] flex items-center pt-20">
      {/* Grid background for tech vibe */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Decorative Glow */}
      <div className="absolute top-1/4 -right-64 w-96 h-96 bg-emerald-500/30 rounded-full blur-[128px] animate-pulse-glow"></div>
      <div className="absolute bottom-0 -left-64 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center w-full z-10 gap-12 py-12">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center lg:text-right pt-10 lg:pt-0 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-emerald-400 border border-emerald-500/30 text-sm font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            تجربة ثلاثية الأبعاد
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            المستقبل العقاري في <br/>
            <span className="text-gradient">كفر البطيخ</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            أحدث التقنيات لاستكشاف العقارات. تصفح نماذج ثلاثية الأبعاد، واستشر المساعد الذكي المدعوم بخرائط جوجل لاختيار بيتك المثالي في محافظة دمياط.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#listings" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
              اكتشف العقارات
            </a>
            <a href="#ai-assistant" className="glass-dark hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
              المساعد الذكي
            </a>
          </div>

          {/* Floating Stat Card */}
          <motion.div 
            className="hidden md:flex absolute -bottom-12 -right-12 glass-effect p-4 rounded-2xl items-center gap-4 animate-float"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <Star className="w-6 h-6 fill-emerald-500 text-emerald-500" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">100+</p>
              <p className="text-sm font-semibold text-slate-600">عقار متاح الآن</p>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Scene Canvas */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex-1 w-full h-[500px] lg:h-[700px] relative cursor-grab active:cursor-grabbing"
        >
          <Scene />
        </motion.div>
      </div>
    </div>
  );
}
