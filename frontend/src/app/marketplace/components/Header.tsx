"use client"

import React from "react"
import { Plus, Sun, Moon } from "lucide-react"

interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onAddProduct: () => void
}

const Header = React.memo(({ isDarkMode, onToggleTheme, onAddProduct }: HeaderProps) => {
  return (
    <header className="relative z-10 flex justify-center items-center p-6 md:p-8 pt-8">
      <div className="flex items-center gap-4">
        <div className="text-4xl">🥕</div>
        <div className="text-center">
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-bold transition-colors duration-500 ${
              isDarkMode ? "text-white" : "text-gray-800"
            } tracking-tight`}
          >
            중고마켓
          </h1>
          <p
            className={`text-sm md:text-base transition-colors duration-500 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            우리 학교 학생들과 안전한 거래
          </p>
        </div>
      </div>

      <div className="absolute right-6 md:right-8 flex items-center gap-3 md:gap-4">
        <button
          onClick={onAddProduct}
          className={`hidden md:flex px-6 py-4 rounded-2xl font-semibold transition-colors duration-200 items-center gap-2 ${
            isDarkMode
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <Plus size={20} />
          <span>판매하기</span>
        </button>

        <button
          onClick={onToggleTheme}
          className={`p-3 md:p-4 rounded-2xl transition-colors duration-200 ${
            isDarkMode
              ? "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
              : "bg-white/80 hover:bg-white/90 backdrop-blur-md border border-white/50"
          } shadow-lg`}
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-indigo-600" />}
        </button>
      </div>
    </header>
  )
})

Header.displayName = "Header"

export default Header
