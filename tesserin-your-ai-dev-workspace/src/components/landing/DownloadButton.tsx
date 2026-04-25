import { useMemo } from "react";
import { ArrowRight, Download } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  detectPlatformFromUserAgent,
  getDownloadHref,
  getPrimaryDownloadLabel,
  getPlatformLabel,
} from "@/lib/downloads";

type DownloadButtonProps = {
  compact?: boolean;
  showArrow?: boolean;
} & Omit<ButtonProps, "asChild">;

function useDetectedPlatform() {
  return useMemo(() => {
    if (typeof navigator === "undefined") return null;

    const platformHint = "userAgentData" in navigator
      ? (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
      : navigator.platform;

    return detectPlatformFromUserAgent(navigator.userAgent, platformHint);
  }, []);
}

const DownloadButton = ({
  compact = false,
  showArrow = true,
  children,
  className,
  variant = "hero",
  ...props
}: DownloadButtonProps) => {
  const platform = useDetectedPlatform();
  const label = children ?? (compact ? "Download" : getPrimaryDownloadLabel(platform));
  const href = getDownloadHref(platform);
  const ariaLabel = platform
    ? `Download the latest Tesserin build for ${getPlatformLabel(platform)}`
    : "View the latest desktop downloads for Tesserin";

  return (
    <Button variant={variant} className={className} asChild {...props}>
      <a href={href} aria-label={ariaLabel}>
        <Download className="h-4 w-4" />
        {label}
        {showArrow ? <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /> : null}
      </a>
    </Button>
  );
};

export default DownloadButton;
