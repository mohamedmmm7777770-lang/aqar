import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Home, Mail, Lock, User, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

export default function Auth({ defaultMode = "login" }: { defaultMode?: "login" | "register" }) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = mode === "register" 
        ? { name, email, password, role } 
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "buyer") {
        navigate("/dashboard/buyer");
      } else {
        navigate("/dashboard/seller");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "buyer") {
        navigate("/dashboard/buyer");
      } else {
        navigate("/dashboard/seller");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <Link to="/" className="absolute top-8 right-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10 group">
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        العودة للرئيسية
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
            <Home className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h1>
        <p className="text-center text-slate-400 mb-8 text-sm">
          {mode === "login" ? "مرحباً بعودتك إلى عقارات" : "انضم إلينا وابدأ رحلتك العقارية"}
        </p>

        {/* Toggle Mode */}
        <div className="flex bg-slate-950 rounded-xl p-1 mb-8 border border-slate-800">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "login" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            دخول
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "register" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            حساب جديد
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${role === "buyer" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"}`}
                  >
                    <User className="w-6 h-6" />
                    <span className="text-sm font-medium">مشتري / باحث</span>
                    {role === "buyer" && <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-emerald-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all relative ${role === "seller" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"}`}
                  >
                    <Briefcase className="w-6 h-6" />
                    <span className="text-sm font-medium">بائع / مالك</span>
                    {role === "seller" && <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-emerald-500" />}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الكامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-3 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-3 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950" />
                <label htmlFor="remember-me" className="mr-2 block text-sm text-slate-400">تذكرني</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">نسيت كلمة المرور؟</a>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 transition-all mt-6 disabled:opacity-50"
          >
            {loading ? "جاري التحميل..." : (mode === "login" ? "دخول" : "تسجيل")}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">أو المتابعة باستخدام</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError("فشل تسجيل الدخول بحساب جوجل");
                }}
                text={mode === "login" ? "signin_with" : "signup_with"}
              />
            </div>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-slate-700 rounded-xl shadow-sm bg-slate-950 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="mr-2">Facebook</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
