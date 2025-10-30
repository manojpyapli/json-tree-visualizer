"use client"

import type React from "react"
import { useCallback, useState, useMemo } from "react"
import TreeNode from "./tree-node"

interface TreeVisualizationProps {
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
  isDarkMode: boolean
}

export default function TreeVisualization({
  nodes: initialNodes,
  edges: initialEdges,
  isDarkMode,
}: TreeVisualizationProps) {
  const [searchPath, setSearchPath] = useState("")
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [useRegex, setUseRegex] = useState(false)
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set())
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(initialNodes.map((n) => n.id)))
  const [scale, setScale] = useState(1)

  const pathSuggestions = useMemo(() => {
    if (!searchPath.trim()) return []
    const allPaths = initialNodes.map((node) => node.data.path).sort()
    const input = searchPath.toLowerCase()
    return allPaths.filter((path) => path.toLowerCase().includes(input)).slice(0, 5)
  }, [searchPath, initialNodes])

  const handleSearch = useCallback(() => {
  if (!searchPath.trim()) {
    setSearchResult(null)
    setHighlightedIds(new Set())
    return
  }

  let matchedIds: string[] = []

  try {
    // <CHANGE> Escape regex special characters so dots are treated as literal dots
    const escapeRegex = (str: string) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }

    if (useRegex) {
      try {
        // Escape the search string to treat special characters as literals
        const escapedSearch = escapeRegex(searchPath)
        const regex = new RegExp(escapedSearch, "i")
        console.log("[v0] Regex created:", regex)

        matchedIds = initialNodes
          .filter((node) => {
            const path = node.data.path || ""
            const label = String(node.data.label || "")
            const value = node.data.value !== undefined ? String(node.data.value) : ""

            const pathMatch = regex.test(path)
            const labelMatch = regex.test(label)
            const valueMatch = regex.test(value)

            if (pathMatch || labelMatch || valueMatch) {
              console.log("[v0] Match found - path:", path, "label:", label, "value:", value)
            }

            return pathMatch || labelMatch || valueMatch
          })
          .map((node) => node.id)
      } catch (regexError) {
        console.log("[v0] Regex error:", regexError)
        setSearchResult("Invalid regex pattern")
        setHighlightedIds(new Set())
        return
      }
    } else {
      const searchLower = searchPath.toLowerCase()
      console.log("[v0] Normal search - searchLower:", searchLower)

      matchedIds = initialNodes
        .filter((node) => {
          const path = (node.data.path || "").toLowerCase()
          const label = String(node.data.label || "").toLowerCase()
          const value = node.data.value !== undefined ? String(node.data.value).toLowerCase() : ""

          const pathMatch = path.includes(searchLower)
          const labelMatch = label.includes(searchLower)
          const valueMatch = value.includes(searchLower)

          if (pathMatch || labelMatch || valueMatch) {
            console.log("[v0] Match found - path:", path, "label:", label, "value:", value)
          }

          return pathMatch || labelMatch || valueMatch
        })
        .map((node) => node.id)
    }

    console.log("[v0] Total matches found:", matchedIds.length)

    if (matchedIds.length > 0) {
      const resultMessage = `Found ${matchedIds.length} match${matchedIds.length > 1 ? "es" : ""}`
      console.log("[v0] Setting result:", resultMessage)
      setSearchResult(resultMessage)
      setHighlightedIds(new Set(matchedIds))
    } else {
      console.log("[v0] No matches found")
      setSearchResult("No matches found")
      setHighlightedIds(new Set())
    }
  } catch (error) {
    console.log("[v0] Search error:", error)
    setSearchResult("Search error")
    setHighlightedIds(new Set())
  }
}, [searchPath, useRegex, initialNodes])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const applySuggestion = (suggestion: string) => {
    setSearchPath(suggestion)
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getChildNodes = (parentId: string) => {
    return initialEdges
      .filter((edge) => edge.source === parentId)
      .map((edge) => initialNodes.find((n) => n.id === edge.target))
      .filter(Boolean)
  }

  const renderNode = (nodeId: string, depth = 0): React.ReactNode => {
    const node = initialNodes.find((n) => n.id === nodeId)
    if (!node) return null

    const children = getChildNodes(nodeId)
    const isExpanded = expandedNodes.has(nodeId)
    const isHighlighted = highlightedIds.has(nodeId)

    return (
      <div key={nodeId} style={{ marginLeft: `${depth * 24}px` }} className="py-1">
        <div className="flex items-center gap-2">
          {children.length > 0 && (
            <button
              onClick={() => toggleNode(nodeId)}
              className={`flex h-6 w-6 items-center justify-center rounded text-sm font-bold transition-colors ${
                isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"
              }`}
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          {children.length === 0 && <div className="h-6 w-6" />}
          <TreeNode data={node.data} isHighlighted={isHighlighted} isDarkMode={isDarkMode} />
        </div>
        {isExpanded && children.map((child) => child && renderNode(child.id, depth + 1))}
      </div>
    )
  }

  const rootNodes = initialNodes.filter((node) => !initialEdges.some((edge) => edge.target === node.id))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by path, label, or value"
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                isDarkMode
                  ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500"
                  : "border-slate-400 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500"
              }`}
            />
            {pathSuggestions.length > 0 && searchPath.trim() && (
              <div
                className={`absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border shadow-lg ${
                  isDarkMode ? "border-slate-600 bg-slate-800" : "border-slate-400 bg-white"
                }`}
              >
                {pathSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => applySuggestion(suggestion)}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                      isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700"
          >
            Search
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="rounded border-slate-600"
            />
            Use Regex
          </label>
          {searchResult && (
            <p className={`text-sm font-medium ${searchResult.includes("Found") ? "text-green-400" : "text-red-400"}`}>
              {searchResult}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-300 hover:bg-slate-400"
            }`}
            title="Zoom out"
          >
            -
          </button>
          <button
            onClick={() => setScale(1)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-300 hover:bg-slate-400"
            }`}
            title="Reset zoom"
          >
            Reset
          </button>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.1))}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-300 hover:bg-slate-400"
            }`}
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div
        className={`h-96 overflow-auto rounded-lg border ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-100"}`}
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <div className="p-4">
          {rootNodes.length > 0 ? (
            rootNodes.map((node) => renderNode(node.id))
          ) : (
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>No data to display</p>
          )}
        </div>
      </div>
    </div>
  )
}