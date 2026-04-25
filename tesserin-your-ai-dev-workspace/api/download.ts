import {
  RELEASE_REPO_NAME,
  RELEASE_REPO_OWNER,
  RELEASES_PAGE_URL,
  detectPlatformFromUserAgent,
  normalizeDownloadPlatform,
  pickReleaseAsset,
  type ReleaseAsset,
} from "../src/lib/downloads";

type LatestReleaseResponse = {
  assets?: ReleaseAsset[];
  html_url?: string;
};

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

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const requestedPlatform = normalizeDownloadPlatform(url.searchParams.get("platform"));
    const hintedPlatform = request.headers.get("sec-ch-ua-platform")?.replace(/"/g, "") ?? null;
    const detectedPlatform = requestedPlatform ?? detectPlatformFromUserAgent(
      request.headers.get("user-agent"),
      hintedPlatform,
    );

    const fallbackReleaseUrl = RELEASES_PAGE_URL;

    if (!detectedPlatform) {
      return redirect(fallbackReleaseUrl);
    }

    try {
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
      const asset = pickReleaseAsset(release.assets ?? [], detectedPlatform);

      if (asset?.browser_download_url) {
        return redirect(asset.browser_download_url);
      }

      return redirect(release.html_url ?? fallbackReleaseUrl);
    } catch {
      return redirect(fallbackReleaseUrl);
    }
  },
};
