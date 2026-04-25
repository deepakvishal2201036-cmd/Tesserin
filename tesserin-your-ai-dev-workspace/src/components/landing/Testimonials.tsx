import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Tesserin replaced Notion, Obsidian, Excalidraw, and three terminal tabs in my workflow. The local AI is the killer feature.",
    name: "Aarav Mehta",
    role: "Senior ML Engineer · DeepLab",
  },
  {
    quote: "I run my entire PhD literature review in Tesserin. The knowledge graph alone is worth switching for.",
    name: "Dr. Lena Vogel",
    role: "Computational Biology · ETH Zürich",
  },
  {
    quote: "MCP-native + Ollama support means I never paste sensitive code into a cloud chat again. Game changer.",
    name: "Marcus Okafor",
    role: "Staff Engineer · Stripe",
  },
  {
    quote: "Sketching architecture in Excalidraw, then asking SAM to turn it into a Mermaid spec? Wild.",
    name: "Sofia Castellano",
    role: "Research Lead · Anthropic",
  },
  {
    quote: "Finally, a note app built like a developer tool. Keyboard-first, plugin-friendly, terminal included.",
    name: "Jin Park",
    role: "Founder · Obsidian Plugin Author",
  },
  {
    quote: "Block-level references + canvas + AI agents = my second brain finally has a home.",
    name: "Hannah Reilly",
    role: "Product Researcher · Linear",
  },
];

const Testimonials = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs mono text-primary mb-4">
            // testimonials
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Loved by people who <span className="text-gradient">build & research.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-5 font-display text-5xl text-primary/20 leading-none select-none">"</div>
              <blockquote className="text-sm leading-relaxed text-foreground/90 mb-5 relative">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold mono">
                  {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
