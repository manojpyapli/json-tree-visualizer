"use client"

import { useState } from "react"

const SAMPLE_JSON = {
  user: {
    id: 1,
    name: "Arvind Kumar",
    email: "arvindkumar@gmail.com",
    address: {
      street: "silk institute",
      city: "Bangalore",
      zip: "560018",
    },
    hobbies: ["reading", "cooking", "coding"],
  },
}

interface JsonInputProps {
  onVisualize: (json: string) => void
  onReset: () => void
  error: string
  isDarkMode: boolean
}

export default function JsonInput({ onVisualize, onReset, error, isDarkMode }: JsonInputProps) {
  const [input, setInput] = useState(JSON.stringify(SAMPLE_JSON, null, 2))

  const handleVisualize = () => {
    onVisualize(input)
  }

  const handleLoadSample = () => {
    setInput(JSON.stringify(SAMPLE_JSON, null, 2))
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(input)
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border p-4 ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-100"}`}
      >
        <h2 className="mb-3 font-semibold">JSON Input</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JSON here..."
          className={`h-64 w-full rounded border p-3 font-mono text-sm focus:outline-none ${
            isDarkMode
              ? "border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-blue-500"
              : "border-slate-400 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500"
          }`}
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleVisualize}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700"
        >
          Visualize
        </button>
        <button
          onClick={onReset}
          className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
            isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-300 hover:bg-slate-400"
          }`}
        >
          Clear
        </button>
        <button
          onClick={handleCopyToClipboard}
          className={`w-full rounded-lg border px-4 py-2 font-medium transition-colors ${
            isDarkMode ? "border-slate-600 hover:bg-slate-800" : "border-slate-400 hover:bg-slate-200"
          }`}
        >
          Copy JSON
        </button>
        <button
          onClick={handleLoadSample}
          className={`w-full rounded-lg border px-4 py-2 font-medium transition-colors ${
            isDarkMode ? "border-slate-600 hover:bg-slate-800" : "border-slate-400 hover:bg-slate-200"
          }`}
        >
          Load Sample
        </button>
      </div>
    </div>
  )
}
