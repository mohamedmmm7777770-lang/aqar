import Header from "../components/Header";
import Listings from "../components/Listings";
import AIChat from "../components/AIChat";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-16 sm:pt-20">
        <Listings />
        <AIChat />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
