import React from 'react'
import { Heart, MessageCircle, MoreVertical } from 'lucide-react'
import type { Product } from '../types'
import { ProductBadge } from './ProductBadge'
import { PriceDisplay } from './PriceDisplay'

interface ImprovedProductCardProps {
  product: Product
  onLike: (productId: string) => void
  onChat: (sellerId: string) => void
  onClick: (product: Product) => void
  currentUserId?: string
  isDarkMode?: boolean
}

const ImprovedProductCard: React.FC<ImprovedProductCardProps> = ({
  product,
  onLike,
  onChat,
  onClick,
  currentUserId,
  isDarkMode = false
}) => {
  const isOwner = currentUserId === product.sellerId
  // ✨ 컴포넌트화로 하드코딩 제거

  return (
    <div
      className={`group relative rounded-3xl p-6 transition-colors duration-200 cursor-pointer ${
        isDarkMode
          ? 'bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/40'
          : 'bg-white/90 hover:bg-white border border-gray-200/60'
      } shadow-lg hover:shadow-xl`}
      onClick={() => onClick(product)}
    >
      {/* 상품 이미지 */}
      <div className="relative mb-4 overflow-hidden rounded-2xl">
        <div className="aspect-video w-full">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className="text-4xl">📦</span>
            </div>
          )}
        </div>

        {/* 상태 배지 */}
        <div className="absolute top-3 left-3">
          <ProductBadge status={product.status || 'available'} />
        </div>

        {/* 좋아요 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onLike(product.id)
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${
            product.isLiked
              ? 'bg-red-500 text-white'
              : isDarkMode
                ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart
            size={16}
            className={product.isLiked ? 'fill-current' : ''}
          />
        </button>
      </div>

      {/* 상품 정보 */}
      <div className="space-y-3">
        {/* 제목 */}
        <h3
          className={`font-semibold line-clamp-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {product.title}
        </h3>

        {/* 설명 */}
        <p
          className={`text-sm line-clamp-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {product.description}
        </p>

        {/* 가격 */}
        <div className="flex items-center justify-between">
          <PriceDisplay price={product.price} size="lg" />
          
          <div className="flex items-center gap-2">
            {/* 좋아요 수 */}
            <span
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              ❤️ {product.likes || 0}
            </span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-2 pt-2">
          {!isOwner && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onChat(product.sellerId)
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <MessageCircle size={16} />
                채팅하기
              </button>
            </>
          )}

          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                // 추가적인 메뉴 기능을 위한 버튼
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>

        {/* 판매자 정보 */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {product.sellerName?.[0] || '?'}
          </div>
          <span
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {product.sellerName || '익명'}
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            • {product.location || '위치 미설정'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ImprovedProductCard 