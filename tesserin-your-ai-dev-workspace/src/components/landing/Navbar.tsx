import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Logo from "@/components/landing/Logo";
import DownloadButton from "@/components/landing/DownloadButton";
import { REPOSITORY_URL } from "@/lib/downloads";

const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <nav className="mx-auto max-w-6xl glass rounded-2xl px-5 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Logo size={32} className="transition-transform group-hover:rotate-12 duration-500" />
            <div className="absolute inset-1 blur-xl bg-primary/40 -z-10" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Tesserin</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">Changelog</a>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <a href={REPOSITORY_URL} aria-label="GitHub" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <DownloadButton variant="hero" size="sm" compact className="ml-1" showArrow={false} />
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
