import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, Zap, BarChart3, History, Trophy,
  Upload, Wifi, QrCode, Monitor, CheckCircle2,
  Menu, X, LogIn, LogOut, Users,
  Target, Star, ChevronRight,
} from "lucide-react";
import worshipVideo from "../assets/worship.mp4";
import JoinGameIcon from "../components/icons/JoinGameIcon";
import AiQuizGeneratorIcon from "../components/icons/AiQuizGeneratorIcon";
import StreakMultiplierIcon from "../components/icons/StreakMultiplierIcon";

/* ── Animation variants ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.8, 0.25, 1], delay: d },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const viewOpts = { once: true, margin: "-80px" };

/* ── Floating particles ──────────────────────────────────────────────────── */
const DOTS = [
  { size: 6,  top: "14%", left: "6%",  color: "rgba(139,92,246,0.25)",  dur: "7s",  delay: "0s"   },
  { size: 4,  top: "30%", left: "92%", color: "rgba(251,191,36,0.3)",   dur: "9s",  delay: "2s"   },
  { size: 7,  top: "62%", left: "5%",  color: "rgba(16,185,129,0.22)",  dur: "11s", delay: "1s"   },
  { size: 4,  top: "78%", left: "87%", color: "rgba(139,92,246,0.2)",   dur: "8s",  delay: "3s"   },
  { size: 5,  top: "45%", left: "95%", color: "rgba(251,191,36,0.22)",  dur: "12s", delay: "0.5s" },
  { size: 4,  top: "88%", left: "22%", color: "rgba(139,92,246,0.18)",  dur: "10s", delay: "4s"   },
];

const LandingPage = ({ hostUser, onJoin, onHost, onSolo, onLogin, onLogout }) => {
  const isLoggedIn = useMemo(
    () => !!localStorage.getItem("bb_token") || !!hostUser,
    [hostUser],
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleHost = () => (isLoggedIn ? onHost?.() : onLogin?.());

  /* ── HOW-TO cards ──────────────────────────────────────────────────────── */
  const howCards = [
    {
      title: "Join a Game",
      icon: JoinGameIcon, isCustom: true,
      accent: "#7c3aed", glowClass: "",
      desc: "Enter the 6-digit PIN. No account needed — just your name and you're in.",
      bullets: ["Works on any smartphone", "No app install required", "Unlimited players per room"],
      onClick: () => onJoin?.(),
    },
    {
      title: "Host a Game",
      icon: Monitor, isCustom: false,
      iconBg: "linear-gradient(135deg,#059669,#047857)",
      accent: "#059669", glowClass: "bb-glass-emerald",
      desc: "Log in, select or upload a question set, configure the timer, and share the PIN.",
      bullets: ["AI quiz generator built in", "Upload CSV, PDF, DOCX, or TXT", "Live leaderboard every round"],
      onClick: handleHost,
    },
    {
      title: "Solo Practice",
      icon: Target, isCustom: false,
      iconBg: "linear-gradient(135deg,#d97706,#b45309)",
      accent: "#d97706", glowClass: "bb-glass-amber",
      desc: "No host needed. Choose your testament and difficulty, tackle timed questions.",
      bullets: ["No login required", "Filter by testament & difficulty", "Compete on global leaderboard"],
      onClick: () => onSolo?.(),
    },
  ];

  /* ── FEATURE cards ─────────────────────────────────────────────────────── */
  const features = [
    { icon: AiQuizGeneratorIcon, isCustom: true,  iconBg: "linear-gradient(135deg,#6d28d9,#7c3aed)", title: "AI Quiz Generator",    glow: "",                desc: "Paste a sermon, upload a PDF, or enter any Bible topic — AI writes questions instantly." },
    { icon: QrCode,              isCustom: false, iconBg: "linear-gradient(135deg,#047857,#059669)", title: "Fast Join",             glow: "bb-glass-emerald", desc: "Players scan or enter a PIN in seconds. Works on any camera or browser." },
    { icon: StreakMultiplierIcon, isCustom: true, iconBg: "linear-gradient(135deg,#b45309,#d97706)", title: "Streak Multiplier",     glow: "bb-glass-amber",  desc: "3+ correct answers in a row earns a bonus. Speed scoring rewards fast thinkers." },
    { icon: BarChart3,           isCustom: false, iconBg: "linear-gradient(135deg,#6d28d9,#7c3aed)", title: "Understanding Reports", glow: "",                desc: "Post-game analysis shows what your group understood and what needs revisiting." },
    { icon: History,             isCustom: false, iconBg: "linear-gradient(135deg,#047857,#059669)", title: "Game History",          glow: "bb-glass-emerald", desc: "Archive of past games with per-session report links." },
    { icon: Trophy,              isCustom: false, iconBg: "linear-gradient(135deg,#b45309,#d97706)", title: "Leaderboards",          glow: "bb-glass-amber",  desc: "See top scorers and keep your group coming back week after week." },
    { icon: Upload,              isCustom: false, iconBg: "linear-gradient(135deg,#6d28d9,#7c3aed)", title: "Custom Uploads",        glow: "",                desc: "Upload CSV, PDF, Word (.docx), or plain text question sets." },
    { icon: Wifi,                isCustom: false, iconBg: "linear-gradient(135deg,#047857,#059669)", title: "Reconnection",          glow: "bb-glass-emerald", desc: "Rejoin within a short grace period if you lose connection mid-game." },
  ];

  /* ── TECH badges ───────────────────────────────────────────────────────── */
  const tech = [
    { icon: Zap,          label: "React 18 + Vite",     color: "#7c3aed" },
    { icon: Wifi,         label: "Socket.IO Real-Time", color: "#059669" },
    { icon: BarChart3,    label: "PostgreSQL / Neon",   color: "#d97706" },
    { icon: Brain,        label: "Google Gemini AI",    color: "#7c3aed" },
    { icon: CheckCircle2, label: "JWT + Google OAuth",  color: "#059669" },
    { icon: Monitor,      label: "Vercel + Render",     color: "#d97706" },
  ];

  /* ── STATS ─────────────────────────────────────────────────────────────── */
  const stats = [
    { n: "2.5M+", label: "Questions Answered", color: "#7c3aed" },
    { n: "150+",  label: "Game Categories",    color: "#d97706" },
    { n: "98%",   label: "Smile Rate",         color: "#059669" },
    { n: "450k",  label: "Monthly Players",    color: "#7c3aed" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#ffffff", color: "#1e1b4b" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="bb-nav sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 py-3.5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-baseline gap-0 leading-none font-nunito font-black text-xl tracking-tight"
          >
            <span style={{ color: "#1e1b4b" }}>Bible</span>
            <span style={{ color: "#7c3aed" }}>&nbsp;Banter</span>
          </button>

          <div className="hidden lg:flex gap-7 items-center">
            {[["#play","Play"],["#features","Features"],["#impact","About"],["#tech","Tech"]].map(([h,l]) => (
              <a key={h} href={h}
                className="relative group text-sm font-semibold tracking-wide transition-colors"
                style={{ color: "#6b7280" }}
                onMouseEnter={e => e.target.style.color="#7c3aed"}
                onMouseLeave={e => e.target.style.color="#6b7280"}
              >
                {l}
                <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-0.5 rounded-full transition-all duration-200" style={{ background: "#7c3aed" }} />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={handleHost}
              className="hidden sm:block bb-btn-violet font-nunito font-black text-sm px-5 py-2 rounded-xl">
              Host Game
            </button>
            <button type="button" onClick={() => isLoggedIn ? onLogout?.() : onLogin?.()}
              className="w-9 h-9 rounded-xl bb-glass flex items-center justify-center transition-colors"
              style={{ color: "#6b7280" }}
              title={isLoggedIn ? "Logout" : "Login"}>
              {isLoggedIn ? <LogOut size={16} /> : <LogIn size={16} />}
            </button>
            <button type="button"
              className="lg:hidden w-9 h-9 rounded-xl bb-glass flex items-center justify-center transition-colors"
              style={{ color: "#6b7280" }}
              onClick={() => setMobileMenuOpen(v => !v)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="lg:hidden px-5 pb-5 pt-2 flex flex-col gap-3"
            style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
            {[["#play","Play"],["#features","Features"],["#impact","About"],["#tech","Tech"]].map(([h,l]) => (
              <a key={h} href={h} onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-1 block" style={{ color: "#6b7280" }}>{l}</a>
            ))}
            <button type="button" onClick={() => { setMobileMenuOpen(false); handleHost(); }}
              className="bb-btn-violet font-nunito font-black text-sm px-5 py-2.5 rounded-xl mt-1 w-full">
              Host Game
            </button>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section id="play" className="bb-hero relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center px-5 sm:px-8 py-20 text-center">
        {/* Video (desktop) */}
        <video className="absolute inset-0 w-full h-full object-cover hidden sm:block"
          style={{ zIndex: 0 }} autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src={worshipVideo} type="video/mp4" />
        </video>

        {/* Light overlay — washes video to soft brightness */}
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.82) 0%, rgba(248,247,255,0.88) 100%)", zIndex: 1 }} />

        {/* Dot grid */}
        <div className="bb-grid" aria-hidden="true" style={{ zIndex: 2 }} />

        {/* Soft orbs */}
        <div className="bb-orb bb-orb-v" style={{ top: "-8%",  left: "-6%",  zIndex: 3 }} aria-hidden="true" />
        <div className="bb-orb bb-orb-a" style={{ bottom: "4%", right: "2%",  zIndex: 3 }} aria-hidden="true" />
        <div className="bb-orb bb-orb-e" style={{ top: "38%",  right: "8%",  zIndex: 3 }} aria-hidden="true" />

        {/* Particles */}
        {DOTS.map((d, i) => (
          <div key={i} className="bb-dot" aria-hidden="true" style={{
            width: d.size, height: d.size, top: d.top, left: d.left,
            background: d.color, animationDuration: d.dur, animationDelay: d.delay, zIndex: 3,
          }} />
        ))}

        {/* Content */}
        <motion.div className="relative max-w-4xl w-full" style={{ zIndex: 4 }}
          variants={stagger} initial="hidden" animate="visible">

          <motion.h1 variants={fadeUp} custom={0}
            className="font-nunito font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-6 uppercase"
            style={{ color: "#1e1b4b" }}>
            Live Bible{" "}
            <span className="bb-glow-violet" style={{ color: "#7c3aed" }}>Trivia</span>
            <br />
            <span className="bb-glow-amber" style={{ color: "#d97706" }}>for Churches</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={0.08}
            className="font-nunito font-bold text-lg sm:text-xl mb-3 max-w-2xl mx-auto leading-snug"
            style={{ color: "#374151" }}>
            Turn sermons, Bible studies, and youth group sessions into real-time multiplayer trivia — powered by AI.
          </motion.p>
          <motion.p variants={fadeUp} custom={0.14}
            className="text-sm sm:text-base mb-10 max-w-lg mx-auto" style={{ color: "#9ca3af" }}>
            Unlimited players join via 6-digit PIN. No app install needed.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.2}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12">
            <button type="button" onClick={() => onJoin?.()}
              className="bb-btn-amber font-nunito font-black text-base sm:text-lg px-9 sm:px-12 py-4 sm:py-5 rounded-2xl w-full sm:w-auto uppercase tracking-wide">
              Join a Game
            </button>
            <button type="button" onClick={handleHost}
              className="bb-btn-violet font-nunito font-black text-base sm:text-lg px-9 sm:px-12 py-4 sm:py-5 rounded-2xl w-full sm:w-auto uppercase tracking-wide">
              Host a Game
            </button>
            <button type="button" onClick={() => onSolo?.()}
              className="bb-btn-ghost font-nunito font-black text-base sm:text-lg px-9 sm:px-12 py-4 sm:py-5 rounded-2xl w-full sm:w-auto uppercase tracking-wide">
              Solo Practice
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} custom={0.26}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex -space-x-2.5">
              {[["JN","#7c3aed","#fff"],["MK","#d97706","#fff"],["PA","#059669","#fff"],["LK","#6d28d9","#fff"]].map(([init,bg,fg]) => (
                <div key={init} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-md"
                  style={{ background: bg, color: fg }}>{init}</div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-md bb-stat"
                style={{ background: "#fbbf24", color: "#451a03" }}>+12k</div>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#6b7280" }}>
              Over 12,000 players across churches worldwide
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ zIndex: 4, color: "#c4b5fd" }}>
          <span className="text-xs tracking-widest uppercase font-semibold">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-violet-300 to-transparent" />
        </motion.div>
      </section>

      {/* ── HOW TO GET IN ───────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-7xl mx-auto">
        <motion.div className="text-center mb-14"
          initial="hidden" whileInView="visible" viewport={viewOpts} variants={stagger}>
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#7c3aed" }}>
            Three ways to play
          </motion.p>
          <motion.h2 variants={fadeUp}
            className="font-nunito font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight mb-4"
            style={{ color: "#1e1b4b" }}>
            How to Get in the Game
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-xl mx-auto text-sm sm:text-base" style={{ color: "#6b7280" }}>
            Pick your mode and start in under 60 seconds.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {howCards.map((c, i) => (
            <motion.div key={c.title}
              initial="hidden" whileInView="visible" viewport={viewOpts}
              variants={fadeUp} custom={i * 0.08}
              whileHover={{ y: -6 }}
              className={`bb-glass ${c.glowClass} rounded-2xl p-7 sm:p-8 cursor-pointer flex flex-col`}
              onClick={c.onClick}>
              <div className="mb-5">
                {c.isCustom ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                    <c.icon className="w-full h-full" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: c.iconBg }}>
                    <c.icon size={26} className="text-white" strokeWidth={1.8} />
                  </div>
                )}
              </div>
              <h3 className="font-nunito font-black text-xl uppercase tracking-tight mb-3" style={{ color: "#1e1b4b" }}>
                {c.title}
              </h3>
              <p className="text-sm mb-5 leading-relaxed flex-1" style={{ color: "#6b7280" }}>{c.desc}</p>
              <ul className="space-y-2 mb-6">
                {c.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "#4b5563" }}>
                    <CheckCircle2 size={14} className="shrink-0" style={{ color: c.accent }} />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1.5 text-sm font-bold mt-auto" style={{ color: c.accent }}>
                Get started <ChevronRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="bb-feat-bg py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14"
            initial="hidden" whileInView="visible" viewport={viewOpts} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#7c3aed" }}>
              Packed with power
            </motion.p>
            <motion.h2 variants={fadeUp}
              className="font-nunito font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight mb-4"
              style={{ color: "#1e1b4b" }}>
              Everything Your Group Needs
            </motion.h2>
            <motion.p variants={fadeUp} className="max-w-xl mx-auto text-sm sm:text-base" style={{ color: "#6b7280" }}>
              Packed with features that make Bible study genuinely fun.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial="hidden" whileInView="visible" viewport={viewOpts}
                variants={fadeUp} custom={i * 0.06}
                className={`bb-glass ${f.glow} rounded-2xl p-5 sm:p-6 flex flex-col gap-4`}>
                {f.isCustom ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                    <f.icon className="w-full h-full" />
                  </div>
                ) : (
                  <div className="bb-icon-pill shadow-sm" style={{ background: f.iconBg }}>
                    <f.icon size={22} className="text-white" strokeWidth={1.8} />
                  </div>
                )}
                <div>
                  <h4 className="font-nunito font-black text-base uppercase tracking-tight mb-1.5" style={{ color: "#1e1b4b" }}>
                    {f.title}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT / STATS ──────────────────────────────────────────────── */}
      <section id="impact" className="bb-impact-bg py-20 sm:py-28 px-5 sm:px-8 relative overflow-hidden">
        <div className="bb-orb bb-orb-v" style={{ top: "-5%", right: "-6%", opacity: 0.35 }} aria-hidden="true" />
        <div className="bb-orb bb-orb-a" style={{ bottom: "-5%", left: "-4%", opacity: 0.3 }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Stats card */}
            <motion.div initial="hidden" whileInView="visible" viewport={viewOpts} variants={fadeUp}>
              <div className="bb-glass rounded-3xl p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bb-icon-pill shadow-sm" style={{ background: "linear-gradient(135deg,#6d28d9,#7c3aed)" }}>
                    <Users size={22} className="text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-nunito font-black text-lg" style={{ color: "#1e1b4b" }}>Church Communities</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>Worldwide impact</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  {stats.map(s => (
                    <div key={s.label} className="flex flex-col">
                      <span className="bb-stat text-4xl sm:text-5xl" style={{ color: s.color }}>{s.n}</span>
                      <span className="text-xs uppercase tracking-wider font-bold mt-1" style={{ color: "#9ca3af" }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Engagement", val: 94, color: "#8b5cf6" },
                    { label: "Retention",  val: 87, color: "#f59e0b" },
                    { label: "Fun Factor", val: 98, color: "#10b981" },
                  ].map(b => (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: "#9ca3af" }}>
                        <span>{b.label}</span><span>{b.val}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.08)" }}>
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${b.val}%` }}
                          viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                          className="h-full rounded-full" style={{ background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-2 sm:-right-6 bb-glass bb-glass-amber rounded-2xl px-5 py-3"
                style={{ border: "1px solid rgba(245,158,11,0.25)" }}>
                <span className="bb-stat text-lg block" style={{ color: "#d97706" }}>#BibleBanter</span>
                <span className="text-xs" style={{ color: "#9ca3af" }}>Weekly Recap</span>
              </motion.div>
            </motion.div>

            {/* Copy */}
            <motion.div initial="hidden" whileInView="visible" viewport={viewOpts}
              variants={stagger} className="pt-8 lg:pt-0">
              <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#7c3aed" }}>
                Our mission
              </motion.p>
              <motion.h2 variants={fadeUp}
                className="font-nunito font-black text-3xl sm:text-4xl lg:text-5xl uppercase leading-tight mb-6"
                style={{ color: "#1e1b4b" }}>
                Spreading Joy,<br />
                <span style={{ color: "#7c3aed" }}>One Question</span><br />
                at a Time.
              </motion.h2>
              <motion.p variants={fadeUp} className="mb-8 text-sm sm:text-base leading-relaxed" style={{ color: "#6b7280" }}>
                Bible Banter isn't just about knowledge — it's about building bridges. Join thousands of youth groups,
                families, and friends who have turned Sundays into an energetic celebration of faith.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5 mb-8">
                {["Youth Groups", "Fellowships", "Bible Studies", "Church Events"].map(t => (
                  <span key={t} className="bb-glass px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide"
                    style={{ color: "#7c3aed" }}>{t}</span>
                ))}
              </motion.div>

              <motion.button variants={fadeUp} type="button" onClick={() => onJoin?.()}
                className="bb-btn-amber font-nunito font-black text-sm px-7 py-3 rounded-xl uppercase tracking-wide">
                Start Playing Free →
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────────────────────── */}
      <section id="tech" className="py-20 sm:py-28 px-5 sm:px-8"
        style={{ background: "#f9f8ff", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={viewOpts} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#7c3aed" }}>
              Under the hood
            </motion.p>
            <motion.h2 variants={fadeUp}
              className="font-nunito font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight mb-3"
              style={{ color: "#1e1b4b" }}>
              Built for Reliability
            </motion.h2>
            <motion.p variants={fadeUp} className="max-w-lg mx-auto text-sm" style={{ color: "#6b7280" }}>
              Open source. Free for church events, Bible studies, and educational use.
            </motion.p>
          </motion.div>

          <motion.div className="flex flex-wrap justify-center gap-3"
            initial="hidden" whileInView="visible" viewport={viewOpts} variants={stagger}>
            {tech.map((t, i) => (
              <motion.div key={t.label} variants={fadeUp} custom={i * 0.07}
                className="bb-badge flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl">
                <t.icon size={18} strokeWidth={1.8} style={{ color: t.color }} />
                <span className="font-nunito font-bold text-xs sm:text-sm" style={{ color: "#374151" }}>{t.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bb-cta-bg py-20 sm:py-28 px-5 sm:px-8 relative overflow-hidden text-center"
        style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
          <div className="bb-pulse w-96 h-96 rounded-full border border-violet-400/20 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="bb-pulse-2 w-96 h-96 rounded-full border border-violet-400/20 absolute -translate-x-1/2 -translate-y-1/2" />
        </div>

        <motion.div className="relative z-10 max-w-2xl mx-auto"
          initial="hidden" whileInView="visible" viewport={viewOpts} variants={stagger}>
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#6d28d9" }}>
              <Star size={13} />
              Start in under 60 seconds
            </span>
          </motion.div>

          <motion.h2 variants={fadeUp}
            className="bb-stat text-5xl sm:text-6xl md:text-7xl uppercase tracking-wide mb-4 bb-glow-violet"
            style={{ color: "#4c1d95" }}>
            Ready to Play?
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-10 text-sm sm:text-base" style={{ color: "#6b7280" }}>
            No setup, no downloads, no stress. Just open a browser and go.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button type="button" onClick={() => onJoin?.()}
              className="bb-btn-amber font-nunito font-black text-base sm:text-lg px-10 sm:px-14 py-4 sm:py-5 rounded-2xl uppercase tracking-wide w-full sm:w-auto">
              Join a Game
            </button>
            <button type="button" onClick={handleHost}
              className="bb-btn-ghost font-nunito font-black text-base sm:text-lg px-10 sm:px-14 py-4 sm:py-5 rounded-2xl uppercase tracking-wide w-full sm:w-auto">
              Host a Game
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-10 px-5 sm:px-8"
        style={{ background: "#faf9ff", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-0 leading-none">
              <span className="font-nunito font-black text-xl" style={{ color: "#1e1b4b" }}>Bible</span>
              <span className="font-nunito font-black text-xl" style={{ color: "#7c3aed" }}>&nbsp;Banter</span>
            </div>
            <p className="text-xs" style={{ color: "#9ca3af" }}>© {new Date().getFullYear()} Bible Banter. Spread the Joy.</p>
            <p className="text-xs max-w-xs leading-relaxed" style={{ color: "#9ca3af" }}>
              Built with ❤️ by{" "}
              <a href="https://www.oddshoes.dev" className="underline hover:text-violet-600 transition-colors" target="_blank" rel="noreferrer">
                Odd Shoes
              </a>{" "}
              in partnership with{" "}
              <a href="https://betweenhisshoulders.org" className="underline hover:text-violet-600 transition-colors" target="_blank" rel="noreferrer">
                Kingdom Chaplain
              </a>.
            </p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Open source contributions by{" "}
              <a href="https://www.linkedin.com/in/shadrack-ssenkaayi-0580bb2b7/" className="underline hover:text-violet-600 transition-colors" target="_blank" rel="noreferrer">
                Shadrack
              </a>
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {["Privacy Policy","Terms of Service","Contact Us","Help Center"].map(l => (
              <a key={l} href="#" className="text-xs font-semibold transition-colors hover:text-violet-600"
                style={{ color: "#9ca3af" }}>{l}</a>
            ))}
            <a href="https://github.com/shadrack-ss/BitbleBattle" target="_blank" rel="noreferrer"
              className="text-xs font-semibold transition-colors hover:text-violet-600" style={{ color: "#9ca3af" }}>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
