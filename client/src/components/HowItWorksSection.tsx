import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Upload your sermon points",
    description:
      "Paste text, upload a PDF, or type a Bible topic — AI generates the quiz instantly.",
    bg: "hsl(38 92% 50%)",
    text: "#000000",
  },
  {
    step: "02",
    title: "Launch the live game",
    description:
      "Share the 6-digit PIN or QR code. Players join from any device — no app needed.",
    bg: "hsl(270 60% 40%)",
    text: "#FFFFFF",
  },
  {
    step: "03",
    title: "Review the growth data",
    description:
      "See what stuck and what didn't. AI-powered understanding reports after every game.",
    bg: "hsl(0 65% 42%)",
    text: "#FFFFFF",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 uppercase tracking-wide text-black">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground font-body mb-14 max-w-md mx-auto">
          Three steps. Zero friction. Maximum retention.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative"
            >
              {/* Shadow card behind */}
              <div
                className="absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-none"
                style={{ backgroundColor: "#000000" }}
              />
              {/* Main card */}
              <div
                className="relative p-6 md:p-8 border-[4px] border-black rounded-none transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:z-10 cursor-pointer"
                style={{ backgroundColor: s.bg, color: s.text }}
              >
                <span className="font-heading text-6xl md:text-7xl block mb-3 opacity-40 font-bold leading-none">
                  {s.step}
                </span>
                <h3 className="font-heading text-xl md:text-2xl font-bold mb-2 uppercase tracking-wide">
                  {s.title}
                </h3>
                <p className="font-body text-base font-medium leading-relaxed opacity-95">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
