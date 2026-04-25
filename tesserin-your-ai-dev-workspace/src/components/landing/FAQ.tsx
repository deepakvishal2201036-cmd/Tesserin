import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is Tesserin free and open source?",
    a: "Yes. Tesserin is MIT-licensed and free for individual and commercial use. The desktop app, plugin SDK, and core extensions are all open source on GitHub.",
  },
  {
    q: "Does my data ever leave my machine?",
    a: "Never by default. Your vault is a local folder of plain markdown + JSON files. Cloud AI calls are explicit and opt-in per request — or skip them entirely with Ollama for fully offline AI.",
  },
  {
    q: "What's MCP and why does it matter?",
    a: "Model Context Protocol is an open standard for letting AI agents securely access tools, databases, and APIs. Tesserin is MCP-native, so any MCP server (Postgres, Slack, GitHub, custom tools) plugs into SAM instantly.",
  },
  {
    q: "Which AI models are supported?",
    a: "Anything via Ollama (Llama, Mistral, Qwen, DeepSeek, etc.) for local, plus OpenAI, Anthropic, Google, Groq, and any OpenAI-compatible endpoint for cloud agents.",
  },
  {
    q: "Can I migrate from Obsidian or Notion?",
    a: "Yes. Tesserin reads standard markdown vaults out-of-the-box, and ships importers for Notion exports, Roam JSON, and Apple Notes.",
  },
  {
    q: "What platforms are supported?",
    a: "macOS (Apple Silicon + Intel), Windows 10/11, and Linux (deb, rpm, AppImage). Mobile companion apps are on the roadmap.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs mono text-primary mb-4">
            // FAQ
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Questions, <span className="text-gradient">answered.</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-foreground">{f.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
