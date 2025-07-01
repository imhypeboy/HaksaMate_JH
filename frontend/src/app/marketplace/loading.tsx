import React from 'react'
import ProductSkeleton from './components/ProductSkeleton'

export default function Loading() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-4 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 animate-pulse" />
      </div>

      {/* 검색바 스켈레톤 */}
      <div className="mb-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
      </div>

      {/* 카테고리 칩 스켈레톤 */}
      <div className="flex gap-2 mb-8 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-24 animate-pulse" />
        ))}
      </div>

      {/* 상품 스켈레톤 */}
      <ProductSkeleton count={6} />
    </div>
  )
}
  