import { describe, expect, it } from "vitest"

import { isPinnedLabel, labelOpacity, type GraphLabelDatum } from "@/lib/graph-labels"

function makeNode(overrides: Partial<GraphLabelDatum> = {}): GraphLabelDatum {
  return {
    id: "node-1",
    title: "Example Note",
    linkCount: 0,
    labelRank: 12,
    ...overrides,
  }
}

describe("graph label visibility", () => {
  it("keeps all labels pinned for small and medium graphs", () => {
    expect(isPinnedLabel(makeNode({ labelRank: 20 }), 18)).toBe(true)
    expect(isPinnedLabel(makeNode({ labelRank: 22 }), 24)).toBe(true)
  })

  it("keeps non-pinned leaf labels visible enough in mid-density graphs before deep zoom", () => {
    const opacity = labelOpacity(
      makeNode({ linkCount: 0, labelRank: 18 }),
      32,
      null,
      null,
      1,
      "",
    )

    expect(opacity).toBeGreaterThan(0)
  })

  it("still hides low-priority labels in larger graphs until zoomed or focused", () => {
    const opacity = labelOpacity(
      makeNode({ linkCount: 0, labelRank: 30 }),
      64,
      null,
      null,
      1,
      "",
    )

    expect(opacity).toBe(0)
  })

  it("always reveals selected, hovered, or filtered nodes", () => {
    const node = makeNode({ id: "match-me", title: "Bentley Bentayga" })

    expect(labelOpacity(node, 64, "match-me", null, 1, "")).toBe(1)
    expect(labelOpacity(node, 64, null, "match-me", 1, "")).toBe(1)
    expect(labelOpacity(node, 64, null, null, 1, "Bentley")).toBe(1)
  })
})
