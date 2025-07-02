"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Plus } from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import ProductCard from "./components/ProductCard"
import CategoryFilter from "./components/CategoryFilter"
import SearchBar from "./components/SearchBar"
import { MockDataFactory } from "../marketplace/data/mockData"
import type { Product } from "./types"

const MarketplacePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 🔧 중앙 데이터 시스템에서 상품 데이터 로드
  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      // 마켓플레이스 데이터를 Shop 타입으로 변환
      const marketplaceProducts = await MockDataFactory.createProductsWithDelay(600)
      
      const shopProducts: Product[] = marketplaceProducts.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        images: item.images,
        category: mapCategoryToShop(item.category),
        condition: item.condition,
        location: item.location,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        sellerRating: item.sellerRating,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        views: item.views,
        likes: item.likes,
        isLiked: item.isLiked,
        tags: item.tags
      }))

      setProducts(shopProducts)
    } catch (error) {
      console.error('상품 데이터 로드 실패:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 카테고리 매핑 함수
  const mapCategoryToShop = (marketplaceCategory: string): string => {
    const categoryMap: Record<string, string> = {
      '전자기기': 'electronics',
      '도서/교재': 'books',
      '휴대폰': 'mobile',
      '오디오': 'audio',
      '차량/오토바이': 'vehicle',
      '가구/인테리어': 'furniture',
      '의류/잡화': 'fashion',
      '생활용품': 'life'
    }
    return categoryMap[marketplaceCategory] || 'electronics'
  }

  // 컴포넌트 마운트 시 데이터 로드
  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 카테고리 필터
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false
      }

      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [products, selectedCategory, searchQuery])

  const handleLike = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              isLiked: !product.isLiked,
              likes: product.isLiked ? product.likes - 1 : product.likes + 1,
            }
          : product,
      ),
    )
  }, [])

  const handleChat = useCallback((sellerId: string) => {
    console.log("채팅 시작:", sellerId)
    // 채팅 모달 열기 로직
  }, [])

  const handleProductClick = useCallback((product: Product) => {
    console.log("상품 상세보기:", product.id)
    // 상품 상세 페이지로 이동 또는 모달 열기
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">중고마켓</h1>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus size={20} />
                <span>판매하기</span>
              </button>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onFilterClick={() => setShowFilters(!showFilters)}
            />
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* 상품 그리드 */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">상품을 불러오는 중...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">조건에 맞는 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onLike={handleLike}
                  onChat={handleChat}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketplacePage
