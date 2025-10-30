"use client"

import { useState } from "react"
import JsonInput from "@/components/json-input"
import TreeVisualization from "@/components/tree-visualization"
import { parseJsonToTree } from "@/lib/json-parser"

interface TreeNode {
  id: string
  data: {
    label: string
    type: "object" | "array" | "string" | "number" | "boolean" | "null"
    value?: any
    path: string
  }
  position: { x: number; y: number }
}

interface TreeEdge {
  id: string
  source: string
  target: string
}

export default function Home() {
  const [nodes, setNodes] = useState<TreeNode[]>([])
  const [edges, setEdges] = useState<TreeEdge[]>([])
  const [error, setError] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [jsonInput, setJsonInput] = useState("")

  const handleVisualize = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString)
      const result = parseJsonToTree(data)
      setNodes(result.nodes)
      setEdges(result.edges)
      setJsonInput(jsonString)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setNodes([])
      setEdges([])
    }
  }

  const handleReset = () => {
    setNodes([])
    setEdges([])
    setError("")
    setJsonInput("")
  }

  const handleDownloadJSON = () => {
    if (!jsonInput) return
    const element = document.createElement("a")
    const file = new Blob([jsonInput], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = "tree-data.json"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadImage = () => {
    if (nodes.length === 0) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const nodeWidth = 100
    const nodeHeight = 40

    let maxX = 0
    let maxY = 0
    nodes.forEach((node) => {
      maxX = Math.max(maxX, node.position.x + nodeWidth)
      maxY = Math.max(maxY, node.position.y + nodeHeight)
    })

    canvas.width = Math.max(800, maxX + 40)
    canvas.height = Math.max(600, maxY + 40)

    ctx.fillStyle = isDarkMode ? "#0f172a" : "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = isDarkMode ? "#64748b" : "#cbd5e1"
    ctx.lineWidth = 2
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)
      if (sourceNode && targetNode) {
        ctx.beginPath()
        ctx.moveTo(sourceNode.position.x + nodeWidth / 2, sourceNode.position.y + nodeHeight)
        ctx.lineTo(targetNode.position.x + nodeWidth / 2, targetNode.position.y)
        ctx.stroke()
      }
    })

    nodes.forEach((node) => {
      const x = node.position.x + 20
      const y = node.position.y + 20

      ctx.fillStyle = isDarkMode ? "#1e293b" : "#f1f5f9"
      ctx.strokeStyle = isDarkMode ? "#475569" : "#cbd5e1"
      ctx.lineWidth = 2
      ctx.fillRect(x, y, nodeWidth, nodeHeight)
      ctx.strokeRect(x, y, nodeWidth, nodeHeight)

      ctx.fillStyle = isDarkMode ? "#e2e8f0" : "#1e293b"
      ctx.font = "11px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const label = String(node.data.label)
      const displayLabel = label.length > 12 ? label.substring(0, 10) + ".." : label
      ctx.fillText(displayLabel, x + nodeWidth / 2, y + nodeHeight / 2)
    })

    const image = canvas.toDataURL("image/png")
    const element = document.createElement("a")
    element.href = image
    element.download = "tree-visualization.png"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"}`}>
      <header
        className={`border-b ${isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-100"} px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">JSON Tree Visualizer</h1>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Visualize JSON data as interactive hierarchical trees
            </p>
          </div>
          <div className="flex gap-2">
            {nodes.length > 0 && (
              <>
                <button
                  onClick={handleDownloadJSON}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Download JSON
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Download Image
                </button>
              </>
            )}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-6 p-6">
        <div className="w-96 flex-shrink-0">
          <JsonInput onVisualize={handleVisualize} onReset={handleReset} error={error} isDarkMode={isDarkMode} />
        </div>

        <div className="flex-1">
          {nodes.length > 0 ? (
            <TreeVisualization nodes={nodes} edges={edges} isDarkMode={isDarkMode} />
          ) : (
            <div
              className={`flex h-96 items-center justify-center rounded-lg border-2 border-dashed ${
                isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-100"
              }`}
            >
              <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                Paste JSON and click "Visualize" to see the tree
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}