# Tesserin Marketing Site

This folder is the public marketing website for Tesserin. It is meant to be deployed on Vercel as a standalone project, separate from the desktop app codebase.

## What the download flow does

- The landing page detects the visitor's desktop OS in the browser.
- Download buttons point to `/api/download`.
- The Vercel function looks up the latest GitHub release for `AnvinX1/Tesserin-pro`.
- It redirects the visitor to the best matching asset for macOS, Windows, or Linux.
- If it cannot identify a platform or asset, it falls back to the latest GitHub releases page.

## Deploy on Vercel

Use this folder as the project root:

- Root Directory: `tesserin-your-ai-dev-workspace`
- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

This matters because it keeps the desktop application source out of the Vercel deployment. Only the contents of this folder and its `api/` function are deployed.

Keep `Include source files outside of the Root Directory` disabled for this project. That preserves the boundary between the public website and the desktop app source tree.

If a Vercel project is accidentally pointed at the repository root, the root-level `vercel.json` and `.vercelignore` now force the deployment to build only this marketing site and its download function. Using this folder as the Root Directory is still the cleanest setup.

## Release dependency

For downloads to work cleanly, GitHub releases for the desktop app should contain:

- macOS zip assets
- Windows installer assets (`.exe`)
- Linux assets (`.AppImage`, `.deb`, or `.rpm`)

The site resolves those assets dynamically from the latest published GitHub release.

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```
