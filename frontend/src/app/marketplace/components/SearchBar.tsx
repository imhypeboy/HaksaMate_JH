"use client"

import React, { useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterClick: () => void
  isDarkMode?: boolean
}

const SearchBar = React.memo(({ searchQuery, onSearchChange, onFilterClick, isDarkMode = false }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-500 ${
        isDarkMode
          ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
          : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
      } shadow-xl`}
    >
      <div className="flex gap-4">
        <div className={`flex-1 relative transition-all duration-500 ${isFocused ? "scale-[1.02]" : ""}`}>
          <Search
            size={20}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              isFocused
                ? isDarkMode
                  ? "text-blue-400"
                  : "text-blue-500"
                : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="어떤 상품을 찾고 계신가요?"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full pl-12 pr-4 py-4 rounded-2xl transition-all duration-500 focus:outline-none ${
              isFocused
                ? isDarkMode
                  ? "bg-gray-700 border-2 border-blue-400/50 text-white placeholder-gray-300 shadow-lg shadow-blue-500/10"
                  : "bg-blue-50/50 border-2 border-blue-300 text-gray-900 placeholder-gray-500 shadow-lg shadow-blue-500/10"
                : isDarkMode
                  ? "bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400"
                  : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        {/* 데스크톱에서만 필터 버튼 표시 */}
        <button
          onClick={onFilterClick}
          className={`hidden lg:flex px-6 py-4 rounded-2xl font-medium transition-colors duration-200 items-center gap-3 ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
          }`}
        >
          <SlidersHorizontal size={20} />
          <span>필터</span>
        </button>
      </div>
    </div>
  )
})

SearchBar.displayName = "SearchBar"

export default SearchBar
