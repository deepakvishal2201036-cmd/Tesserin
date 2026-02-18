/**
 * BibTeX Parser & Reference Manager for Tesserin
 *
 * Provides:
 * - BibTeX (.bib) file parsing
 * - Reference storage and retrieval
 * - Citation key generation
 * - Citation formatting (APA, Chicago, IEEE, MLA)
 * - Note-reference linking
 *
 * Citation syntax in notes: [@key] or [@key, p. 42]
 */

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface BibEntry {
  /** Citation key: e.g. "smith2023" */
  key: string
  /** Entry type: article, book, inproceedings, etc. */
  type: string
  /** Fields */
  title: string
  author: string
  year: string
  journal?: string
  booktitle?: string
  publisher?: string
  volume?: string
  number?: string
  pages?: string
  doi?: string
  url?: string
  abstract?: string
  keywords?: string
  /** Raw fields map */
  fields: Record<string, string>
  /** Notes that cite this reference */
  citingNoteIds: string[]
  /** Tags for organizing */
  tags: string[]
  /** User annotations/highlights */
  annotations: Annotation[]
  /** Date added to library */
  addedAt: string
}

export interface Annotation {
  id: string
  /** Text that was highlighted */
  text: string
  /** User comment on the highlight */
  comment: string
  /** Color label */
  color: "yellow" | "green" | "blue" | "red" | "purple"
  /** Page number (for PDFs) */
  page?: number
  /** Timestamp */
  createdAt: string
}

export type CitationStyle = "apa" | "chicago" | "ieee" | "mla"

/* ================================================================== */
/*  BibTeX Parser                                                      */
/* ================================================================== */

/**
 * Parse a BibTeX string into an array of BibEntry objects.
 * Handles common BibTeX formatting including nested braces and string concatenation.
 */
export function parseBibTeX(bibtex: string): BibEntry[] {
  const entries: BibEntry[] = []

  // Match @type{key, ...}
  const entryRegex = /@(\w+)\s*\{([^,]+),([^]*?)(?=\n\s*@|\n*$)/g
  let match: RegExpExecArray | null

  while ((match = entryRegex.exec(bibtex)) !== null) {
    const type = match[1].toLowerCase()
    const key = match[2].trim()
    const body = match[3]

    // Skip @string, @comment, @preamble
    if (["string", "comment", "preamble"].includes(type)) continue

    const fields: Record<string, string> = {}

    // Parse fields: key = {value} or key = "value" or key = number
    const fieldRegex = /(\w+)\s*=\s*(?:\{([^}]*(?:\{[^}]*\}[^}]*)*)\}|"([^"]*)"|(\d+))/g
    let fieldMatch: RegExpExecArray | null

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase()
      const value = (fieldMatch[2] || fieldMatch[3] || fieldMatch[4] || "").trim()
      fields[fieldName] = cleanBibValue(value)
    }

    entries.push({
      key,
      type,
      title: fields.title || "",
      author: fields.author || "",
      year: fields.year || "",
      journal: fields.journal,
      booktitle: fields.booktitle,
      publisher: fields.publisher,
      volume: fields.volume,
      number: fields.number,
      pages: fields.pages,
      doi: fields.doi,
      url: fields.url,
      abstract: fields.abstract,
      keywords: fields.keywords,
      fields,
      citingNoteIds: [],
      tags: fields.keywords
        ? fields.keywords.split(",").map((k) => k.trim().toLowerCase())
        : [],
      annotations: [],
      addedAt: new Date().toISOString(),
    })
  }

  return entries
}

/** Clean BibTeX value: remove extra braces, normalize whitespace */
function cleanBibValue(value: string): string {
  return value
    .replace(/\{([^}]*)\}/g, "$1") // Remove inner braces
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Parse author string into individual names.
 * BibTeX uses "and" to separate authors.
 */
export function parseAuthors(authorStr: string): string[] {
  if (!authorStr) return []
  return authorStr.split(/\s+and\s+/i).map((a) => a.trim()).filter(Boolean)
}

/**
 * Format a single author name for citation.
 * Handles "Last, First" and "First Last" formats.
 */
function formatAuthorLast(author: string): string {
  if (author.includes(",")) {
    return author.split(",")[0].trim()
  }
  const parts = author.split(/\s+/)
  return parts[parts.length - 1]
}

function formatAuthorFull(author: string): string {
  if (author.includes(",")) {
    const [last, first] = author.split(",").map((s) => s.trim())
    return `${last}, ${first}`
  }
  const parts = author.split(/\s+/)
  if (parts.length === 1) return parts[0]
  const last = parts.pop()!
  return `${last}, ${parts.join(" ")}`
}

/* ================================================================== */
/*  Citation Formatting                                                */
/* ================================================================== */

/**
 * Format a reference in the specified citation style.
 */
export function formatCitation(entry: BibEntry, style: CitationStyle): string {
  const authors = parseAuthors(entry.author)
  const year = entry.year

  switch (style) {
    case "apa":
      return formatAPA(entry, authors, year)
    case "chicago":
      return formatChicago(entry, authors, year)
    case "ieee":
      return formatIEEE(entry, authors, year)
    case "mla":
      return formatMLA(entry, authors, year)
    default:
      return formatAPA(entry, authors, year)
  }
}

function formatAPA(entry: BibEntry, authors: string[], year: string): string {
  // Author(s) (Year). Title. Source.
  let authorStr = ""
  if (authors.length === 1) {
    authorStr = formatAuthorFull(authors[0])
  } else if (authors.length === 2) {
    authorStr = `${formatAuthorFull(authors[0])} & ${formatAuthorFull(authors[1])}`
  } else if (authors.length > 2) {
    authorStr = `${formatAuthorFull(authors[0])} et al.`
  }

  let citation = `${authorStr} (${year}). ${entry.title}.`

  if (entry.journal) {
    citation += ` *${entry.journal}*`
    if (entry.volume) citation += `, *${entry.volume}*`
    if (entry.number) citation += `(${entry.number})`
    if (entry.pages) citation += `, ${entry.pages}`
    citation += "."
  } else if (entry.booktitle) {
    citation += ` In *${entry.booktitle}*`
    if (entry.pages) citation += ` (pp. ${entry.pages})`
    citation += "."
    if (entry.publisher) citation += ` ${entry.publisher}.`
  } else if (entry.publisher) {
    citation += ` ${entry.publisher}.`
  }

  if (entry.doi) citation += ` https://doi.org/${entry.doi}`

  return citation
}

function formatChicago(entry: BibEntry, authors: string[], year: string): string {
  let authorStr = authors.map(formatAuthorFull).join(", ")
  if (authors.length > 1) {
    const last = authors.length - 1
    authorStr = authors.slice(0, last).map(formatAuthorFull).join(", ") + ", and " + formatAuthorFull(authors[last])
  }

  let citation = `${authorStr}. "${entry.title}." `

  if (entry.journal) {
    citation += `*${entry.journal}*`
    if (entry.volume) citation += ` ${entry.volume}`
    if (entry.number) citation += `, no. ${entry.number}`
    citation += ` (${year})`
    if (entry.pages) citation += `: ${entry.pages}`
    citation += "."
  } else {
    citation += `${year}.`
    if (entry.publisher) citation += ` ${entry.publisher}.`
  }

  return citation
}

function formatIEEE(entry: BibEntry, authors: string[], year: string): string {
  const authorStr = authors.map((a) => {
    const parts = a.includes(",")
      ? a.split(",").reverse().map((s) => s.trim())
      : a.split(/\s+/)
    const initials = parts.slice(0, -1).map((p) => p[0] + ".").join(" ")
    const last = parts[parts.length - 1]
    return `${initials} ${last}`
  }).join(", ")

  let citation = `${authorStr}, "${entry.title}," `

  if (entry.journal) {
    citation += `*${entry.journal}*`
    if (entry.volume) citation += `, vol. ${entry.volume}`
    if (entry.number) citation += `, no. ${entry.number}`
    if (entry.pages) citation += `, pp. ${entry.pages}`
    citation += `, ${year}.`
  } else {
    citation += `${year}.`
  }

  return citation
}

function formatMLA(entry: BibEntry, authors: string[], year: string): string {
  let authorStr = ""
  if (authors.length === 1) {
    authorStr = formatAuthorFull(authors[0])
  } else if (authors.length === 2) {
    authorStr = `${formatAuthorFull(authors[0])} and ${formatAuthorFull(authors[1])}`
  } else if (authors.length > 2) {
    authorStr = `${formatAuthorFull(authors[0])}, et al.`
  }

  let citation = `${authorStr}. "${entry.title}." `

  if (entry.journal) {
    citation += `*${entry.journal}*`
    if (entry.volume) citation += `, vol. ${entry.volume}`
    if (entry.number) citation += `, no. ${entry.number}`
    citation += `, ${year}`
    if (entry.pages) citation += `, pp. ${entry.pages}`
    citation += "."
  } else {
    if (entry.publisher) citation += `${entry.publisher}, `
    citation += `${year}.`
  }

  return citation
}

/**
 * Format an inline citation like (Smith, 2023) or (Smith & Jones, 2023, p. 42)
 */
export function formatInlineCitation(
  entry: BibEntry,
  style: CitationStyle,
  page?: string,
): string {
  const authors = parseAuthors(entry.author)
  const lastNames = authors.map(formatAuthorLast)

  let authorPart = ""
  if (lastNames.length === 1) {
    authorPart = lastNames[0]
  } else if (lastNames.length === 2) {
    authorPart = `${lastNames[0]} & ${lastNames[1]}`
  } else if (lastNames.length > 2) {
    authorPart = `${lastNames[0]} et al.`
  }

  const pagePart = page ? `, p. ${page}` : ""

  switch (style) {
    case "apa":
    case "chicago":
      return `(${authorPart}, ${entry.year}${pagePart})`
    case "ieee":
      return `[${authorPart}, ${entry.year}]`
    case "mla":
      return `(${authorPart}${pagePart})`
  }
}

/* ================================================================== */
/*  Citation Key Generation                                            */
/* ================================================================== */

/**
 * Generate a citation key from author + year.
 * E.g., "Smith, John" + "2023" → "smith2023"
 */
export function generateCitationKey(author: string, year: string): string {
  const authors = parseAuthors(author)
  const lastName = authors.length > 0 ? formatAuthorLast(authors[0]).toLowerCase() : "unknown"
  const cleanName = lastName.replace(/[^a-z]/g, "")
  return `${cleanName}${year}`
}

/* ================================================================== */
/*  BibTeX Export                                                      */
/* ================================================================== */

/**
 * Export references back to BibTeX format.
 */
export function exportBibTeX(entries: BibEntry[]): string {
  return entries
    .map((e) => {
      const fields = Object.entries(e.fields)
        .map(([k, v]) => `  ${k} = {${v}}`)
        .join(",\n")
      return `@${e.type}{${e.key},\n${fields}\n}`
    })
    .join("\n\n")
}

/* ================================================================== */
/*  Citation extraction from markdown                                  */
/* ================================================================== */

/** Regex to find [@key] or [@key, p. 42] citations in markdown */
const CITATION_REGEX = /\[@([a-zA-Z0-9_-]+)(?:\s*,\s*(p\.\s*\d+))?\]/g

export interface CitationOccurrence {
  key: string
  page?: string
  start: number
  length: number
  line: number
}

/**
 * Extract all citation occurrences from markdown content.
 */
export function extractCitations(content: string): CitationOccurrence[] {
  const citations: CitationOccurrence[] = []
  const lines = content.split("\n")

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]
    let match: RegExpExecArray | null
    const regex = new RegExp(CITATION_REGEX.source, "g")

    while ((match = regex.exec(line)) !== null) {
      citations.push({
        key: match[1],
        page: match[2],
        start: match.index,
        length: match[0].length,
        line: lineIdx,
      })
    }
  }

  return citations
}

/**
 * Generate a bibliography section from citations found in content.
 */
export function generateBibliography(
  content: string,
  library: BibEntry[],
  style: CitationStyle,
): string {
  const citations = extractCitations(content)
  const usedKeys = new Set(citations.map((c) => c.key))
  const libraryMap = new Map(library.map((e) => [e.key, e]))

  const bibEntries: string[] = []

  for (const key of usedKeys) {
    const entry = libraryMap.get(key)
    if (entry) {
      bibEntries.push(formatCitation(entry, style))
    } else {
      bibEntries.push(`[${key}]: Reference not found in library`)
    }
  }

  if (bibEntries.length === 0) return ""

  return `\n\n---\n\n## References\n\n${bibEntries.map((b, i) => `${i + 1}. ${b}`).join("\n")}\n`
}
