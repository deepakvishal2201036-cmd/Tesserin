import { motion } from "framer-motion";
import { Download, Sparkles, Workflow } from "lucide-react";

const steps = [
  {
    icon: Download,
    n: "01",
    title: "Install Tesserin",
    desc: "One download for macOS, Windows, or Linux. Zero config — your vault is just a folder.",
  },
  {
    icon: Sparkles,
    n: "02",
    title: "Connect your AI",
    desc: "Plug in Ollama for local models, or hook into Claude, GPT, and any MCP-compatible server.",
  },
  {
    icon: Workflow,
    n: "03",
    title: "Think without limits",
    desc: "Write notes, sketch canvases, run terminal commands, and let SAM connect the dots.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs mono text-primary mb-4">
            // get started
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            From install to <span className="text-gradient">insight in 60 seconds.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div
            className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            aria-hidden
          />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full border border-border bg-card mb-5">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" aria-hidden />
                <s.icon className="h-9 w-9 text-primary relative" />
                <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mono">
                  {s.n}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
