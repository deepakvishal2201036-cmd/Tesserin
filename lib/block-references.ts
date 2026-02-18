/**
 * Block References System for Tesserin
 *
 * Implements Roam/Logseq-style block references:
 *
 * - Each paragraph/block can have a unique ^block-id appended
 * - Reference syntax: ((block-id)) embeds the block inline
 * - Auto-generates block IDs when user requests one
 * - Tracks cross-note block references for the backlinks panel
 *
 * Block ID format: ^[a-z0-9]{6}  (6-char alphanumeric)
 * Reference syntax: ((block-id))
 * Embed syntax: !((block-id))   — renders the full block inline
 */

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface Block {
  /** The block ID (without ^) */
  id: string
  /** The note ID containing this block */
  noteId: string
  /** The note title */
  noteTitle: string
  /** Full text content of the block (line/paragraph) */
  content: string
  /** Line number (0-indexed) in the note */
  lineIndex: number
}

export interface BlockReference {
  /** The block being referenced */
  blockId: string
  /** The note that contains the reference */
  sourceNoteId: string
  /** The note title of the source */
  sourceNoteTitle: string
  /** Line in the source containing the ((ref)) */
  sourceLine: number
  /** Whether it's an embed !((id)) or inline ((id)) */
  isEmbed: boolean
}

export interface BlockIndex {
  /** All blocks keyed by their block ID */
  blocks: Map<string, Block>
  /** All references keyed by the referenced block ID */
  references: Map<string, BlockReference[]>
}

/* ================================================================== */
/*  Utilities                                                          */
/* ================================================================== */

/** Generate a random 6-char alphanumeric block ID */
export function generateBlockId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let id = ""
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

/** Regex to find ^block-id markers at the end of a line */
const BLOCK_ID_REGEX = /\s\^([a-z0-9]{4,12})\s*$/

/** Regex to find ((block-id)) references */
const BLOCK_REF_REGEX = /\(\(([a-z0-9]{4,12})\)\)/g

/** Regex to find !((block-id)) embeds */
const BLOCK_EMBED_REGEX = /!\(\(([a-z0-9]{4,12})\)\)/g

/* ================================================================== */
/*  Parsing                                                            */
/* ================================================================== */

/**
 * Extract all block definitions from a note's content.
 * A block is any non-empty line that ends with ^block-id.
 */
export function extractBlocks(
  noteId: string,
  noteTitle: string,
  content: string,
): Block[] {
  const lines = content.split("\n")
  const blocks: Block[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(BLOCK_ID_REGEX)
    if (match) {
      const blockContent = line.replace(BLOCK_ID_REGEX, "").trim()
      if (blockContent) {
        blocks.push({
          id: match[1],
          noteId,
          noteTitle,
          content: blockContent,
          lineIndex: i,
        })
      }
    }
  }

  return blocks
}

/**
 * Extract all block references ((id)) and embeds !((id)) from content.
 */
export function extractBlockReferences(
  sourceNoteId: string,
  sourceNoteTitle: string,
  content: string,
): BlockReference[] {
  const lines = content.split("\n")
  const refs: BlockReference[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Embeds first (so we don't double-count)
    let embedMatch: RegExpExecArray | null
    const embedRegex = new RegExp(BLOCK_EMBED_REGEX.source, "g")
    while ((embedMatch = embedRegex.exec(line)) !== null) {
      refs.push({
        blockId: embedMatch[1],
        sourceNoteId,
        sourceNoteTitle,
        sourceLine: i,
        isEmbed: true,
      })
    }

    // Inline references (exclude embeds)
    const lineWithoutEmbeds = line.replace(BLOCK_EMBED_REGEX, "")
    let refMatch: RegExpExecArray | null
    const refRegex = new RegExp(BLOCK_REF_REGEX.source, "g")
    while ((refMatch = refRegex.exec(lineWithoutEmbeds)) !== null) {
      refs.push({
        blockId: refMatch[1],
        sourceNoteId,
        sourceNoteTitle,
        sourceLine: i,
        isEmbed: false,
      })
    }
  }

  return refs
}

/* ================================================================== */
/*  Block Index                                                        */
/* ================================================================== */

/**
 * Build a complete block index from all notes.
 * This is computed reactively whenever notes change.
 */
export function buildBlockIndex(
  notes: Array<{ id: string; title: string; content: string }>,
): BlockIndex {
  const blocks = new Map<string, Block>()
  const references = new Map<string, BlockReference[]>()

  // First pass: collect all block definitions
  for (const note of notes) {
    const noteBlocks = extractBlocks(note.id, note.title, note.content)
    for (const block of noteBlocks) {
      blocks.set(block.id, block)
    }
  }

  // Second pass: collect all references
  for (const note of notes) {
    const noteRefs = extractBlockReferences(note.id, note.title, note.content)
    for (const ref of noteRefs) {
      const existing = references.get(ref.blockId) || []
      existing.push(ref)
      references.set(ref.blockId, existing)
    }
  }

  return { blocks, references }
}

/**
 * Resolve a block reference to its content.
 * Returns null if the block doesn't exist.
 */
export function resolveBlockRef(
  blockId: string,
  index: BlockIndex,
): Block | null {
  return index.blocks.get(blockId) || null
}

/**
 * Get all notes that reference a specific block.
 */
export function getBlockBacklinks(
  blockId: string,
  index: BlockIndex,
): BlockReference[] {
  return index.references.get(blockId) || []
}

/**
 * Insert a block ID at the end of a line in content.
 * Returns the updated content and the new block ID.
 */
export function insertBlockId(
  content: string,
  lineIndex: number,
): { content: string; blockId: string } {
  const lines = content.split("\n")
  if (lineIndex < 0 || lineIndex >= lines.length) {
    return { content, blockId: "" }
  }

  const line = lines[lineIndex]

  // Check if line already has a block ID
  const existing = line.match(BLOCK_ID_REGEX)
  if (existing) {
    return { content, blockId: existing[1] }
  }

  const blockId = generateBlockId()
  lines[lineIndex] = `${line} ^${blockId}`

  return { content: lines.join("\n"), blockId }
}

/**
 * Parse block reference syntax in a string for rendering.
 * Returns segments of text and block references.
 */
export type ContentSegment =
  | { type: "text"; content: string }
  | { type: "block-ref"; blockId: string; isEmbed: boolean }

export function parseBlockReferences(text: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  let remaining = text
  let lastIndex = 0

  // Combined regex for both embeds and refs
  const combined = /(!?\(\(([a-z0-9]{4,12})\)\))/g
  let match: RegExpExecArray | null

  while ((match = combined.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      })
    }

    const isEmbed = match[1].startsWith("!")
    segments.push({
      type: "block-ref",
      blockId: match[2],
      isEmbed,
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.substring(lastIndex),
    })
  }

  return segments
}
