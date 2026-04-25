import { motion } from "framer-motion";
import {
  BookOpen,
  Cpu,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DownloadButton from "@/components/landing/DownloadButton";
import ManualDownloadLinks from "@/components/landing/ManualDownloadLinks";
import heroImage from "@/assets/screenshot-notes.jpeg";
import samImage from "@/assets/screenshot-sam.jpeg";

const highlights = [
  {
    icon: Cpu,
    title: "50ms cold start",
    detail: "Native shell + Rust core for instant boot.",
  },
  {
    icon: Workflow,
    title: "MCP orchestration",
    detail: "Plug in tools, databases, and agents in one graph.",
  },
  {
    icon: ShieldCheck,
    title: "Local-first privacy",
    detail: "Your notes and prompts stay on your machine.",
  },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 md:pt-36">
      <div className="absolute inset-0 bg-grid opacity-35" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-gradient-radial" aria-hidden />
      <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Native Ollama + MCP orchestration</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-foreground">v1.2 release candidate</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl"
            >
              Think in systems.
              <br />
              Ship with <span className="text-gradient">local AI speed.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0"
            >
              Tesserin unifies markdown, canvas, graph, terminal, and agents in one deliberate workspace.
              Build with cloud models or run fully local with <span className="mono text-foreground">Ollama</span> and
              <span className="mono text-foreground"> MCP</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <DownloadButton size="xl" className="group" />
              <Button variant="outlineGlow" size="xl" asChild>
                <a href="#showcase">
                  <BookOpen className="h-4 w-4" />
                  Explore product walkthrough
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.34 }}
              className="mt-4"
            >
              <ManualDownloadLinks />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.45 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start"
            >
              <span className="inline-flex items-center gap-1.5 mono">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                MIT licensed
              </span>
              <span className="inline-flex items-center gap-1.5 mono">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                Apple Silicon + x64
              </span>
              <span className="inline-flex items-center gap-1.5 mono">
                <Workflow className="h-3.5 w-3.5 text-primary" />
                Linux preview available
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 grid gap-3 sm:grid-cols-3"
            >
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/70 bg-card/55 p-4 text-left backdrop-blur-sm"
                >
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/70 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold leading-tight">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 45, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.95, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-[560px]"
          >
            <div className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-gradient-primary opacity-30 blur-3xl" aria-hidden />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/70 p-2 shadow-elegant backdrop-blur-xl">
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/90">
                <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                  <div className="ml-3 hidden rounded-md border border-border/60 bg-card/80 px-2.5 py-1 text-[10px] text-muted-foreground mono sm:block">
                    /vault/research/agentic-workflows.md
                  </div>
                  <div className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] text-primary mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                    model online
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={heroImage}
                    alt="Tesserin workspace showing markdown editor, AI assistant, and graph-aware references"
                    width={1600}
                    height={1024}
                    className="aspect-[16/10] w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-x-5 top-5 rounded-lg border border-border/70 bg-background/70 p-3 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mono">
                      <span className="rounded border border-border/60 px-2 py-0.5">quick action</span>
                      <span className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary">
                        summarize + cite sources
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/90">
                      "Summarize the three linked notes and generate a launch brief with action items."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-5 bottom-8 hidden rounded-xl border border-border/70 bg-card/80 px-4 py-3 shadow-card backdrop-blur-lg md:block"
            >
              <p className="text-[10px] text-muted-foreground mono">Context graph</p>
              <p className="text-sm font-semibold">84 linked notes</p>
              <p className="text-xs text-primary mono">+12 this week</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute -right-6 top-8 hidden w-52 rounded-xl border border-border/70 bg-card/85 p-2 shadow-card backdrop-blur-lg lg:block"
            >
              <p className="px-1 text-[10px] text-muted-foreground mono">SAM quick actions</p>
              <img
                src={samImage}
                alt="Quick-action panel preview from Tesserin SAM assistant"
                width={640}
                height={360}
                className="mt-1 rounded-md border border-border/70"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
