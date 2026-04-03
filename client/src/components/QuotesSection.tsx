import { motion } from "framer-motion";

const QuotesSection = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-background">
      <div className="relative z-10 container mx-auto px-4 max-w-2xl space-y-16">
        {/* On Sunday Morning */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <span
            className="inline-block font-body font-bold text-xs uppercase tracking-wider px-3 py-1 mb-3 border-[3px] border-black rotate-[-1.5deg]"
            style={{ backgroundColor: "hsl(270 60% 40%)", color: "#FFFFFF" }}
          >
            On Sunday Morning
          </span>
          <div className="relative">
            <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black" />
            <div
              className="relative border-[4px] border-black p-6 rotate-[-2.5deg] transition-transform duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:rotate-[-1.5deg] cursor-pointer"
              style={{ backgroundColor: "hsl(38 92% 50%)", color: "#000000" }}
            >
              <p className="font-heading text-2xl md:text-3xl leading-snug">
                "The room is full. People are nodding. It feels like they're
                with you."
              </p>
            </div>
          </div>
        </motion.div>

        {/* By Monday */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <span
            className="inline-block font-body font-bold text-xs uppercase tracking-wider px-3 py-1 mb-3 border-[3px] border-black rotate-[2.5deg]"
            style={{ backgroundColor: "hsl(38 92% 50%)", color: "#000000" }}
          >
            By Monday
          </span>
          <div className="relative">
            <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black" />
            <div
              className="relative border-[4px] border-black p-6 rotate-[2deg] transition-transform duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:rotate-[1deg] cursor-pointer"
              style={{ backgroundColor: "hsl(0 65% 42%)", color: "#FFFFFF" }}
            >
              <p className="font-heading text-2xl md:text-3xl leading-snug">
                "The sermon notes are in the trash. The key points are
                forgotten."
              </p>
            </div>
          </div>
        </motion.div>

        {/* With Bible Banter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <span
            className="inline-block font-body font-bold text-xs uppercase tracking-wider px-3 py-1 mb-3 border-[3px] border-black rotate-[-1deg]"
            style={{ backgroundColor: "hsl(25 95% 53%)", color: "#000000" }}
          >
            With Bible Banter
          </span>
          <div className="relative">
            <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black" />
            <div
              className="relative border-[4px] border-black p-6 rotate-[-1.5deg] transition-transform duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:rotate-[0deg] cursor-pointer"
              style={{ backgroundColor: "hsl(270 60% 40%)", color: "#FFFFFF" }}
            >
              <p className="font-heading text-2xl md:text-3xl leading-snug">
                "They play, they learn, they remember. Discipleship becomes
                active."
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuotesSection;
