import { manualDownloadLinks } from "@/lib/downloads";

const ManualDownloadLinks = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground lg:justify-start">
      <span className="mono">Other builds:</span>
      {manualDownloadLinks.map((link) => (
        <a
          key={link.platform}
          href={link.href}
          className="mono text-foreground/80 transition-colors hover:text-primary"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default ManualDownloadLinks;
