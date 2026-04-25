import { motion } from "framer-motion";

const stats = [
  { value: "50ms", label: "Cold start", sub: "Native Electron + Rust core" },
  { value: "100%", label: "Local-first", sub: "Your data never leaves your machine" },
  { value: "12k+", label: "Active researchers", sub: "Across academia & industry" },
  { value: "MIT", label: "Open source", sub: "Audit, fork, and extend" },
];

const Stats = () => {
  return (
    <section className="relative py-20 px-4 border-y border-border/60 bg-card/20">
      <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center md:text-left"
          >
            <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gradient mb-2">
              {s.value}
            </div>
            <div className="text-sm font-medium text-foreground">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
