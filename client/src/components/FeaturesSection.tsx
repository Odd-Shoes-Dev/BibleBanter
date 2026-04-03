import { motion } from "framer-motion";

const features = [
  {
    title: "Live Quizzes",
    description:
      "Launch a 60-second quiz from the pulpit. See the room's comprehension live on your tablet.",
    bg: "hsl(226 75% 50%)",
    text: "#FFFFFF",
    rotate: "-rotate-[2deg]",
  },
  {
    title: "Group Insights",
    description:
      "Identify common theological misconceptions in your congregation instantly.",
    bg: "hsl(25 95% 53%)",
    text: "#000000",
    rotate: "rotate-[1.5deg]",
  },
  {
    title: "Weekly Habit",
    description:
      "Gamify scripture reading. Keep your people in the Word Monday through Saturday.",
    bg: "hsl(73 80% 50%)",
    text: "#000000",
    rotate: "-rotate-[1deg]",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image & Overlay */}
      <img
        src="/bg-11.jpg"
        alt="Background"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/30" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-16"
        >
          <div className="relative inline-block">
            {/* Hard shadow */}
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black rotate-[1deg]" />
            {/* Banner box */}
            <div
              className="relative border-[4px] border-black px-8 py-4 rotate-[-1deg]"
              style={{ backgroundColor: "hsl(0 65% 42%)" }}
            >
              <h2 className="font-heading font-black text-3xl md:text-5xl text-center uppercase tracking-wider text-white">
                Engage Your Congregation
              </h2>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              {/* Hard offset shadow */}
              <div
                className={`absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black ${feature.rotate}`}
              />
              {/* Card */}
              <div
                className={`relative p-6 border-[4px] border-black ${feature.rotate} transition-transform duration-200 hover:translate-y-[5px] hover:translate-x-[5px] cursor-pointer`}
                style={{ backgroundColor: feature.bg, color: feature.text }}
              >
                <h3 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3">
                  {feature.title}
                </h3>
                <p className="font-body text-base font-semibold leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
