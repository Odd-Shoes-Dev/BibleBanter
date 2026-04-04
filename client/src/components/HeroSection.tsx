import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Gamepad2,
  Users,
  Church,
  Zap,
  Target,
  Heart,
  ClipboardList,
  BarChart2,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const HeroSection = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("bb_token");
  const [stats, setStats] = useState({
    totalGames: 0,
    totalPlayers: 0,
    totalQuestions: 0,
  });

  useEffect(() => {
    fetch(`${BACKEND}/api/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <section className="relative min-h-screen pt-6 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/bg-3.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/30 to-black/90" />

      {/* Decorative neo-brutalist elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 border-[3px] border-gold rounded-none rotate-12 opacity-30"
        animate={{ rotate: [12, -5, 12] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-16 w-16 h-16 bg-accent/20 border-[3px] border-accent rotate-[-8deg] opacity-40"
        animate={{ rotate: [-8, 5, -8] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/4 right-10 w-12 h-12 border-[3px] border-primary-foreground/20 rotate-45 opacity-20"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center"
          >
            {/* Badge & Login Container */}
            <div className="flex items-center justify-center gap-3 relative mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-accent/20 border-[2px] border-accent px-4 py-2 font-body text-sm font-semibold text-accent"
                style={{ boxShadow: "3px 3px 0px hsl(var(--accent))" }}
              >
                <Church className="h-4 w-4" />
                Built for churches & youth groups
              </motion.div>

              <div className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2">
                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gold hover:bg-gold/10 w-10 h-10 p-0 hover:text-gold"
                    title="Logout Host"
                    onClick={() => {
                      localStorage.removeItem("bb_token");
                      localStorage.removeItem("bb_host");
                      window.location.reload();
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gold hover:bg-gold/10 w-10 h-10 p-0 hover:text-gold"
                    title="Host Login"
                    onClick={() => navigate("/login")}
                  >
                    <LogIn className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-primary-foreground mb-2 leading-[1.05] tracking-tight">
              Bible Banter
            </h1>

            <p className="font-heading text-2xl sm:text-3xl md:text-4xl text-accent mb-6 italic">
              Know the Word. Play the Word.
            </p>

            <p className="font-body text-primary-foreground/80 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Turn your Bible study into an interactive game night. Pastors
              host, congregations compete, everyone learns.
            </p>
          </motion.div>

          {/* CTA Buttons - Primary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Button
              variant="gold"
              size="lg"
              className="text-base px-8 py-6 rounded-none border-[3px] border-foreground font-bold animate-pulse-gold"
              style={{ boxShadow: "4px 4px 0px hsl(var(--foreground))" }}
              onClick={() => navigate("/join")}
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Join a Game
            </Button>
            <Button
              variant="navy"
              size="lg"
              className="text-base px-8 py-6 rounded-none border-[3px] border-gold font-bold"
              style={{ boxShadow: "4px 4px 0px hsl(var(--gold))" }}
              onClick={() => navigate(isLoggedIn ? "/host" : "/login")}
            >
              <Users className="mr-2 h-5 w-5" />
              Host a Game
            </Button>
          </motion.div>

          {/* CTA Buttons - Secondary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12 max-w-2xl mx-auto"
          >
            <Button
              size="lg"
              className="text-sm px-6 py-5 rounded-full border border-purple-400/40 bg-purple-500/15 backdrop-blur-md text-purple-50 font-bold hover:bg-purple-500/25 transition-colors shadow-lg"
              onClick={() => navigate("/solo")}
            >
              <Target className="mr-2 h-4 w-4 text-purple-400 drop-shadow-sm" />{" "}
              <span className="drop-shadow-sm">Solo Practice</span>
            </Button>
            <Button
              size="lg"
              className="text-sm px-6 py-5 rounded-full border border-zinc-500/40 bg-zinc-800/30 backdrop-blur-md text-white font-bold hover:bg-zinc-800/50 transition-colors shadow-lg"
              onClick={() =>
                window.open(
                  "https://betweenhisshoulders.org/services/kingdom-tech-hubs/kc-labs-software-development",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <Heart
                className="mr-2 h-4 w-4 text-red-500 drop-shadow-sm"
                fill="currentColor"
              />{" "}
              <span className="drop-shadow-sm">Support the Mission</span>
            </Button>
            <Button
              size="lg"
              className="text-sm px-6 py-5 rounded-full border border-blue-400/40 bg-blue-500/15 backdrop-blur-md text-blue-50 font-bold hover:bg-blue-500/25 transition-colors shadow-lg"
              onClick={() => navigate("/history")}
            >
              <ClipboardList className="mr-2 h-4 w-4 text-blue-400 drop-shadow-sm" />{" "}
              <span className="drop-shadow-sm">Game History</span>
            </Button>
            <Button
              size="lg"
              className="text-sm px-6 py-5 rounded-full border border-emerald-400/40 bg-emerald-500/15 backdrop-blur-md text-emerald-50 font-bold hover:bg-emerald-500/25 transition-colors shadow-lg"
              onClick={() => navigate("/reports")}
            >
              <BarChart2 className="mr-2 h-4 w-4 text-emerald-400 drop-shadow-sm" />{" "}
              <span className="drop-shadow-sm">Reports</span>
            </Button>
          </motion.div>

          {/* Usage Stats (Live API) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center justify-center text-center mb-8"
          >
            {stats.totalGames > 0 && (
              <p className="text-white/80 font-bold bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm text-sm">
                <span>💡 Join </span>
                <span className="text-accent">
                  {stats.totalPlayers.toLocaleString()}
                </span>{" "}
                players in over{" "}
                <span className="text-accent">
                  {stats.totalGames.toLocaleString()}
                </span>{" "}
                games globally!
              </p>
            )}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {[
              {
                icon: <Zap className="h-4 w-4 text-accent" />,
                text: "Real-time scoring",
              },
              {
                icon: <span className="text-base">🔥</span>,
                text: "Streak bonuses",
              },
              {
                icon: <Users className="h-4 w-4 text-accent" />,
                text: "Unlimited players",
              },
              {
                icon: <Church className="h-4 w-4 text-accent" />,
                text: "Pastor-friendly",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-primary-foreground text-sm font-body font-semibold drop-shadow-md"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
