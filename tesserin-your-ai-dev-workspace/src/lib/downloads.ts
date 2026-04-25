export type DownloadPlatform = "mac" | "windows" | "linux";

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export const RELEASE_REPO_OWNER = "AnvinX1";
export const RELEASE_REPO_NAME = "Tesserin-pro";
export const RELEASE_REPO_SLUG = `${RELEASE_REPO_OWNER}/${RELEASE_REPO_NAME}`;
export const RELEASES_PAGE_URL = `https://github.com/${RELEASE_REPO_SLUG}/releases/latest`;
export const REPOSITORY_URL = `https://github.com/${RELEASE_REPO_SLUG}`;

const IGNORED_RELEASE_ASSET_PATTERN = /\.(blockmap|ya?ml)$/i;

function normalizeSourceValue(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeDownloadPlatform(value?: string | null): DownloadPlatform | null {
  const normalized = normalizeSourceValue(value);

  if (!normalized) return null;
  if (["mac", "macos", "darwin", "osx"].includes(normalized)) return "mac";
  if (["win", "windows", "win32", "win64"].includes(normalized)) return "windows";
  if (["linux", "appimage", "deb", "rpm"].includes(normalized)) return "linux";

  return null;
}

export function detectPlatformFromUserAgent(
  userAgent?: string | null,
  platformHint?: string | null,
): DownloadPlatform | null {
  const source = `${platformHint ?? ""} ${userAgent ?? ""}`.toLowerCase();

  if (/android|iphone|ipad|ipod/.test(source)) return null;
  if (/windows|win32|win64/.test(source)) return "windows";
  if (/macintosh|mac os|macos|darwin/.test(source)) return "mac";
  if (/linux|x11|ubuntu|debian|fedora|centos|appimage/.test(source)) return "linux";

  return null;
}

export function getPlatformLabel(platform: DownloadPlatform | null): string {
  if (platform === "mac") return "macOS";
  if (platform === "windows") return "Windows";
  if (platform === "linux") return "Linux";
  return "Desktop";
}

export function getPrimaryDownloadLabel(platform: DownloadPlatform | null): string {
  if (!platform) return "View Desktop Downloads";
  return `Download for ${getPlatformLabel(platform)}`;
}

export function getDownloadHref(platform?: DownloadPlatform | null): string {
  if (!platform) return "/api/download";
  return `/api/download?platform=${platform}`;
}

export const manualDownloadLinks: Array<{ platform: DownloadPlatform; label: string; href: string }> = [
  { platform: "mac", label: "macOS", href: getDownloadHref("mac") },
  { platform: "windows", label: "Windows", href: getDownloadHref("windows") },
  { platform: "linux", label: "Linux", href: getDownloadHref("linux") },
];

function scoreMacAsset(name: string): number {
  const normalized = name.toLowerCase();
  if (IGNORED_RELEASE_ASSET_PATTERN.test(normalized)) return 0;

  let score = 0;
  if (/-mac\.zip$/.test(normalized)) score += 160;
  if (/mac/.test(normalized)) score += 50;
  if (/\.zip$/.test(normalized)) score += 30;
  if (/\.dmg$/.test(normalized)) score += 20;
  return score;
}

function scoreWindowsAsset(name: string): number {
  const normalized = name.toLowerCase();
  if (IGNORED_RELEASE_ASSET_PATTERN.test(normalized)) return 0;

  let score = 0;
  if (/\.exe$/.test(normalized)) score += 180;
  if (/\.msi$/.test(normalized)) score += 150;
  if (/setup|nsis|win|windows/.test(normalized)) score += 40;
  if (/\.zip$/.test(normalized)) score += 10;
  return score;
}

function scoreLinuxAsset(name: string): number {
  const normalized = name.toLowerCase();
  if (IGNORED_RELEASE_ASSET_PATTERN.test(normalized)) return 0;

  let score = 0;
  if (/\.appimage$/.test(normalized)) score += 180;
  if (/\.deb$/.test(normalized)) score += 150;
  if (/\.rpm$/.test(normalized)) score += 140;
  if (/pacman|pkg\.tar\.zst/.test(normalized)) score += 130;
  if (/linux/.test(normalized)) score += 40;
  return score;
}

export function pickReleaseAsset(
  assets: ReleaseAsset[],
  platform: DownloadPlatform,
): ReleaseAsset | null {
  const scoreAsset = platform === "mac"
    ? scoreMacAsset
    : platform === "windows"
      ? scoreWindowsAsset
      : scoreLinuxAsset;

  const rankedAssets = assets
    .map((asset) => ({ asset, score: scoreAsset(asset.name) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.asset.name.localeCompare(b.asset.name));

  return rankedAssets[0]?.asset ?? null;
}
