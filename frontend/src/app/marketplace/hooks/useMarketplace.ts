"use client"

import { useState, useCallback } from "react"
import type { Product, SearchFilters } from "../types"

const BASE_URL = "http://localhost:8080"

export const useMarketplace = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const loadProducts = useCallback(async (filters: SearchFilters, page = 0) => {
    console.log("📦 상품 목록 로드 시작:", { filters, page })
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${BASE_URL}/api/items`)

      if (!response.ok) {
        throw new Error(`상품 목록 조회 실패: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ 상품 목록 로드 성공:", data.length, "개")

      // 백엔드 응답을 프론트엔드 타입으로 변환
      const transformedProducts: Product[] = data.map((item: any) => ({
        id: item.itemid.toString(),
        title: item.title,
        description: item.description,
        price: item.price,
        images: item.itemImages || [],
        category: item.category,
        condition: "good" as const, // 백엔드에 condition 필드가 없으므로 기본값
        location: item.meetLocation || "위치 미정",
        sellerId: item.sellerId,
        sellerName: item.sellerName || "익명",
        sellerRating: 4.5, // 기본값
        createdAt: new Date(item.regdate),
        updatedAt: new Date(item.regdate),
        status: mapBackendStatus(item.status),
        views: 0, // 백엔드에 views 필드가 없음
        likes: 0, // 별도 API로 조회 필요
        isLiked: false, // 별도 API로 조회 필요
        tags: [],
      }))

      // 필터 적용
      let filteredProducts = transformedProducts

      if (filters.category && filters.category !== "all") {
        filteredProducts = filteredProducts.filter((p) => p.category === filters.category)
      }

      // 정렬 적용
      if (filters.sortBy === "price-low") {
        filteredProducts.sort((a, b) => a.price - b.price)
      } else if (filters.sortBy === "price-high") {
        filteredProducts.sort((a, b) => b.price - a.price)
      } else {
        filteredProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }

      setProducts(filteredProducts)
    } catch (error) {
      console.error("��� 상품 목록 로드 실패:", error)
      setError(error instanceof Error ? error.message : "상품 목록을 불러오는데 실패했습니다.")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const searchProducts = useCallback(async (searchQuery: string, filters: SearchFilters) => {
    console.log("🔍 상품 검색:", { searchQuery, filters })
    setIsLoading(true)
    setError(null)

    try {
      // 전체 상품을 먼저 로드한 후 클라이언트에서 필터링
      // 실제로는 백엔드에서 검색 API를 제공해야 함
      const response = await fetch(`${BASE_URL}/api/items`)

      if (!response.ok) {
        throw new Error(`상품 검색 실패: ${response.status}`)
      }

      const data = await response.json()

      const transformedProducts: Product[] = data.map((item: any) => ({
        id: item.itemid.toString(),
        title: item.title,
        description: item.description,
        price: item.price,
        images: item.itemImages || [],
        category: item.category,
        condition: "good" as const,
        location: item.meetLocation || "위치 미정",
        sellerId: item.sellerId,
        sellerName: item.sellerName || "익명",
        sellerRating: 4.5,
        createdAt: new Date(item.regdate),
        updatedAt: new Date(item.regdate),
        status: mapBackendStatus(item.status),
        views: 0,
        likes: 0,
        isLiked: false,
        tags: [],
      }))

      // 검색어로 필터링
      let filteredProducts = transformedProducts.filter((product) => {
        const query = searchQuery.toLowerCase()
        return product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
      })

      // 카테고리 필터 적용
      if (filters.category && filters.category !== "all") {
        filteredProducts = filteredProducts.filter((p) => p.category === filters.category)
      }

      setProducts(filteredProducts)
      console.log("✅ 상품 검색 성공:", filteredProducts.length, "개")
    } catch (error) {
      console.error("❌ 상품 검색 실패:", error)
      setError(error instanceof Error ? error.message : "상품 검색에 실패했습니다.")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const likeProduct = useCallback(async (productId: string, userId: string) => {
    try {
      console.log("❤️ 상품 좋아요:", { productId, userId })

      const response = await fetch(`${BASE_URL}/api/likes/${productId}?userId=${userId}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`좋아요 실패: ${response.status}`)
      }

      // 로컬 상태 업데이트
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                isLiked: true,
                likes: product.likes + 1,
              }
            : product,
        ),
      )

      console.log("✅ 좋아요 성공")
      return true
    } catch (error) {
      console.error("❌ 좋아요 실패:", error)
      return false
    }
  }, [])

  const unlikeProduct = useCallback(async (productId: string, userId: string) => {
    try {
      console.log("💔 상품 좋아요 취소:", { productId, userId })

      const response = await fetch(`${BASE_URL}/api/likes/${productId}?userId=${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`좋아요 취소 실패: ${response.status}`)
      }

      // 로컬 상태 업데이트
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                isLiked: false,
                likes: Math.max(0, product.likes - 1),
              }
            : product,
        ),
      )

      console.log("✅ 좋아요 취소 성공")
      return true
    } catch (error) {
      console.error("❌ 좋아요 취소 실패:", error)
      return false
    }
  }, [])

  const getProduct = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      console.log("📦 상품 상세 조회:", productId)

      const response = await fetch(`${BASE_URL}/api/items/${productId}`)

      if (!response.ok) {
        throw new Error(`상품 조회 실패: ${response.status}`)
      }

      const item = await response.json()
      console.log("✅ 상품 상세 조회 성공:", item)

      return {
        id: item.itemid.toString(),
        title: item.title,
        description: item.description,
        price: item.price,
        images: item.itemImages || [],
        category: item.category,
        condition: "good" as const,
        location: item.meetLocation || "위치 미정",
        sellerId: item.sellerId,
        sellerName: item.sellerName || "익명",
        sellerRating: 4.5,
        createdAt: new Date(item.regdate),
        updatedAt: new Date(item.regdate),
        status: mapBackendStatus(item.status),
        views: 0,
        likes: 0,
        isLiked: false,
        tags: [],
      }
    } catch (error) {
      console.error("❌ 상품 상세 조회 실패:", error)
      return null
    }
  }, [])

  const createProduct = useCallback(async (productData: FormData) => {
    try {
      console.log("📝 상품 등록:", productData)

      const response = await fetch(`${BASE_URL}/api/items`, {
        method: "POST",
        body: productData,
      })

      if (!response.ok) {
        throw new Error(`상품 등록 실패: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ 상품 등록 성공:", result)
      return result
    } catch (error) {
      console.error("❌ 상품 등록 실패:", error)
      throw error
    }
  }, [])

  return {
    products,
    isLoading,
    error,
    totalPages,
    currentPage,
    loadProducts,
    searchProducts,
    likeProduct,
    unlikeProduct,
    getProduct,
    createProduct,
  }
}

// 백엔드 상태를 프론트엔드 상태로 매핑
const mapBackendStatus = (status: string): "available" | "reserved" | "sold" => {
  switch (status) {
    case "판매중":
      return "available"
    case "예약중":
      return "reserved"
    case "거래완료":
      return "sold"
    default:
      return "available"
  }
}
