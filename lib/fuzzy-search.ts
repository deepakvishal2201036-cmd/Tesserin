/**
 * Fuzzy Search Engine for Tesserin
 *
 * A lightweight, zero-dependency fuzzy matching engine optimised
 * for knowledge-base search:
 *
 * - Smith-Waterman–inspired scoring (rewards consecutive matches)
 * - Bonus for word boundaries, camelCase, path separators
 * - Title matches weighted higher than body matches
 * - Returns ranked results with highlighted spans
 * - Search filters: tag:X, date:YYYY-MM-DD, in:title/content
 * - Trigram index for fast candidate pre-filtering on large vaults
 * - Unlinked mentions detection
 *
 * Usage:
 *   const engine = new FuzzySearchEngine(notes)
 *   const results = engine.search("react hook")
 *   const results = engine.search("tag:research react hook")
 *   const mentions = engine.findUnlinkedMentions("My Note Title")
 */

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface SearchableItem {
  id: string
  title: string
  content: string
  /** Extra metadata passed through to results */
  meta?: Record<string, unknown>
}

export interface FuzzyMatch {
  /** Start index of the match */
  start: number
  /** Length of the matched substring */
  length: number
}

export interface FuzzyResult {
  item: SearchableItem
  /** Overall score (higher = better match) */
  score: number
  /** Match positions in the title */
  titleMatches: FuzzyMatch[]
  /** Match positions in the content (first occurrence only) */
  contentMatches: FuzzyMatch[]
  /** Short content snippet around the first match */
  snippet: string
  /** Which filters were active */
  filters?: ParsedFilters
}

export interface UnlinkedMention {
  /** The item containing the unlinked mention */
  item: SearchableItem
  /** Context snippet around the mention */
  snippet: string
  /** Position of the mention in content */
  position: { start: number; length: number }
  /** Line number (0-indexed) */
  line: number
}

/* ================================================================== */
/*  Search Filters                                                     */
/* ================================================================== */

export interface ParsedFilters {
  /** tag:xyz filters */
  tags: string[]
  /** date:YYYY-MM-DD or date:today, date:week */
  dateFilter: string | null
  /** in:title or in:content to restrict search scope */
  scope: "all" | "title" | "content"
  /** The remaining query text after filters are removed */
  query: string
}

/**
 * Parse filter prefixes from a search query.
 * Supported: tag:X, date:X, in:title, in:content
 */
export function parseSearchFilters(rawQuery: string): ParsedFilters {
  const tags: string[] = []
  let dateFilter: string | null = null
  let scope: "all" | "title" | "content" = "all"

  // Extract tag: filters
  let query = rawQuery.replace(/\btag:(\S+)/gi, (_, tag) => {
    tags.push(tag.toLowerCase())
    return ""
  })

  // Extract date: filter
  query = query.replace(/\bdate:(\S+)/gi, (_, date) => {
    dateFilter = date.toLowerCase()
    return ""
  })

  // Extract in: filter
  query = query.replace(/\bin:(title|content)/gi, (_, s) => {
    scope = s.toLowerCase() as "title" | "content"
    return ""
  })

  return {
    tags,
    dateFilter,
    scope,
    query: query.replace(/\s+/g, " ").trim(),
  }
}

/**
 * Check if an item passes the date filter.
 */
function passesDateFilter(item: SearchableItem, dateFilter: string): boolean {
  const updatedAt = (item.meta?.updatedAt as string) || ""
  const createdAt = (item.meta?.createdAt as string) || ""
  const itemDate = updatedAt || createdAt
  if (!itemDate) return true

  const d = new Date(itemDate)
  const now = new Date()

  switch (dateFilter) {
    case "today": {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return d >= today
    }
    case "yesterday": {
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return d >= yesterday && d < today
    }
    case "week": {
      const weekAgo = new Date(now.getTime() - 7 * 86400000)
      return d >= weekAgo
    }
    case "month": {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return d >= monthAgo
    }
    default: {
      // Try exact date match YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
        return itemDate.startsWith(dateFilter)
      }
      return true
    }
  }
}

/**
 * Check if content contains any of the specified tags.
 * Looks for #tag or tags in YAML frontmatter.
 */
function passesTagFilter(item: SearchableItem, tags: string[]): boolean {
  if (tags.length === 0) return true
  const contentLower = item.content.toLowerCase()
  return tags.some((tag) => {
    // Check #tag in content
    const hashTag = `#${tag}`
    if (contentLower.includes(hashTag)) return true
    // Check bare tag word in frontmatter-style "tags: [a, b]"
    const tagListMatch = contentLower.match(/tags:\s*\[([^\]]*)\]/)
    if (tagListMatch) {
      return tagListMatch[1].split(",").some((t) => t.trim() === tag)
    }
    return false
  })
}

/* ================================================================== */
/*  Scoring constants                                                  */
/* ================================================================== */

const SCORE_MATCH = 16          // Base score per matched char
const SCORE_CONSECUTIVE = 24    // Bonus for consecutive matches
const SCORE_WORD_START = 40     // Bonus when match is at word boundary
const SCORE_CAMEL_CASE = 32     // Bonus for camelCase boundary
const SCORE_EXACT_WORD = 80     // Bonus when entire query word matches exactly
const SCORE_TITLE_MULTIPLIER = 3 // Title matches worth 3× body matches
const PENALTY_GAP = -3          // Per-character penalty for gaps between matches
const PENALTY_LEADING = -1      // Penalty for chars before first match (max -30)

/* ================================================================== */
/*  Core matching                                                      */
/* ================================================================== */

function isWordBoundary(text: string, index: number): boolean {
  if (index === 0) return true
  const prev = text[index - 1]
  const curr = text[index]
  // Space, dash, underscore, slash, dot boundaries
  if (/[\s\-_/.]/.test(prev)) return true
  // camelCase boundary
  if (/[a-z]/.test(prev) && /[A-Z]/.test(curr)) return true
  // # header boundary
  if (prev === '#') return true
  return false
}

/**
 * Fuzzy-match a pattern against text, returning score + match positions.
 * Returns null if no match.
 */
export function fuzzyMatch(
  pattern: string,
  text: string,
): { score: number; matches: FuzzyMatch[] } | null {
  const patternLower = pattern.toLowerCase()
  const textLower = text.toLowerCase()
  const patternLen = patternLower.length
  const textLen = textLower.length

  if (patternLen === 0) return { score: 0, matches: [] }
  if (patternLen > textLen) return null

  // Quick bail: check all pattern chars exist in text
  let checkIdx = 0
  for (let i = 0; i < patternLen; i++) {
    const found = textLower.indexOf(patternLower[i], checkIdx)
    if (found === -1) return null
    checkIdx = found + 1
  }

  // Greedy forward matching with scoring
  let score = 0
  const matches: FuzzyMatch[] = []
  let patternIdx = 0
  let lastMatchIdx = -1
  let consecutiveCount = 0
  let firstMatchIdx = -1

  for (let textIdx = 0; textIdx < textLen && patternIdx < patternLen; textIdx++) {
    if (patternLower[patternIdx] === textLower[textIdx]) {
      if (firstMatchIdx === -1) firstMatchIdx = textIdx

      // Base match score
      score += SCORE_MATCH

      // Consecutive bonus
      if (lastMatchIdx === textIdx - 1) {
        consecutiveCount++
        score += SCORE_CONSECUTIVE * Math.min(consecutiveCount, 5)
      } else {
        consecutiveCount = 0
        // Gap penalty
        if (lastMatchIdx >= 0) {
          score += PENALTY_GAP * (textIdx - lastMatchIdx - 1)
        }
      }

      // Word boundary bonus
      if (isWordBoundary(text, textIdx)) {
        score += SCORE_WORD_START
      }

      // CamelCase bonus
      if (textIdx > 0 && /[a-z]/.test(text[textIdx - 1]) && /[A-Z]/.test(text[textIdx])) {
        score += SCORE_CAMEL_CASE
      }

      // Build match spans (merge consecutive)
      if (matches.length > 0) {
        const last = matches[matches.length - 1]
        if (last.start + last.length === textIdx) {
          last.length++
        } else {
          matches.push({ start: textIdx, length: 1 })
        }
      } else {
        matches.push({ start: textIdx, length: 1 })
      }

      lastMatchIdx = textIdx
      patternIdx++
    }
  }

  // If not all pattern chars were matched
  if (patternIdx !== patternLen) return null

  // Leading penalty (capped)
  if (firstMatchIdx > 0) {
    score += Math.max(PENALTY_LEADING * firstMatchIdx, -30)
  }

  return { score, matches }
}

/**
 * Match multi-word query: split by spaces, match each word,
 * sum scores. All words must match for a result.
 */
export function fuzzyMatchMultiWord(
  query: string,
  text: string,
): { score: number; matches: FuzzyMatch[] } | null {
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return { score: 0, matches: [] }

  // Single word → direct match
  if (words.length === 1) return fuzzyMatch(words[0], text)

  let totalScore = 0
  const allMatches: FuzzyMatch[] = []

  for (const word of words) {
    const result = fuzzyMatch(word, text)
    if (!result) return null

    totalScore += result.score
    allMatches.push(...result.matches)

    // Exact word match bonus
    const textLower = text.toLowerCase()
    const wordLower = word.toLowerCase()
    // Check if the word appears as a complete word
    const wordRegex = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (wordRegex.test(text)) {
      totalScore += SCORE_EXACT_WORD
    }
  }

  return { score: totalScore, matches: allMatches }
}

/* ================================================================== */
/*  Search Engine                                                      */
/* ================================================================== */

export class FuzzySearchEngine {
  private items: SearchableItem[] = []
  /** Trigram index: trigram → set of item IDs that contain it */
  private trigramIndex: Map<string, Set<string>> = new Map()
  /** Whether trigram index is built */
  private indexed = false

  constructor(items?: SearchableItem[]) {
    if (items) {
      this.items = items
      this.buildTrigramIndex()
    }
  }

  /** Replace the entire index */
  setItems(items: SearchableItem[]) {
    this.items = items
    this.buildTrigramIndex()
  }

  /** Add items to the index */
  addItems(items: SearchableItem[]) {
    this.items.push(...items)
    // Incrementally add trigrams
    for (const item of items) {
      this.addItemTrigrams(item)
    }
  }

  /** Remove items by ID */
  removeItems(ids: Set<string>) {
    this.items = this.items.filter((item) => !ids.has(item.id))
    // Rebuild index (could be optimized but simpler to rebuild)
    this.buildTrigramIndex()
  }

  /** Build trigram index for fast candidate filtering */
  private buildTrigramIndex() {
    this.trigramIndex.clear()
    for (const item of this.items) {
      this.addItemTrigrams(item)
    }
    this.indexed = true
  }

  /** Add trigrams for a single item */
  private addItemTrigrams(item: SearchableItem) {
    const text = `${item.title} ${item.content}`.toLowerCase()
    for (let i = 0; i <= text.length - 3; i++) {
      const tri = text.substring(i, i + 3)
      if (!this.trigramIndex.has(tri)) {
        this.trigramIndex.set(tri, new Set())
      }
      this.trigramIndex.get(tri)!.add(item.id)
    }
  }

  /** Get candidate item IDs using trigram index */
  private getCandidates(query: string): Set<string> | null {
    if (!this.indexed || query.length < 3) return null // fall back to full scan

    const queryLower = query.toLowerCase()
    const trigrams: string[] = []
    for (let i = 0; i <= queryLower.length - 3; i++) {
      trigrams.push(queryLower.substring(i, i + 3))
    }

    if (trigrams.length === 0) return null

    // Intersection of all trigram sets (require at least half to match for fuzzy)
    const threshold = Math.max(1, Math.floor(trigrams.length * 0.5))
    const counts = new Map<string, number>()

    for (const tri of trigrams) {
      const ids = this.trigramIndex.get(tri)
      if (ids) {
        for (const id of ids) {
          counts.set(id, (counts.get(id) || 0) + 1)
        }
      }
    }

    const candidates = new Set<string>()
    for (const [id, count] of counts) {
      if (count >= threshold) {
        candidates.add(id)
      }
    }

    return candidates.size > 0 ? candidates : null
  }

  /** Search with fuzzy matching and optional filters. Returns scored, sorted results. */
  search(query: string, limit = 20): FuzzyResult[] {
    if (!query.trim()) return []

    // Parse filters from query
    const filters = parseSearchFilters(query)
    const searchQuery = filters.query

    if (!searchQuery && filters.tags.length === 0 && !filters.dateFilter) {
      return []
    }

    // Use trigram index to narrow candidates
    const candidates = searchQuery ? this.getCandidates(searchQuery) : null

    const results: FuzzyResult[] = []

    for (const item of this.items) {
      // Skip items not in trigram candidates (when available)
      if (candidates && !candidates.has(item.id)) continue

      // Apply filters
      if (filters.tags.length > 0 && !passesTagFilter(item, filters.tags)) continue
      if (filters.dateFilter && !passesDateFilter(item, filters.dateFilter)) continue

      let totalScore = 0
      let titleMatches: FuzzyMatch[] = []
      let contentMatches: FuzzyMatch[] = []

      if (searchQuery) {
        // Match against title (3× weight)
        if (filters.scope !== "content") {
          const titleResult = fuzzyMatchMultiWord(searchQuery, item.title)
          if (titleResult) {
            totalScore += titleResult.score * SCORE_TITLE_MULTIPLIER
            titleMatches = titleResult.matches
          }
        }

        // Match against content
        if (filters.scope !== "title") {
          const contentResult = fuzzyMatchMultiWord(searchQuery, item.content)
          if (contentResult) {
            totalScore += contentResult.score
            contentMatches = contentResult.matches
          }
        }

        // Must match in at least one field
        if (totalScore === 0) continue
      } else {
        // No search query but has filters — include all that pass filters
        totalScore = 1
      }

      // Generate snippet
      const snippet = this.generateSnippet(item.content, contentMatches, 120)

      results.push({
        item,
        score: totalScore,
        titleMatches,
        contentMatches,
        snippet,
        filters,
      })
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score)

    return results.slice(0, limit)
  }

  /**
   * Find unlinked mentions of a title in all other notes.
   * Returns notes that mention the title text but don't have a [[wiki link]] to it.
   */
  findUnlinkedMentions(
    title: string,
    excludeNoteId?: string,
  ): UnlinkedMention[] {
    if (!title.trim()) return []

    const titleLower = title.toLowerCase()
    const titleWords = titleLower.split(/\s+/)
    const mentions: UnlinkedMention[] = []

    // Skip very short titles (too many false positives)
    if (titleLower.length < 3) return mentions

    for (const item of this.items) {
      if (item.id === excludeNoteId) continue

      const contentLower = item.content.toLowerCase()

      // Skip if already linked via [[Title]]
      const wikiLinkRegex = new RegExp(
        `\\[\\[${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\]`,
        "i",
      )
      const hasWikiLink = wikiLinkRegex.test(item.content)

      // Check for plain text mentions
      const lines = item.content.split("\n")
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const lineLower = lines[lineIdx].toLowerCase()
        const idx = lineLower.indexOf(titleLower)

        if (idx !== -1) {
          // Check this isn't inside a [[wiki link]]
          const lineRaw = lines[lineIdx]
          const beforeMatch = lineRaw.substring(0, idx)
          const afterMatch = lineRaw.substring(idx + title.length)
          const isInsideWikiLink = beforeMatch.includes("[[") &&
            afterMatch.includes("]]") &&
            !beforeMatch.substring(beforeMatch.lastIndexOf("[[")).includes("]]")

          if (isInsideWikiLink) continue

          // Check word boundary (not in middle of a word)
          const charBefore = idx > 0 ? lineLower[idx - 1] : " "
          const charAfter = idx + titleLower.length < lineLower.length
            ? lineLower[idx + titleLower.length]
            : " "
          const isWordBound = /[\s\-_.,;:!?()\[\]{}#*"'/]/.test(charBefore) &&
            /[\s\-_.,;:!?()\[\]{}#*"'/]/.test(charAfter)

          if (!isWordBound) continue

          // Build snippet
          const snippetStart = Math.max(0, idx - 40)
          const snippetEnd = Math.min(lines[lineIdx].length, idx + title.length + 40)
          let snippet = lines[lineIdx].substring(snippetStart, snippetEnd)
          if (snippetStart > 0) snippet = "…" + snippet
          if (snippetEnd < lines[lineIdx].length) snippet += "…"

          mentions.push({
            item,
            snippet,
            position: { start: idx, length: title.length },
            line: lineIdx,
          })
          break // One mention per note is enough
        }
      }
    }

    return mentions
  }

  /** Generate a content snippet around the first match */
  private generateSnippet(
    content: string,
    matches: FuzzyMatch[],
    maxLength: number,
  ): string {
    if (!content) return ""

    // Strip markdown headers and excessive whitespace
    const cleaned = content
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\n{2,}/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    if (matches.length === 0) {
      return cleaned.substring(0, maxLength) + (cleaned.length > maxLength ? "…" : "")
    }

    // Centre snippet around first match
    const firstMatch = matches[0]
    const matchCenter = firstMatch.start + Math.floor(firstMatch.length / 2)
    const halfLen = Math.floor(maxLength / 2)
    let start = Math.max(0, matchCenter - halfLen)
    let end = Math.min(cleaned.length, start + maxLength)

    // Adjust start if we're near the end
    if (end - start < maxLength) {
      start = Math.max(0, end - maxLength)
    }

    let snippet = cleaned.substring(start, end)
    if (start > 0) snippet = "…" + snippet
    if (end < cleaned.length) snippet += "…"

    return snippet
  }
}

/* ================================================================== */
/*  React hook for live search                                         */
/* ================================================================== */

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import type { Note } from "./notes-store"

/**
 * Debounced fuzzy search hook for React components.
 *
 * @param notes - The note array from useNotes()
 * @param debounceMs - Debounce delay in ms (default 150)
 */
export function useFuzzySearch(notes: Note[], debounceMs = 150) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<FuzzyResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const engineRef = useRef<FuzzySearchEngine | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep engine in sync with notes
  const engine = useMemo(() => {
    const items: SearchableItem[] = notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      meta: { createdAt: n.createdAt, updatedAt: n.updatedAt },
    }))
    const eng = new FuzzySearchEngine(items)
    engineRef.current = eng
    return eng
  }, [notes])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const res = engine.search(query, 25)
      setResults(res)
      setIsSearching(false)
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, engine, debounceMs])

  const clearSearch = useCallback(() => {
    setQuery("")
    setResults([])
  }, [])

  return { query, setQuery, results, isSearching, clearSearch }
}
