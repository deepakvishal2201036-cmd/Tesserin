"use client"

import React, { useEffect, useRef, useCallback, useState } from "react"
import {
  pluginRegistry,
  usePlugins,
  type TesserinPluginAPI,
  type TesserinPlugin,
  type PluginEventType,
} from "@/lib/plugin-system"
import { useNotes } from "@/lib/notes-store"
import { getSetting, setSetting } from "@/lib/storage-client"
import { BUILT_IN_PLUGINS } from "@/lib/builtin-plugins"

/**
 * PluginProvider
 *
 * Wraps the application and:
 * 1. Creates the TesserinPluginAPI factory that bridges plugins to the notes store
 * 2. Registers and activates built-in plugins on mount
 * 3. Emits lifecycle events (app:ready, note:selected, etc.)
 */

interface PluginProviderProps {
  children: React.ReactNode
  /** Callback for showing toast/notice messages */
  onNotice?: (message: string, duration?: number) => void
  /** Callback for navigating to a tab */
  onNavigateTab?: (tabId: string) => void
}

export function PluginProvider({ children, onNotice, onNavigateTab }: PluginProviderProps) {
  const { notes, selectedNoteId, selectNote, addNote, updateNote, deleteNote, searchNotes } = useNotes()
  const initialised = useRef(false)

  // Create the API factory for plugins
  const createAPI = useCallback(
    (pluginId: string): TesserinPluginAPI => ({
      registerCommand: (cmd) => pluginRegistry.addCommand(pluginId, cmd),
      registerPanel: (panel) => pluginRegistry.addPanel(pluginId, panel),
      registerStatusBarWidget: (widget) => pluginRegistry.addStatusBarWidget(pluginId, widget),
      registerMarkdownProcessor: (proc) => pluginRegistry.addMarkdownProcessor(pluginId, proc),
      registerCodeBlockRenderer: (renderer) => pluginRegistry.addCodeBlockRenderer(pluginId, renderer),
      registerSAMTool: (tool) => pluginRegistry.addSAMTool(pluginId, tool),

      on: (event, handler) => pluginRegistry.addEventListener(pluginId, event, handler),
      off: (event, handler) => pluginRegistry.removeEventListener(pluginId, event, handler),

      vault: {
        list: () =>
          notes.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
          })),
        get: (id) => {
          const n = notes.find((n) => n.id === id)
          return n ? { id: n.id, title: n.title, content: n.content } : undefined
        },
        getSelected: () => {
          if (!selectedNoteId) return null
          const n = notes.find((n) => n.id === selectedNoteId)
          return n ? { id: n.id, title: n.title, content: n.content } : null
        },
        search: (query) => {
          const q = query.toLowerCase()
          return notes
            .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
            .map((n) => ({ id: n.id, title: n.title, content: n.content }))
        },
        create: (title, content) => addNote(title),
        update: (id, updates) => updateNote(id, updates),
        delete: (id) => deleteNote(id),
        selectNote: (id) => selectNote(id),
      },

      settings: {
        get: (key) => {
          // Synchronous access via localStorage for plugins
          try {
            const raw = localStorage.getItem("tesserin:settings")
            const settings = raw ? JSON.parse(raw) : {}
            return settings[key] ?? null
          } catch {
            return null
          }
        },
        set: (key, value) => {
          setSetting(key, value).catch(() => {})
        },
      },

      ui: {
        showNotice: (message, duration) => {
          if (onNotice) {
            onNotice(message, duration)
          } else {
            console.log(`[Plugin Notice] ${message}`)
          }
        },
        navigateToTab: (tabId) => {
          onNavigateTab?.(tabId)
        },
      },
    }),
    [notes, selectedNoteId, selectNote, addNote, updateNote, deleteNote, onNotice, onNavigateTab],
  )

  // Register and activate built-in plugins on mount
  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    async function init() {
      for (const plugin of BUILT_IN_PLUGINS) {
        pluginRegistry.register(plugin)
        await pluginRegistry.activate(plugin.manifest.id, createAPI)
      }

      // Emit app:ready
      await pluginRegistry.emit({
        type: "app:ready",
        timestamp: Date.now(),
      })
    }

    init()
  }, [createAPI])

  // Emit note:selected when selection changes
  useEffect(() => {
    if (selectedNoteId) {
      pluginRegistry.emit({
        type: "note:selected",
        data: { noteId: selectedNoteId },
        timestamp: Date.now(),
      })
    }
  }, [selectedNoteId])

  return <>{children}</>
}

/* ================================================================== */
/*  Status Bar Component                                               */
/* ================================================================== */

/**
 * StatusBar
 *
 * A thin bar at the bottom of the workspace showing:
 * - Left-aligned plugin widgets (e.g. git status, sync indicator)
 * - Center-aligned widgets (e.g. daily quote)
 * - Right-aligned widgets (e.g. word count, cursor position)
 */

export function StatusBar() {
  const { statusBarWidgets } = usePlugins()

  const leftWidgets = statusBarWidgets.filter((w) => (w.align ?? "left") === "left")
  const centerWidgets = statusBarWidgets.filter((w) => w.align === "center")
  const rightWidgets = statusBarWidgets.filter((w) => w.align === "right")

  if (statusBarWidgets.length === 0) return null

  return (
    <div
      className="flex items-center px-4 py-1.5 gap-4 flex-shrink-0"
      style={{
        backgroundColor: "var(--bg-panel)",
        borderTop: "1px solid var(--border-dark)",
        minHeight: 28,
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        {leftWidgets.map((widget) => (
          <widget.component key={widget.id} />
        ))}
      </div>

      {/* Center */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {centerWidgets.map((widget) => (
          <widget.component key={widget.id} />
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {rightWidgets.map((widget) => (
          <widget.component key={widget.id} />
        ))}
      </div>
    </div>
  )
}
