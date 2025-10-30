"use client"

import { useState } from "react"

interface TreeNodeData {
  label: string
  type: "object" | "array" | "string" | "number" | "boolean" | "null"
  value?: any
  path: string
}

interface TreeNodeProps {
  data: TreeNodeData
  isHighlighted?: boolean
  isDarkMode?: boolean
}

export default function TreeNode({ data, isHighlighted = false, isDarkMode = true }: TreeNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getNodeColor = () => {
    if (isHighlighted) return "bg-yellow-400 text-slate-900 ring-2 ring-yellow-300"
    switch (data.type) {
      case "object":
        return "bg-blue-600 text-white"
      case "array":
        return "bg-green-600 text-white"
      case "string":
        return "bg-orange-500 text-white"
      case "number":
        return "bg-purple-600 text-white"
      case "boolean":
        return "bg-pink-600 text-white"
      case "null":
        return "bg-gray-600 text-white"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const getDisplayValue = () => {
    if (data.type === "object") return "{}"
    if (data.type === "array") return "[]"
    if (data.type === "null") return "null"
    if (data.type === "string") return `"${data.value}"`
    return String(data.value)
  }

  const handleCopyPath = () => {
    navigator.clipboard.writeText(data.path)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`${getNodeColor()} rounded-lg px-3 py-2 text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 ${
          isHighlighted ? "animate-pulse" : ""
        }`}
      >
        <div className="whitespace-nowrap">{data.label}</div>
        {data.type !== "object" && data.type !== "array" && (
          <div className="text-xs opacity-75">{getDisplayValue()}</div>
        )}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg animate-in fade-in duration-200 z-50">
          <div className="mb-1 font-mono">{data.path}</div>
          <button onClick={handleCopyPath} className="text-blue-400 hover:text-blue-300">
            Copy path
          </button>
        </div>
      )}
    </div>
  )
}
