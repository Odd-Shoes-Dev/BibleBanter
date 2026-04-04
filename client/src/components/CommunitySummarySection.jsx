import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function AnimatedCounter({ to }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (inView) {
      let start = 0;
      if (start === to) return;

      const duration = 2000;
      const incrementTime = 20;
      const totalSteps = Math.ceil(duration / incrementTime);
      const step = to / totalSteps;

      const timer = setInterval(() => {
        start += step;
        if (start >= to) {
          setCount(to);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [to, inView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function CommunitySummarySection() {
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    fetch(`${BACKEND}/api/stats`)
      .then((res) => res.json())
      .then((data) => setTotalQuestions(data.totalQuestions || 0))
      .catch(console.error);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden bg-orange-100/50 dark:bg-zinc-800">
      <div className="relative z-10 container mx-auto px-4 max-w-4xl space-y-16">
        {/* Main Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="relative inline-block text-center w-full max-w-3xl">
            {/* Hard offset shadow */}
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black rotate-[1deg]" />
            {/* Banner box */}
            <div
              className="relative p-8 border-[4px] border-black rotate-[-1.5deg]"
              style={{ backgroundColor: "#ff90e8", color: "#000000" }}
            >
              <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-wider mb-2">
                <AnimatedCounter to={totalQuestions} />{" "}
                <br className="sm:hidden" />
                <span className="text-2xl md:text-4xl">Uploaded & Growing</span>
              </h2>
              <p className="font-body text-lg md:text-xl font-bold mt-4 leading-relaxed max-w-2xl mx-auto">
                Hundreds of questions, one at a time, each uploaded with the
                ultimate goal of preaching the gospel.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 mt-12 px-2 md:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <span
              className="inline-block font-body font-bold text-xs uppercase tracking-wider px-3 py-1 mb-3 border-[3px] border-black rotate-[-2deg]"
              style={{ backgroundColor: "#ff4911", color: "#FFFFFF" }}
            >
              AI Curated
            </span>
            <div className="relative">
              <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black" />
              <div
                className="relative border-[4px] border-black p-6 rotate-[1.5deg] transition-transform duration-200 hover:-translate-y-1 hover:-translate-x-1 cursor-pointer"
                style={{
                  backgroundColor: "#ccff00",
                  color: "#000000",
                }}
              >
                <h3 className="font-heading text-2xl font-bold uppercase tracking-wide mb-3">
                  Smart Rotation
                </h3>
                <p className="font-body text-base font-semibold leading-relaxed">
                  When you play a game, our AI randomly selects the least used
                  questions for a fresh and proper game experience every time.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <span
              className="inline-block font-body font-bold text-xs uppercase tracking-wider px-3 py-1 mb-3 border-[3px] border-black rotate-[2deg]"
              style={{ backgroundColor: "#7400b8", color: "#FFFFFF" }}
            >
              Global Effort
            </span>
            <div className="relative">
              <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black" />
              <div
                className="relative border-[4px] border-black p-6 rotate-[-1deg] transition-transform duration-200 hover:-translate-y-1 hover:-translate-x-1 cursor-pointer"
                style={{
                  backgroundColor: "#06d6a0",
                  color: "#000000",
                }}
              >
                <h3 className="font-heading text-2xl font-bold uppercase tracking-wide mb-3">
                  Built by Believers
                </h3>
                <p className="font-body text-base font-semibold leading-relaxed">
                  Enjoy questions crafted by individuals all over the world,
                  building out what will be the largest global bible trivia
                  database.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
