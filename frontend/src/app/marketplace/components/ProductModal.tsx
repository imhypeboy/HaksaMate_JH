"use client"

import type React from "react"
import { X, Heart, MessageCircle, MapPin, Clock, Star, Eye } from "lucide-react"
import type { Product } from "../types"

interface ProductModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onLike: (productId: string) => void
  onChat: (sellerId: string) => void
  isDarkMode?: boolean
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onLike,
  onChat,
  isDarkMode = false,
}) => {
  if (!isOpen) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원"
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "방금 전"
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl ${
          isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        } shadow-2xl`}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit rounded-t-3xl">
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>상품 상세</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 이미지 섹션 */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                )}
              </div>

              {/* 추가 이미지들 */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 정보 섹션 */}
            <div className="space-y-6">
              {/* 제목과 가격 */}
              <div>
                <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {product.title}
                </h1>
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLike(product.id)}
                      className={`p-3 rounded-full transition-all ${
                        product.isLiked
                          ? "bg-pink-500 text-white"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-pink-500/20 hover:text-pink-300"
                            : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                      }`}
                    >
                      <Heart size={20} className={product.isLiked ? "fill-current" : ""} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>상품 설명</h3>
                  <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{product.description}</p>
                </div>

                {/* 위치 및 시간 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {product.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {formatTimeAgo(product.createdAt)}
                    </span>
                  </div>
                </div>

                {/* 통계 */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      조회 {product.views}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      좋아요 {product.likes}
                    </span>
                  </div>
                </div>
              </div>

              {/* 판매자 정보 */}
              <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>판매자 정보</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-medium">{product.sellerName[0]}</span>
                  </div>
                  <div>
                    <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {product.sellerName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {product.sellerRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 채팅 버��� */}
              <button
                onClick={() => onChat(product.sellerId)}
                className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 ${
                  isDarkMode
                    ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                } hover:scale-105 active:scale-95`}
              >
                <MessageCircle size={20} />
                판매자와 채팅하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
