import { motion } from "framer-motion";
import { Network, Brain, PenTool } from "lucide-react";
import canvasImg from "@/assets/screenshot-canvas.jpeg";
import graphImg from "@/assets/screenshot-graph.jpeg";
import samImg from "@/assets/screenshot-sam.jpeg";

const showcases = [
  {
    icon: PenTool,
    eyebrow: "Infinite Canvas",
    title: "Sketch your thinking. Render text into diagrams.",
    desc: "Native Excalidraw with hand-drawn flowcharts, plus Mermaid.js for instant text-to-diagram. Insert notes, split views, and zoom into infinity.",
    image: canvasImg,
    alt: "Tesserin infinite canvas showing a hand-drawn diarrhea flowchart with viral, bacterial, parasitic infection branches",
    align: "left" as const,
  },
  {
    icon: Network,
    eyebrow: "Knowledge Graph",
    title: "See how your ideas connect.",
    desc: "Force-directed, mind-map and radial layouts. Filter nodes, navigate links, and discover hidden relationships across your entire vault.",
    image: graphImg,
    alt: "Tesserin knowledge graph in force-directed mode showing 12 nodes and 8 links between notes",
    align: "right" as const,
  },
  {
    icon: Brain,
    eyebrow: "SAM — Simulated Adaptive Matrix",
    title: "Your local AI for knowledge work.",
    desc: "Powered by Ollama + Cloud Agents. MCP-native and Knowledge-Graph aware. Summarize, brainstorm, expand, rewrite — all from one quick-action palette.",
    image: samImg,
    alt: "Tesserin SAM AI assistant with quick actions: Create Note, Summarize, Tags, Links, Outline, Brainstorm, Expand, Rewrite",
    align: "left" as const,
  },
];

const Showcase = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs mono text-primary mb-4">
            // see it in action
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            A workspace as <span className="text-gradient">deep as your research.</span>
          </h2>
        </motion.div>

        <div className="space-y-32">
          {showcases.map((s, i) => (
            <div
              key={s.title}
              className={`grid lg:grid-cols-2 gap-10 items-center ${
                s.align === "right" ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <motion.div
                initial={{ opacity: 0, x: s.align === "left" ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-primary mb-5">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-xs mono text-primary uppercase tracking-widest mb-3">{s.eyebrow}</p>
                <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">{s.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">{s.desc}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="absolute -inset-6 bg-gradient-primary opacity-20 blur-3xl rounded-full" aria-hidden />
                <div className="relative rounded-2xl border border-border bg-card/40 p-1.5 backdrop-blur-xl shadow-elegant overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border/60">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <img
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    width={1920}
                    height={1080}
                    className="w-full rounded-xl"
                  />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showcase;
