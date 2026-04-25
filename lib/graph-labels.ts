export interface GraphLabelDatum {
  id: string
  title: string
  linkCount: number
  labelRank: number
  depth?: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function nodeRadius(d: Pick<GraphLabelDatum, "linkCount" | "depth">): number {
  if (d.depth !== undefined && d.depth <= 1 && d.linkCount > 0) return 6.5
  return clamp(3.5 + d.linkCount * 0.8, 3.5, 8)
}

export function maxTitleLength(d: Pick<GraphLabelDatum, "linkCount">, nodeCount: number): number {
  if (nodeCount > 60) return d.linkCount > 3 ? 20 : 12
  if (nodeCount > 24) return d.linkCount > 3 ? 22 : 14
  return d.linkCount > 3 ? 26 : 18
}

export function truncateTitle(title: string, maxLen: number): string {
  return title.length > maxLen ? `${title.slice(0, maxLen)}...` : title
}

export function labelFontSize(
  d: Pick<GraphLabelDatum, "id" | "linkCount" | "depth">,
  nodeCount: number,
  selectedId: string | null,
): number {
  if (d.id === selectedId) return 11.5
  if (nodeCount > 60) return 8
  if (nodeCount > 32) return 8.35
  if (d.depth !== undefined && d.depth <= 1 && d.linkCount > 0) return 10.5
  if (nodeCount > 20) return d.linkCount > 0 ? 8.85 : 8.6
  return nodeCount > 14 ? 9.1 : 9.5
}

export function pinnedLabelCount(nodeCount: number): number {
  if (nodeCount > 100) return 10
  if (nodeCount > 70) return 9
  if (nodeCount > 40) return 8
  if (nodeCount > 24) return 7
  if (nodeCount > 14) return 6
  return nodeCount
}

export function isPinnedLabel(
  d: Pick<GraphLabelDatum, "linkCount" | "labelRank">,
  nodeCount: number,
): boolean {
  if (nodeCount <= 24) return true
  const topCount = pinnedLabelCount(nodeCount)
  if (d.linkCount > 0 && d.labelRank < topCount) return true

  const hubThreshold = nodeCount > 60 ? 5 : nodeCount > 36 ? 4 : 3
  return d.linkCount >= hubThreshold && d.labelRank < topCount * 2
}

export function labelOpacity(
  d: Pick<GraphLabelDatum, "id" | "title" | "linkCount" | "labelRank">,
  nodeCount: number,
  selectedId: string | null,
  hoveredId: string | null,
  scale: number,
  filterQuery: string,
): number {
  const query = filterQuery.trim().toLowerCase()
  const matchesFilter = query.length > 0 && d.title.toLowerCase().includes(query)

  if (d.id === selectedId || d.id === hoveredId || matchesFilter) return 1
  if (query.length > 0) return 0
  if (isPinnedLabel(d, nodeCount)) {
    if (nodeCount > 40) return 0.78
    if (nodeCount > 24) return 0.74
    return 0.86
  }
  if (nodeCount <= 32 && scale >= 0.9) return d.linkCount > 0 ? 0.4 : 0.26
  if (nodeCount <= 48 && scale >= 1.1) return d.linkCount > 0 ? 0.32 : 0.18
  if (scale >= 2.25) return 0.7
  if (scale >= 1.45 && d.linkCount > 0) return 0.48
  return 0
}
