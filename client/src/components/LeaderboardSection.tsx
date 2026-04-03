import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

const mockLeaderboard = [
  { rank: 1, name: "Grace M.", score: 12480, games: 34, icon: Trophy },
  { rank: 2, name: "Pastor James", score: 11250, games: 28, icon: Medal },
  { rank: 3, name: "David K.", score: 10890, games: 31, icon: Award },
  { rank: 4, name: "Sarah W.", score: 9750, games: 25 },
  { rank: 5, name: "Emmanuel O.", score: 9340, games: 22 },
];

const LeaderboardSection = () => {
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
            {mockLeaderboard.map((player, index) => (
              <div
                key={player.rank}
                className={`flex items-center gap-4 px-6 py-4 ${
                  index !== mockLeaderboard.length - 1 ? "border-b border-border" : ""
                } ${index < 3 ? "bg-gold/5" : ""}`}
              >
                <div className="w-8 text-center">
                  {player.icon ? (
                    <player.icon
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
                      {player.rank}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-foreground truncate">
                    {player.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {player.games} games played
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-body font-bold text-foreground">
                    {player.score.toLocaleString()}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
