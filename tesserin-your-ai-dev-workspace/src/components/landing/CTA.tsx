import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import DownloadButton from "@/components/landing/DownloadButton";
import { REPOSITORY_URL } from "@/lib/downloads";

const CTA = () => {
  return (
    <section className="relative py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-4xl rounded-3xl border-gradient overflow-hidden p-12 sm:p-16 text-center"
      >
        <div className="absolute inset-0 bg-gradient-radial opacity-80" aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />

        <div className="relative">
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Your second brain, <span className="text-gradient">supercharged.</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto">
            Join thousands of developers building, thinking, and shipping faster with Tesserin.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <DownloadButton variant="hero" size="xl" className="group">
              Download Free
            </DownloadButton>
            <Button variant="outlineGlow" size="xl" asChild>
              <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
