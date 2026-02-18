/**
 * Version History System for Tesserin
 *
 * Tracks snapshots of note content over time with:
 * - Automatic snapshotting on save (debounced to avoid noise)
 * - Diff computation between versions
 * - Restore to any previous version
 * - localStorage persistence (Electron can use SQLite later)
 */

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface NoteVersion {
  /** Unique version ID */
  id: string
  /** The note ID this version belongs to */
  noteId: string
  /** Full content snapshot */
  content: string
  /** Note title at time of snapshot */
  title: string
  /** When this version was saved */
  createdAt: string
  /** Content byte size */
  size: number
  /** Optional label (e.g. "Before major rewrite") */
  label?: string
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged"
  content: string
  lineNumber: number
}

export interface DiffResult {
  /** Lines in the diff */
  lines: DiffLine[]
  /** Number of additions */
  additions: number
  /** Number of removals */
  removals: number
  /** Whether the versions are identical */
  identical: boolean
}

/* ================================================================== */
/*  Storage                                                            */
/* ================================================================== */

const VERSIONS_LS_KEY = "tesserin:versions"
const MAX_VERSIONS_PER_NOTE = 50
const MIN_CHANGE_CHARS = 10 // Minimum content change to create a new version

function loadVersions(): NoteVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveVersions(versions: NoteVersion[]): void {
  try {
    localStorage.setItem(VERSIONS_LS_KEY, JSON.stringify(versions))
  } catch {
    // localStorage might be full — prune old versions
    const pruned = versions.slice(-500)
    try {
      localStorage.setItem(VERSIONS_LS_KEY, JSON.stringify(pruned))
    } catch {
      // Give up silently
    }
  }
}

/* ================================================================== */
/*  Version Management                                                 */
/* ================================================================== */

/**
 * Create a new version snapshot for a note.
 * Returns the created version, or null if content hasn't changed enough.
 */
export function createVersion(
  noteId: string,
  title: string,
  content: string,
  label?: string,
): NoteVersion | null {
  const versions = loadVersions()
  const noteVersions = versions.filter((v) => v.noteId === noteId)

  // Check if content has changed enough from the last version
  if (noteVersions.length > 0) {
    const last = noteVersions[noteVersions.length - 1]
    if (last.content === content) return null

    // Check minimum change threshold
    const diff = Math.abs(content.length - last.content.length)
    const contentChanged = content !== last.content
    if (contentChanged && diff < MIN_CHANGE_CHARS && !label) {
      // Check if enough individual chars changed (simple Hamming-like check)
      const maxLen = Math.max(content.length, last.content.length)
      let changedChars = 0
      for (let i = 0; i < maxLen; i++) {
        if (content[i] !== last.content[i]) changedChars++
        if (changedChars >= MIN_CHANGE_CHARS) break
      }
      if (changedChars < MIN_CHANGE_CHARS) return null
    }
  }

  const version: NoteVersion = {
    id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    noteId,
    title,
    content,
    createdAt: new Date().toISOString(),
    size: new Blob([content]).size,
    label,
  }

  // Add and enforce per-note limit
  versions.push(version)
  const updatedNoteVersions = versions.filter((v) => v.noteId === noteId)
  if (updatedNoteVersions.length > MAX_VERSIONS_PER_NOTE) {
    const toRemove = updatedNoteVersions.length - MAX_VERSIONS_PER_NOTE
    const idsToRemove = new Set(
      updatedNoteVersions.slice(0, toRemove).map((v) => v.id),
    )
    const pruned = versions.filter((v) => !idsToRemove.has(v.id))
    saveVersions(pruned)
  } else {
    saveVersions(versions)
  }

  return version
}

/**
 * Get all versions for a specific note, sorted newest first.
 */
export function getVersionsForNote(noteId: string): NoteVersion[] {
  return loadVersions()
    .filter((v) => v.noteId === noteId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Get a specific version by ID.
 */
export function getVersion(versionId: string): NoteVersion | undefined {
  return loadVersions().find((v) => v.id === versionId)
}

/**
 * Delete a specific version.
 */
export function deleteVersion(versionId: string): void {
  const versions = loadVersions().filter((v) => v.id !== versionId)
  saveVersions(versions)
}

/**
 * Delete all versions for a note.
 */
export function clearVersionsForNote(noteId: string): void {
  const versions = loadVersions().filter((v) => v.noteId !== noteId)
  saveVersions(versions)
}

/**
 * Label a version (e.g. "Before refactor").
 */
export function labelVersion(versionId: string, label: string): void {
  const versions = loadVersions()
  const version = versions.find((v) => v.id === versionId)
  if (version) {
    version.label = label
    saveVersions(versions)
  }
}

/**
 * Get total storage used by versions.
 */
export function getVersionStorageStats(): { totalVersions: number; totalBytes: number; notesWithVersions: number } {
  const versions = loadVersions()
  const noteIds = new Set(versions.map((v) => v.noteId))
  const totalBytes = versions.reduce((sum, v) => sum + v.size, 0)
  return {
    totalVersions: versions.length,
    totalBytes,
    notesWithVersions: noteIds.size,
  }
}

/* ================================================================== */
/*  Diff Engine                                                        */
/* ================================================================== */

/**
 * Compute a line-by-line diff between two text versions.
 * Uses a simple LCS (Longest Common Subsequence) approach.
 */
export function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText.split("\n")
  const newLines = newText.split("\n")

  if (oldText === newText) {
    return {
      lines: oldLines.map((line, i) => ({ type: "unchanged", content: line, lineNumber: i + 1 })),
      additions: 0,
      removals: 0,
      identical: true,
    }
  }

  // Build LCS table
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to build diff
  const diffLines: DiffLine[] = []
  let i = m
  let j = n
  const tempLines: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      tempLines.push({ type: "unchanged", content: oldLines[i - 1], lineNumber: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempLines.push({ type: "added", content: newLines[j - 1], lineNumber: j })
      j--
    } else if (i > 0) {
      tempLines.push({ type: "removed", content: oldLines[i - 1], lineNumber: i })
      i--
    }
  }

  // Reverse to get correct order
  tempLines.reverse()

  // Renumber lines
  let lineNum = 0
  for (const line of tempLines) {
    lineNum++
    diffLines.push({ ...line, lineNumber: lineNum })
  }

  const additions = diffLines.filter((l) => l.type === "added").length
  const removals = diffLines.filter((l) => l.type === "removed").length

  return {
    lines: diffLines,
    additions,
    removals,
    identical: false,
  }
}

/* ================================================================== */
/*  React Hook                                                         */
/* ================================================================== */

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * Hook that auto-creates versions as the user edits a note.
 * Debounces snapshots to avoid creating versions on every keystroke.
 */
export function useVersionHistory(
  noteId: string | null,
  title: string,
  content: string,
  debounceMs = 5000,
) {
  const [versions, setVersions] = useState<NoteVersion[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastContentRef = useRef<string>("")

  // Load versions when note changes
  useEffect(() => {
    if (noteId) {
      setVersions(getVersionsForNote(noteId))
      lastContentRef.current = content
    } else {
      setVersions([])
    }
  }, [noteId])

  // Debounced auto-snapshot
  useEffect(() => {
    if (!noteId || !content || content === lastContentRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const created = createVersion(noteId, title, content)
      if (created) {
        setVersions(getVersionsForNote(noteId))
        lastContentRef.current = content
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [noteId, title, content, debounceMs])

  const createSnapshot = useCallback(
    (label?: string) => {
      if (!noteId) return null
      const version = createVersion(noteId, title, content, label)
      if (version) {
        setVersions(getVersionsForNote(noteId))
        lastContentRef.current = content
      }
      return version
    },
    [noteId, title, content],
  )

  const removeVersion = useCallback(
    (versionId: string) => {
      deleteVersion(versionId)
      if (noteId) setVersions(getVersionsForNote(noteId))
    },
    [noteId],
  )

  const clearAll = useCallback(() => {
    if (noteId) {
      clearVersionsForNote(noteId)
      setVersions([])
    }
  }, [noteId])

  return {
    versions,
    createSnapshot,
    removeVersion,
    clearAll,
    computeDiff,
  }
}
