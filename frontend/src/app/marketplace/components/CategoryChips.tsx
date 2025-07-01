import React from 'react'
import { CATEGORIES } from '../constants'

interface CategoryChipsProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  isDarkMode?: boolean
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onCategoryChange,
  isDarkMode = false
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 mb-6">
      <div className="flex gap-2 min-w-max px-6 md:px-0">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full
                text-sm font-medium transition-colors duration-200
                whitespace-nowrap
                ${isSelected
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                }
              `}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
              {category.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryChips 