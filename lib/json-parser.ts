interface ParseResult {
  nodes: Array<{
    id: string
    data: {
      label: string
      type: "object" | "array" | "string" | "number" | "boolean" | "null"
      value?: any
      path: string
    }
    position: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
  }>
}

let nodeId = 0

export function parseJsonToTree(data: any, path = "$"): ParseResult {
  nodeId = 0
  const nodes: ParseResult["nodes"] = []
  const edges: ParseResult["edges"] = []
  const nodePositions: { [key: string]: { x: number; y: number } } = {}
  const levelCounts: { [key: number]: number } = {}

  function traverse(
    value: any,
    currentPath: string,
    parentNodeId: string | null = null,
    depth = 0
  ): string {
    const id = `node-${nodeId++}`

    if (!levelCounts[depth]) levelCounts[depth] = 0
    const x = levelCounts[depth] * 150
    const y = depth * 100
    nodePositions[id] = { x, y }
    levelCounts[depth]++

    let label = ""
    let type: "object" | "array" | "string" | "number" | "boolean" | "null" = "null"
    let nodeValue: any = undefined

    if (value === null) {
      label = "null"
      type = "null"
    } else if (typeof value === "boolean") {
      label = String(value)
      type = "boolean"
      nodeValue = value
    } else if (typeof value === "number") {
      label = String(value)
      type = "number"
      nodeValue = value
    } else if (typeof value === "string") {
      label = value.length > 20 ? value.substring(0, 20) + "..." : value
      type = "string"
      nodeValue = value
    } else if (Array.isArray(value)) {
      label = `Array[${value.length}]`
      type = "array"
    } else if (typeof value === "object") {
      label = "Object"
      type = "object"
    }

    nodes.push({
      id,
      data: {
        label,
        type,
        value: nodeValue,
        path: currentPath,
      },
      position: nodePositions[id],
    })

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const childPath = `${currentPath}[${index}]`
        const childId = traverse(item, childPath, id, depth + 1)
        edges.push({
          id: `edge-${id}-${childId}`,
          source: id,
          target: childId,
        })
      })
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([key, val]) => {
        const childPath = currentPath === "$" ? `$.${key}` : `${currentPath}.${key}`
        const childId = traverse(val, childPath, id, depth + 1)
        edges.push({
          id: `edge-${id}-${childId}`,
          source: id,
          target: childId,
        })
      })
    }

    return id
  }

  traverse(data, path)
  return { nodes, edges }
}