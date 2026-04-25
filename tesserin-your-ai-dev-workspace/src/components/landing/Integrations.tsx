import { motion } from "framer-motion";

const techs = [
  "Electron", "React", "Ollama", "MCP", "Excalidraw", "Mermaid.js",
  "SQLite", "TypeScript", "Anthropic", "OpenAI", "Tailwind", "Vite",
];

const Integrations = () => {
  return (
    <section id="integrations" className="relative py-24 border-y border-border/60 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-2xl sm:text-3xl font-semibold"
        >
          Built on the tools <span className="text-gradient">developers trust</span>
        </motion.h2>
        <p className="mt-3 text-sm text-muted-foreground mono">// integrations & tech stack</p>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex marquee w-max gap-4">
          {[...techs, ...techs].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-6 py-4 backdrop-blur-sm whitespace-nowrap"
            >
              <div className="h-2 w-2 rounded-full bg-gradient-primary" />
              <span className="font-display text-base font-medium tracking-tight">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
