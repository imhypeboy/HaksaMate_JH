import React from 'react'

interface ProductSkeletonProps {
  count?: number
  isDarkMode?: boolean
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6, isDarkMode = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`rounded-3xl p-6 ${
            isDarkMode
              ? "bg-gray-800/60 border border-gray-700/40"
              : "bg-white/90 border border-gray-200/60"
          } shadow-lg`}
        >
          {/* 이미지 스켈레톤 */}
          <div
            className={`w-full h-48 rounded-2xl mb-4 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            } animate-pulse`}
          />
          
          {/* 제목 스켈레톤 */}
          <div
            className={`h-6 rounded-lg mb-3 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            } animate-pulse`}
            style={{ width: '80%' }}
          />
          
          {/* 설명 스켈레톤 */}
          <div className="space-y-2 mb-4">
            <div
              className={`h-4 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
            <div
              className={`h-4 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
              style={{ width: '60%' }}
            />
          </div>
          
          {/* 가격 스켈레톤 */}
          <div
            className={`h-8 rounded-lg mb-4 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            } animate-pulse`}
            style={{ width: '40%' }}
          />
          
          {/* 버튼들 스켈레톤 */}
          <div className="flex gap-2">
            <div
              className={`h-10 rounded-xl flex-1 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
            <div
              className={`h-10 w-10 rounded-xl ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductSkeleton 