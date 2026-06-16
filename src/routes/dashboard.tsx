import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home, FolderOpen, ScanLine, User, Scale, MessageCircle,
  GraduationCap, Settings, Search, HelpCircle,
  Brain, FlaskConical, Sparkles, Sliders,
  AlertTriangle, Clock, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: LuxuryDashboard,
});

// Glassmorphism card — explicit Tailwind utilities, strong blur
function LuxuryCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#0f0f0f]/40 backdrop-blur-2xl backdrop-saturate-150 border border-[#D4AF37]/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  );
}

function SOSLogo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-full border border-[#D4AF37]/40 bg-gradient-to-tr from-[#D4AF37] via-[#AA841A] to-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.35)] ${className}`}
    >
      <span className="text-black font-black tracking-tighter text-sm">SOS</span>
    </div>
  );
}

function LuxuryDashboard() {
  const sideItems = [
    { icon: Home, to: "/", label: "Home" },
    { icon: FolderOpen, to: "/history", label: "Cases" },
    { icon: ScanLine, to: "/scan", label: "Scan" },
    { icon: User, to: "/profile", label: "Profile" },
    { icon: Scale, to: "/compare", label: "Compare" },
    { icon: MessageCircle, to: "/chat", label: "Chat" },
    { icon: GraduationCap, to: "/academy", label: "Academy" },
    { icon: Settings, to: "/settings", label: "Settings" },
  ] as const;

  const features = [
    { title: "AI Skin Analysis", icon: Brain, to: "/scan" },
    { title: "Product Comparison", icon: Sparkles, to: "/compare" },
    { title: "Harmful Ingredients", icon: FlaskConical, to: "/conflicts" },
    { title: "Personalized Routine", icon: Sliders, to: "/builder" },
  ] as const;

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Ambient gold glow blobs to make the blur obvious */}
      <div className="fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/20 blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#AA841A]/15 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-[450px] h-[450px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />

      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.04]">
        <span className="text-[420px] font-black text-[#D4AF37] leading-none select-none">SOS</span>
      </div>

      {/* Sidebar — glassmorphism */}
      <nav className="fixed left-4 top-10 bottom-24 w-16 bg-[#0f0f0f]/40 backdrop-blur-2xl backdrop-saturate-150 border border-[#D4AF37]/20 rounded-3xl flex flex-col items-center py-6 gap-6 z-20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <SOSLogo className="w-10 h-10 mb-2" />
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
        {sideItems.map(({ icon: Icon, to, label }) => (
          <Link
            key={label}
            to={to}
            aria-label={label}
            className="text-gray-500 hover:text-[#D4AF37] transition-all hover:scale-110"
          >
            <Icon size={22} strokeWidth={1.5} />
          </Link>
        ))}
      </nav>

      {/* Main */}
      <main className="ml-24 mr-8 pt-10 pb-28 relative z-10">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 bg-[#0f0f0f]/60 backdrop-blur-md flex items-center justify-center">
              <SOSLogo className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-[#D4AF37] tracking-widest">S.O.SKIN</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">
                Skin Investigation Office
              </p>
            </div>
          </div>

          <Link to="/profile" className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">Omar Soliman</p>
              <p className="text-[10px] text-[#D4AF37]">Chief Skin Investigator</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#0f0f0f]/60 backdrop-blur-md border border-[#D4AF37]/30 grid place-items-center">
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </Link>
        </header>

        {/* SOS Mode — Emergency call-to-action */}
        <Link
          to="/sos"
          aria-label="SOS Mode — 48 Hour Rescue Plan"
          className="group relative block mb-6 overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-r from-red-950/60 via-[#0f0f0f]/60 to-red-950/40 backdrop-blur-2xl backdrop-saturate-150 p-6 shadow-[0_8px_32px_rgba(220,38,38,0.25)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:border-red-500/70 transition-all"
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-red-500/20 blur-[80px] pointer-events-none" />
          <div className="relative flex items-center gap-5">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 border border-red-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.5)] animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-bold">Emergency</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock size={10} /> 48h Rescue Plan
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-widest text-red-500 font-mono">SOS MODE</h2>
              <p className="text-xs text-gray-300 mt-1">إنقاذ فورى — خطة طوارئ وخطوات سريعة لبشرتك</p>
            </div>
            <ChevronRight className="w-6 h-6 text-red-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>

        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-8 grid grid-cols-2 gap-6">
            <LuxuryCard className="h-48 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-[#D4AF37] font-serif text-xs tracking-widest uppercase">
                    Active Case
                  </h2>
                  <span className="text-gray-500">…</span>
                </div>
                <p className="text-lg font-bold mt-2">Hand Breakouts Investigation</p>
              </div>
              <Link
                to="/scan"
                className="w-28 py-2 border border-[#D4AF37]/40 rounded-full text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all text-center"
              >
                View Case
              </Link>
            </LuxuryCard>

            <LuxuryCard className="h-48 flex flex-col justify-between">
              <div>
                <h2 className="text-[#D4AF37] font-serif text-xs tracking-widest uppercase flex items-center gap-2">
                  <HelpCircle size={14} /> Skin Question
                </h2>
                <p className="text-sm mt-3 text-gray-400">
                  Why do I have acne and uneven skin?
                </p>
              </div>
              <Link
                to="/chat"
                className="w-full py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-[10px] uppercase tracking-widest text-center hover:bg-[#D4AF37]/20 transition-all"
              >
                Find Answers
              </Link>
            </LuxuryCard>
          </div>

          <LuxuryCard className="col-span-4 h-48 flex flex-col justify-between">
            <div>
              <h2 className="text-[#D4AF37] font-serif text-xs tracking-widest uppercase">
                Skin Clue
              </h2>
              <p className="text-sm mt-4 text-gray-400">Breakouts on hands?</p>
            </div>
            <Link
              to="/trust"
              className="w-full py-2 border border-[#D4AF37]/30 rounded-xl text-[10px] uppercase tracking-widest text-center hover:bg-[#D4AF37]/10 transition-all"
            >
              Find Answers
            </Link>
          </LuxuryCard>

          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="col-span-3 h-40 bg-[#0f0f0f]/40 backdrop-blur-2xl backdrop-saturate-150 border border-[#D4AF37]/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex flex-col items-center justify-center gap-4 text-center hover:border-[#D4AF37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all cursor-pointer"
            >
              <feature.icon size={32} className="text-[#D4AF37]/80" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider">{feature.title}</h3>
            </Link>
          ))}
        </div>
      </main>

      {/* Bottom Nav — glassmorphism */}
      <div className="fixed bottom-6 left-24 right-8 h-20 bg-[#0f0f0f]/40 backdrop-blur-2xl backdrop-saturate-150 border border-[#D4AF37]/20 rounded-full flex items-center justify-around px-8 z-30 shadow-[0_8px_32px_rgba(212,175,55,0.15)]">
        <Link to="/" aria-label="Home">
          <Home className="text-[#D4AF37]" size={24} />
        </Link>
        <Link to="/compare" aria-label="Search">
          <Search className="text-gray-500 hover:text-[#D4AF37] transition-colors" size={24} />
        </Link>

        <Link to="/sos" aria-label="SOS" className="-mt-16 group cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#AA841A] to-[#D4AF37] p-1 shadow-[0_0_30px_rgba(212,175,55,0.5)]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <span className="text-xl font-black text-[#D4AF37]">SOS</span>
            </div>
          </div>
        </Link>

        <Link to="/academy" aria-label="Academy">
          <GraduationCap className="text-gray-500 hover:text-[#D4AF37] transition-colors" size={24} />
        </Link>
        <Link to="/profile" aria-label="Profile">
          <User className="text-gray-500 hover:text-[#D4AF37] transition-colors" size={24} />
        </Link>
      </div>
    </div>
  );
}
