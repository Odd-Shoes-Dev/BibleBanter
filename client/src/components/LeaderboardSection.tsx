import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const LeaderboardSection = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND}/api/leaderboard`)
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.leaderboard || []))
      .catch(() => {});
  }, []);

  if (leaderboard.length === 0) return null;

  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Global Leaderboard
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            Top scorers across all games
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
            {leaderboard.map((player, index) => {
              // Add icons to top 3
              let Icon = null;
              if (index === 0) Icon = Trophy;
              else if (index === 1) Icon = Medal;
              else if (index === 2) Icon = Award;

              const score = Number(player.totalScore ?? 0);
              const games = player.gamesPlayed ?? 0;

              return (
                <div
                  key={player.name}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    index !== leaderboard.length - 1
                      ? "border-b border-border"
                      : ""
                  } ${index < 3 ? "bg-gold/5" : ""}`}
                >
                  <div className="w-8 text-center">
                    {Icon ? (
                      <Icon
                        className={`h-5 w-5 mx-auto ${
                          index === 0
                            ? "text-gold"
                            : index === 1
                              ? "text-muted-foreground"
                              : "text-gold-dark"
                        }`}
                      />
                    ) : (
                      <span className="font-body font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground truncate">
                      {player.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {games} games played
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-body font-bold text-foreground">
                      {score.toLocaleString()}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      points
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
