"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { FiColumns, FiX, FiMaximize2, FiMinimize2, FiPlus } from "react-icons/fi"

/**
 * SplitPanes
 *
 * A resizable split-view container that allows side-by-side editing
 * of multiple notes or mixed workspace tabs.
 *
 * Features:
 * - Horizontal (left/right) split
 * - Drag-to-resize divider with snap points
 * - Close / maximize individual panes
 * - Plug any React child into each pane slot
 */

export interface SplitPaneSlot {
  /** Unique identifier for this pane */
  id: string
  /** Label shown in the pane header */
  label: string
  /** The content to render */
  content: React.ReactNode
}

interface SplitPanesProps {
  /** The primary (left/top) pane content */
  primaryContent: React.ReactNode
  /** Callback when user requests opening a second pane */
  onRequestSplit?: () => void
  /** The secondary pane content (null = single pane mode) */
  secondaryContent?: React.ReactNode | null
  /** Label for the secondary pane header */
  secondaryLabel?: string
  /** Called when the secondary pane is closed */
  onCloseSecondary?: () => void
  /** Direction of split */
  direction?: "horizontal" | "vertical"
}

export function SplitPanes({
  primaryContent,
  onRequestSplit,
  secondaryContent = null,
  secondaryLabel = "Split View",
  onCloseSecondary,
  direction = "horizontal",
}: SplitPanesProps) {
  const [splitRatio, setSplitRatio] = useState(0.5) // 0-1 ratio for primary pane
  const [isDragging, setIsDragging] = useState(false)
  const [maximizedPane, setMaximizedPane] = useState<"primary" | "secondary" | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isSplit = secondaryContent !== null

  // Handle divider drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
    },
    [],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      let ratio: number

      if (direction === "horizontal") {
        ratio = (e.clientX - rect.left) / rect.width
      } else {
        ratio = (e.clientY - rect.top) / rect.height
      }

      // Clamp with minimum pane sizes (20% each)
      ratio = Math.max(0.2, Math.min(0.8, ratio))

      // Snap to 50% when near center
      if (Math.abs(ratio - 0.5) < 0.03) ratio = 0.5

      setSplitRatio(ratio)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, direction])

  // Single pane mode
  if (!isSplit) {
    return (
      <div className="relative w-full h-full">
        {primaryContent}

        {/* Split button overlay */}
        {onRequestSplit && (
          <button
            onClick={onRequestSplit}
            className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-0 hover:opacity-100 focus:opacity-100 transition-all duration-200"
            style={{
              backgroundColor: "var(--bg-panel-inset)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-dark)",
            }}
            title="Open split view (Ctrl+\\)"
          >
            <FiColumns size={13} />
            Split
          </button>
        )}
      </div>
    )
  }

  // Split mode
  const isHorizontal = direction === "horizontal"
  const primarySize = maximizedPane === "secondary" ? "0%" : maximizedPane === "primary" ? "100%" : `${splitRatio * 100}%`
  const secondarySize = maximizedPane === "primary" ? "0%" : maximizedPane === "secondary" ? "100%" : `${(1 - splitRatio) * 100}%`

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex ${isHorizontal ? "flex-row" : "flex-col"}`}
      style={{ cursor: isDragging ? (isHorizontal ? "col-resize" : "row-resize") : undefined }}
    >
      {/* Primary pane */}
      <div
        className="overflow-hidden relative"
        style={{
          [isHorizontal ? "width" : "height"]: primarySize,
          display: maximizedPane === "secondary" ? "none" : undefined,
          transition: isDragging ? "none" : "all 0.2s ease",
        }}
      >
        {primaryContent}
      </div>

      {/* Divider */}
      {!maximizedPane && (
        <div
          className={`relative flex-shrink-0 group ${
            isHorizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"
          }`}
          onMouseDown={handleMouseDown}
          style={{
            backgroundColor: isDragging ? "var(--accent-primary)" : "var(--border-dark)",
            transition: isDragging ? "none" : "background-color 0.15s",
          }}
        >
          {/* Larger hit target */}
          <div
            className={`absolute ${
              isHorizontal
                ? "inset-y-0 -left-1 -right-1"
                : "inset-x-0 -top-1 -bottom-1"
            }`}
          />
          {/* Drag handle dots */}
          <div
            className={`absolute ${
              isHorizontal
                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row gap-0.5"
            } opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: "var(--text-tertiary)" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Secondary pane */}
      <div
        className="overflow-hidden relative"
        style={{
          [isHorizontal ? "width" : "height"]: secondarySize,
          display: maximizedPane === "primary" ? "none" : undefined,
          transition: isDragging ? "none" : "all 0.2s ease",
        }}
      >
        {/* Secondary pane header */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-3 py-1.5 border-b"
          style={{
            backgroundColor: "var(--bg-panel)",
            borderColor: "var(--border-dark)",
          }}
        >
          <FiColumns size={12} style={{ color: "var(--accent-primary)", opacity: 0.6 }} />
          <span
            className="text-xs font-medium truncate flex-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {secondaryLabel}
          </span>

          {/* Maximize/restore */}
          <button
            onClick={() =>
              setMaximizedPane((prev) =>
                prev === "secondary" ? null : "secondary",
              )
            }
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title={maximizedPane === "secondary" ? "Restore" : "Maximize"}
          >
            {maximizedPane === "secondary" ? (
              <FiMinimize2 size={11} style={{ color: "var(--text-tertiary)" }} />
            ) : (
              <FiMaximize2 size={11} style={{ color: "var(--text-tertiary)" }} />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onCloseSecondary}
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
            title="Close split"
          >
            <FiX size={12} style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>

        {/* Secondary content (padded for header) */}
        <div className="w-full h-full pt-8">{secondaryContent}</div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Split Pane Manager Hook                                            */
/* ================================================================== */

export interface SplitState {
  isActive: boolean
  secondaryNoteId: string | null
  direction: "horizontal" | "vertical"
}

/**
 * Hook to manage split pane state across the workspace.
 * Stores which note (if any) is open in the secondary pane.
 */
export function useSplitPanes() {
  const [splitState, setSplitState] = useState<SplitState>({
    isActive: false,
    secondaryNoteId: null,
    direction: "horizontal",
  })

  const openSplit = useCallback((noteId?: string) => {
    setSplitState((prev) => ({
      ...prev,
      isActive: true,
      secondaryNoteId: noteId || null,
    }))
  }, [])

  const closeSplit = useCallback(() => {
    setSplitState({
      isActive: false,
      secondaryNoteId: null,
      direction: "horizontal",
    })
  }, [])

  const setSecondaryNote = useCallback((noteId: string | null) => {
    setSplitState((prev) => ({ ...prev, secondaryNoteId: noteId }))
  }, [])

  const toggleDirection = useCallback(() => {
    setSplitState((prev) => ({
      ...prev,
      direction: prev.direction === "horizontal" ? "vertical" : "horizontal",
    }))
  }, [])

  return {
    splitState,
    openSplit,
    closeSplit,
    setSecondaryNote,
    toggleDirection,
  }
}
