"use client"

import React, { useState } from "react"
import { Heart, Eye, MapPin, Clock, MessageCircle, Star } from "lucide-react"
import type { Product } from "../types"

interface ProductCardProps {
  product: Product
  onLike?: (productId: string) => void
  onChat?: (sellerId: string) => void
  onClick?: (product: Product) => void
  isDarkMode?: boolean
}

const ProductCard = React.memo(({ product, onLike, onChat, onClick, isDarkMode = false }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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

  const getConditionColor = (condition: string) => {
    if (isDarkMode) {
      switch (condition) {
        case "new":
          return "bg-green-500/20 text-green-300"
        case "like-new":
          return "bg-blue-500/20 text-blue-300"
        case "good":
          return "bg-yellow-500/20 text-yellow-300"
        case "fair":
          return "bg-orange-500/20 text-orange-300"
        case "poor":
          return "bg-red-500/20 text-red-300"
        default:
          return "bg-gray-500/20 text-gray-300"
      }
    } else {
      switch (condition) {
        case "new":
          return "bg-green-50 text-green-600"
        case "like-new":
          return "bg-blue-50 text-blue-600"
        case "good":
          return "bg-yellow-50 text-yellow-600"
        case "fair":
          return "bg-orange-50 text-orange-600"
        case "poor":
          return "bg-red-50 text-red-600"
        default:
          return "bg-gray-50 text-gray-600"
      }
    }
  }

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "new":
        return "새상품"
      case "like-new":
        return "거의 새것"
      case "good":
        return "좋음"
      case "fair":
        return "보통"
      case "poor":
        return "나쁨"
      default:
        return condition
    }
  }

  return (
    <div
      className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isDarkMode
          ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
          : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
      } shadow-lg hover:shadow-2xl group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(product)}
      style={{
        transform: `scale(${isHovered ? 1.02 : 1})`,
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl mb-4 bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0] || "/placeholder.svg?height=300&width=300&query=product"}
            alt={product.title}
            className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <div className="text-4xl">📦</div>
          </div>
        )}

        {product.status === "reserved" && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            예약중
          </div>
        )}
        {product.status === "sold" && (
          <div className="absolute top-3 left-3 bg-gray-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            판매완료
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onLike?.(product.id)
          }}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            product.isLiked
              ? "bg-pink-500 text-white scale-110 shadow-lg shadow-pink-500/30"
              : isDarkMode
                ? "bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:bg-pink-500/20 hover:text-pink-300"
                : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-pink-50 hover:text-pink-500"
          } shadow-lg hover:scale-110 active:scale-95`}
        >
          <Heart size={18} className={product.isLiked ? "fill-current" : ""} />
        </button>

        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            +{product.images.length - 1}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3
          className={`font-semibold text-base line-clamp-2 mb-3 transition-colors duration-300 ${
            isDarkMode ? "text-white group-hover:text-blue-300" : "text-gray-900 group-hover:text-blue-600"
          }`}
        >
          {product.title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-xl font-bold transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {formatPrice(product.price)}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getConditionColor(product.condition)}`}>
            {getConditionLabel(product.condition)}
          </span>
        </div>

        <div
          className={`flex items-center justify-between text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{product.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{formatTimeAgo(product.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-400 to-blue-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-700"
              } shadow-lg`}
            >
              <span className="text-white text-sm font-medium">{product.sellerName[0]}</span>
            </div>
            <div>
              <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                {product.sellerName}
              </span>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-current" />
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {product.sellerRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-4 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{product.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={12} />
              <span>{product.likes}</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onChat?.(product.sellerId)
          }}
          className={`w-full py-3 rounded-2xl font-medium transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center gap-2 ${
            isDarkMode
              ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          } hover:scale-105 active:scale-95`}
        >
          <MessageCircle size={18} />
          채팅하기
        </button>
      </div>
    </div>
  )
})

ProductCard.displayName = "ProductCard"

export default ProductCard
