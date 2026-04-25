import { describe, expect, it } from "vitest";
import {
  detectPlatformFromUserAgent,
  normalizeDownloadPlatform,
  pickReleaseAsset,
  type ReleaseAsset,
} from "@/lib/downloads";

describe("normalizeDownloadPlatform", () => {
  it("normalizes supported platform aliases", () => {
    expect(normalizeDownloadPlatform("macos")).toBe("mac");
    expect(normalizeDownloadPlatform("windows")).toBe("windows");
    expect(normalizeDownloadPlatform("deb")).toBe("linux");
  });

  it("returns null for unsupported values", () => {
    expect(normalizeDownloadPlatform("ios")).toBeNull();
    expect(normalizeDownloadPlatform("")).toBeNull();
  });
});

describe("detectPlatformFromUserAgent", () => {
  it("detects desktop operating systems", () => {
    expect(
      detectPlatformFromUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      ),
    ).toBe("mac");

    expect(
      detectPlatformFromUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ),
    ).toBe("windows");

    expect(
      detectPlatformFromUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      ),
    ).toBe("linux");
  });

  it("returns null for mobile devices", () => {
    expect(
      detectPlatformFromUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBeNull();
  });
});

describe("pickReleaseAsset", () => {
  const assets: ReleaseAsset[] = [
    { name: "Tesserin-1.2.0-arm64-mac.zip", browser_download_url: "https://example.com/mac.zip" },
    { name: "Tesserin Setup 1.2.0.exe", browser_download_url: "https://example.com/windows.exe" },
    { name: "Tesserin-1.2.0.AppImage", browser_download_url: "https://example.com/linux.appimage" },
    { name: "latest-mac.yml", browser_download_url: "https://example.com/latest-mac.yml" },
    { name: "Tesserin-1.2.0-arm64-mac.zip.blockmap", browser_download_url: "https://example.com/mac.blockmap" },
  ];

  it("picks the preferred asset for each platform", () => {
    expect(pickReleaseAsset(assets, "mac")?.browser_download_url).toBe("https://example.com/mac.zip");
    expect(pickReleaseAsset(assets, "windows")?.browser_download_url).toBe("https://example.com/windows.exe");
    expect(pickReleaseAsset(assets, "linux")?.browser_download_url).toBe("https://example.com/linux.appimage");
  });
});
