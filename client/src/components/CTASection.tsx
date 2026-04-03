import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image & Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-5.jpg')" }}
      />
      <div className="absolute inset-0 bg-background/30" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/join")}
            size="lg"
            className="bg-[hsl(270_60%_50%)] hover:bg-[hsl(270_60%_40%)] text-white font-heading text-xl md:text-2xl uppercase tracking-wider px-10 py-7 rounded-xl shadow-lg"
          >
            Get Early Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="font-body text-white drop-shadow-md font-medium text-sm mt-4">
            Join 150+ churches measuring what matters.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
