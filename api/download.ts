type DownloadPlatform = "mac" | "windows" | "linux";

type ReleaseAsset = {
  name: string;
  browser_download_url?: string;
};

type LatestReleaseResponse = {
  assets?: ReleaseAsset[];
  html_url?: string;
};

const RELEASE_REPO_OWNER = "AnvinX1";
const RELEASE_REPO_NAME = "Tesserin-pro";
const RELEASES_PAGE_URL = `https://github.com/${RELEASE_REPO_OWNER}/${RELEASE_REPO_NAME}/releases/latest`;
const IGNORED_RELEASE_ASSET_PATTERN = /\.(blockmap|ya?ml)$/i;

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}

function normalizeDownloadPlatform(value?: string | null): DownloadPlatform | null {
  const normalized = (value ?? "").trim().toLowerCase();

  if (!normalized) return null;
  if (["mac", "macos", "darwin", "osx"].includes(normalized)) return "mac";
  if (["win", "windows", "win32", "win64"].includes(normalized)) return "windows";
  if (["linux", "appimage", "deb", "rpm"].includes(normalized)) return "linux";

  return null;
}

function detectPlatformFromRequest(request: Request): DownloadPlatform | null {
  const url = new URL(request.url);
  const requestedPlatform = normalizeDownloadPlatform(url.searchParams.get("platform"));
  if (requestedPlatform) return requestedPlatform;

  const hintedPlatform = request.headers.get("sec-ch-ua-platform")?.replace(/"/g, "") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const source = `${hintedPlatform} ${userAgent}`.toLowerCase();

  if (/android|iphone|ipad|ipod/.test(source)) return null;
  if (/windows|win32|win64/.test(source)) return "windows";
  if (/macintosh|mac os|macos|darwin/.test(source)) return "mac";
  if (/linux|x11|ubuntu|debian|fedora|centos|appimage/.test(source)) return "linux";

  return null;
}

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

function pickReleaseAsset(
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

export async function GET(request: Request): Promise<Response> {
  const fallbackReleaseUrl = RELEASES_PAGE_URL;

  try {
    const platform = detectPlatformFromRequest(request);
    if (!platform) {
      return redirect(fallbackReleaseUrl);
    }

    const response = await fetch(
      `https://api.github.com/repos/${RELEASE_REPO_OWNER}/${RELEASE_REPO_NAME}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "tesserin-marketing-site",
        },
      },
    );

    if (!response.ok) {
      return redirect(fallbackReleaseUrl);
    }

    const release = (await response.json()) as LatestReleaseResponse;
    const asset = pickReleaseAsset(release.assets ?? [], platform);

    if (asset?.browser_download_url) {
      return redirect(asset.browser_download_url);
    }

    return redirect(release.html_url ?? fallbackReleaseUrl);
  } catch (error) {
    console.error("[download] redirect failed", error);
    return redirect(fallbackReleaseUrl);
  }
}
