import { useState } from "react";
import { Github, BookOpen, Users, Twitter, Send, Heart } from "lucide-react";
import Logo from "@/components/landing/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RELEASES_PAGE_URL, REPOSITORY_URL } from "@/lib/downloads";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Showcase", href: "#showcase" },
      { label: "Integrations", href: "#integrations" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Plugin SDK", href: "#" },
      { label: "MCP Guide", href: "#" },
      { label: "Themes Gallery", href: "#" },
      { label: "Keyboard Shortcuts", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: REPOSITORY_URL },
      { label: "Discord", href: "#" },
      { label: "Twitter / X", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contribute", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Press Kit", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const socials = [
  { icon: Github, label: "GitHub", href: REPOSITORY_URL },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Users, label: "Discord", href: "#" },
  { icon: BookOpen, label: "Docs", href: "#" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list!", {
      description: "We'll send you build releases and changelog highlights.",
    });
    setEmail("");
  };

  return (
    <footer className="relative border-t border-border/60 mt-12">
      {/* glow */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-10">
        {/* Top: brand + newsletter + columns */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5">
            <a href="#" className="flex items-center gap-2.5 mb-5 group">
              <Logo size={32} className="transition-transform group-hover:rotate-12 duration-500" />
              <span className="font-display text-xl font-bold tracking-tight">Tesserin</span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              The AI-first knowledge workspace for developers and researchers.
              Markdown, canvas, terminal, and local AI — in one extensible desktop app.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2">
              <label htmlFor="footer-email" className="text-xs font-medium text-foreground mono">
                // follow releases & changelog
              </label>
              <div className="flex gap-2 max-w-sm">
                <Input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-card/60 border-border focus-visible:ring-primary"
                />
                <Button type="submit" variant="hero" size="default" aria-label="Subscribe">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
              <a
                href={RELEASES_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[11px] mono text-primary hover:text-primary/80 transition-colors"
              >
                View latest desktop release
              </a>
            </form>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors story-link"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Big wordmark */}
        <div className="relative mb-10 select-none overflow-hidden">
          <div className="font-display text-[18vw] sm:text-[14vw] font-bold tracking-tighter leading-none bg-gradient-to-b from-foreground/15 to-transparent bg-clip-text text-transparent text-center">
            TESSERIN
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-8 border-t border-border/60">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mono">
            <span>© 2026 Tesserin</span>
            <span className="opacity-40">·</span>
            <span>MIT License</span>
            <span className="opacity-40">·</span>
            <span>v1.0.0-beta</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-3 w-3 fill-primary text-primary" />
            <span>by developers, for developers & researchers.</span>
          </div>

          <div className="flex items-center gap-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
