import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = ({ onJoin }: { onJoin?: () => void }) => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={onJoin}
            size="lg"
            className="bg-[hsl(270_60%_50%)] hover:bg-[hsl(270_60%_40%)] text-white font-heading text-xl md:text-2xl uppercase tracking-wider px-10 py-7 rounded-xl shadow-lg"
          >
            Get Early Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="font-body text-muted-foreground text-sm mt-4">
            Join 150+ churches measuring what matters.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
