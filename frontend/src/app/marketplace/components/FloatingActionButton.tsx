import React from 'react'
import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  onClick: () => void
  isDarkMode?: boolean
  className?: string
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  isDarkMode = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 md:w-16 md:h-16
        rounded-2xl md:rounded-3xl
        flex items-center justify-center
        font-medium
        transition-all duration-200
        shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDarkMode
          ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-500/25'
          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-500/25'
        }
        ${className}
      `}
      aria-label="상품 등록하기"
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  )
}

export default FloatingActionButton 