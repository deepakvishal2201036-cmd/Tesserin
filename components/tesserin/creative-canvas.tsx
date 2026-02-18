import React, { useRef, useEffect, useCallback } from "react"
import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
} from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { TesserinLogo } from "./tesserin-logo"

/**
 * CreativeCanvas — Tesseradraw
 *
 * Wraps the Excalidraw engine in permanent dark mode.
 *
 * KEY INSIGHT: Do NOT pass custom appState in initialData — that
 * interferes with Excalidraw's own dark-mode initialisation, which
 * sets white strokes, dark background, etc. automatically.
 * Instead, rely entirely on theme="dark" and only nudge the
 * viewBackgroundColor afterwards.
 */

const DARK_BG = "#121212"

/* ── component ───────────────────────────────────────────── */

export function CreativeCanvas() {
  const apiRef = useRef<any>(null)

  // Clear any stale Excalidraw localStorage that could persist light-mode prefs
  useEffect(() => {
    try {
      // Excalidraw uses a generic key for localStorage persistence
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.startsWith("excalidraw")) {
          localStorage.removeItem(key)
        }
      }
    } catch {
      // localStorage may not be available
    }
  }, [])

  const onAPI = useCallback((api: any) => {
    apiRef.current = api
    // Only nudge the background color — leave stroke/fill to Excalidraw dark theme
    try {
      api.updateScene({
        appState: { viewBackgroundColor: DARK_BG },
      })
    } catch {}
  }, [])

  /* ── render ───────────────────────────────────────────── */
  return (
    <div className="w-full h-full relative">
      <Excalidraw
        excalidrawAPI={onAPI}
        theme="dark"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: { saveFileToDisk: true },
            loadScene: true,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveToActiveFile />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.Help />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Center>
            <div className="flex flex-col items-center justify-center pointer-events-none select-none">
              <TesserinLogo size={64} animated />
              <h1
                className="text-3xl font-bold mt-4 tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Tesseradraw
              </h1>
              <p className="text-sm opacity-60 mt-2">AI-Enhanced Creative Canvas</p>
            </div>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>
    </div>
  )
}
