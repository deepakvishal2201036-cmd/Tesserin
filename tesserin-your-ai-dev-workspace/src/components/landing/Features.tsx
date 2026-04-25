import { motion } from "framer-motion";
import { Brain, Infinity as InfinityIcon, Plug, TerminalSquare, Puzzle, Presentation } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Knowledge Base",
    desc: "Rich markdown editing with built-in AI. Use cloud agents or run fully local with Ollama.",
    span: "md:col-span-2 md:row-span-2",
    accent: "primary",
    visual: "ai",
  },
  {
    icon: InfinityIcon,
    title: "Infinite Canvas & Diagrams",
    desc: "Native Excalidraw and Mermaid.js for visual thinking and text-to-diagram rendering.",
    span: "md:col-span-2",
    accent: "accent",
    visual: "canvas",
  },
  {
    icon: Plug,
    title: "Model Context Protocol Ready",
    desc: "Deep MCP client/server integration. Connect external tools and databases natively.",
    span: "md:col-span-2",
    accent: "primary",
  },
  {
    icon: TerminalSquare,
    title: "Developer-Centric",
    desc: "Built-in terminal, fuzzy search, keyboard shortcuts, block-level references.",
    span: "md:col-span-2",
    accent: "accent",
    visual: "terminal",
  },
  {
    icon: Puzzle,
    title: "Highly Extensible",
    desc: "Robust plugin system at community and workspace level. Fully themeable.",
    span: "md:col-span-1",
    accent: "primary",
  },
  {
    icon: Presentation,
    title: "Instant Export",
    desc: "Generate PowerPoint decks and export canvas elements directly from notes.",
    span: "md:col-span-1",
    accent: "accent",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs mono text-accent mb-4">
            // features
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            One workspace. <span className="text-gradient-accent">Every workflow.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            For developers and researchers in tech who juggle six tools. Tesserin unifies how you think, write, and ship.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 ${f.span}`}
            >
              <div
                className={`absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                  f.accent === "primary" ? "bg-primary" : "bg-accent"
                }`}
                aria-hidden
              />

              <div className="relative flex flex-col h-full">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/60 mb-4 ${
                    f.accent === "primary" ? "text-primary" : "text-accent"
                  }`}
                >
                  <f.icon className="h-5 w-5" />
                </div>

                <h3 className="font-display text-lg font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                {f.visual === "ai" && (
                  <div className="mt-auto pt-6 space-y-2">
                    <div className="rounded-lg border border-border bg-background/60 p-3 mono text-xs">
                      <span className="text-accent">{">"}</span>{" "}
                      <span className="text-muted-foreground">summarize this note</span>
                    </div>
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 mono text-xs">
                      <span className="text-primary">✦ ai</span>{" "}
                      <span className="text-foreground/80">Generating with llama3.2...</span>
                    </div>
                  </div>
                )}

                {f.visual === "terminal" && (
                  <div className="mt-auto pt-4 rounded-lg border border-border bg-background/80 p-3 mono text-xs">
                    <div className="text-accent">$ tesserin run</div>
                    <div className="text-muted-foreground">▸ workspace ready in 42ms</div>
                  </div>
                )}

                {f.visual === "canvas" && (
                  <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-muted-foreground mono">
                    <span className="rounded border border-border px-2 py-0.5">graph TD</span>
                    <span>→</span>
                    <span className="rounded border border-accent/40 text-accent px-2 py-0.5">render</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
