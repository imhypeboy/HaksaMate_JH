"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import Sidebar from "../sidebar/sidebar"
import ProductCard from "./components/ProductCard"
import CategoryFilter from "./components/CategoryFilter"
import SearchBar from "./components/SearchBar"
import Header from "./components/Header"
import ProductModal from "./components/ProductModal"
import AddProductModal from "./components/AddProductModal"
import EditProductModal from "./components/EditProductModal"
import ChatModal from "@/components/ChatModal"
import ErrorState from "./components/ErrorState"
import EmptyState from "./components/EmptyState"
import ProductSkeleton from "./components/ProductSkeleton"
import FloatingActionButton from "./components/FloatingActionButton"
import CategoryChips from "./components/CategoryChips"
import { useMarketplace } from "./hooks/useMarketplace"
import { useAuth } from "@/hooks/useAuth"
import type { Product, SearchFilters } from "./types"

const MarketplacePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // 🔧 채팅 관련 상태 - sellerId 추가
  const [showChat, setShowChat] = useState(false)
  const [chatSellerId, setChatSellerId] = useState<string | null>(null)

  const { user } = useAuth()
  const {
    products,
    isLoading,
    error,
    loadProducts,
    searchProducts,
    likeProduct,
    unlikeProduct,
    getProduct,
    deleteProduct,
    updateProductStatus,
    completeTransaction,
  } = useMarketplace()

  // 초기 상품 로드
  useEffect(() => {
    const filters: SearchFilters = {
      category: selectedCategory,
      sortBy: "latest",
    }
    loadProducts(filters)
  }, [selectedCategory, loadProducts])

  // 검색 처리
  useEffect(() => {
    if (searchQuery.trim()) {
      const filters: SearchFilters = {
        category: selectedCategory,
        sortBy: "latest",
      }
      searchProducts(searchQuery, filters)
    } else {
      const filters: SearchFilters = {
        category: selectedCategory,
        sortBy: "latest",
      }
      loadProducts(filters)
    }
  }, [searchQuery, selectedCategory, searchProducts, loadProducts])

  const handleLike = useCallback(
    async (productId: string) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      const product = products.find((p) => p.id === productId)
      if (!product) return

      if (product.isLiked) {
        await unlikeProduct(productId, user.id)
      } else {
        await likeProduct(productId, user.id)
      }
    },
    [user, products, likeProduct, unlikeProduct],
  )

  // 🔧 채팅 핸들러 - sellerId 설정
  const handleChat = useCallback(
    (sellerId: string) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      console.log("💬 채팅 시작:", { sellerId, userId: user.id })
      setChatSellerId(sellerId)
      setShowChat(true)
    },
    [user],
  )

  const handleProductClick = useCallback(
    async (product: Product) => {
      const detailedProduct = await getProduct(product.id)
      if (detailedProduct) {
        setSelectedProduct(detailedProduct)
      }
    },
    [getProduct],
  )

  const handleAddProduct = useCallback(() => {
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }
    setShowAddProduct(true)
  }, [user])

  // 🔧 상품 수정 핸들러
  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setShowEditProduct(true)
  }, [])

  // 🔧 상품 삭제 핸들러
  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      try {
        await deleteProduct(productId)
        alert("상품이 삭제되었습니다.")
      } catch (error) {
        alert("상품 삭제에 실패했습니다.")
      }
    },
    [deleteProduct],
  )

  // 🔧 상품 상태 변경 핸들러
  const handleStatusChange = useCallback(
    async (productId: string, status: "available" | "reserved" | "sold") => {
      try {
        await updateProductStatus(productId, status)

        const statusLabels = {
          available: "판매중",
          reserved: "예약중",
          sold: "판매완료",
        }

        alert(`상품 상태가 "${statusLabels[status]}"로 변경되었습니다.`)
      } catch (error) {
        alert("상품 상태 변경에 실패했습니다.")
      }
    },
    [updateProductStatus],
  )

  // 🔧 거래 완료 핸들러
  const handleCompleteTransaction = useCallback(
    async (productId: string) => {
      try {
        await completeTransaction(productId)
        alert("거래가 완료되었습니다!")
      } catch (error) {
        alert("거래 완료 처리에 실패했습니다.")
      }
    },
    [completeTransaction],
  )

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  const handleProductAdded = useCallback(() => {
    // 상품 등록 후 목록 새로고침
    const filters: SearchFilters = {
      category: selectedCategory,
      sortBy: "latest",
    }
    loadProducts(filters)
    setShowAddProduct(false)
  }, [selectedCategory, loadProducts])

  const handleProductUpdated = useCallback(() => {
    // 상품 수정 후 목록 새로고침
    const filters: SearchFilters = {
      category: selectedCategory,
      sortBy: "latest",
    }
    loadProducts(filters)
    setShowEditProduct(false)
    setEditingProduct(null)
    setSelectedProduct(null) // 🔧 ProductModal도 닫기
  }, [selectedCategory, loadProducts])

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`min-h-screen transition-all duration-700 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
        }`}
      >
        <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onAddProduct={handleAddProduct} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 사이드바 (데스크톱) */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onFilterClick={() => setShowFilters(!showFilters)}
                  isDarkMode={isDarkMode}
                />

                {/* 모바일 카테고리 칩 */}
                <div className="lg:hidden">
                  <CategoryChips
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {showFilters && (
                  <div className="lg:hidden">
                    <CategoryFilter
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}

                {/* 결과 헤더 */}
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-xl font-bold transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedCategory === "all" ? "전체 상품" : `${selectedCategory} 상품`}
                    <span className={`text-base font-normal ml-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      ({products.length}개)
                    </span>
                  </h2>
                </div>

                {/* 로딩 상태 */}
                {isLoading && <ProductSkeleton count={6} isDarkMode={isDarkMode} />}

                {/* 에러 상태 */}
                {error && (
                  <ErrorState 
                    error={error} 
                    onRetry={() => {
                      const filters: SearchFilters = {
                        category: selectedCategory,
                        sortBy: "latest",
                      }
                      loadProducts(filters)
                    }}
                    isDarkMode={isDarkMode}
                  />
                )}

                {/* 상품 그리드 */}
                {!isLoading && !error && products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onLike={handleLike}
                        onChat={handleChat}
                        onClick={handleProductClick}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onComplete={handleCompleteTransaction}
                        onStatusChange={handleStatusChange}
                        currentUserId={user?.id}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                )}

                {/* 빈 상태 */}
                {!isLoading && !error && products.length === 0 && (
                  <EmptyState
                    type={searchQuery ? "search" : selectedCategory !== "all" ? "category" : "general"}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory !== "all" ? selectedCategory : undefined}
                    onAddProduct={handleAddProduct}
                    onClearFilters={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                    isDarkMode={isDarkMode}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 Floating Action Button */}
        <div className="md:hidden">
          <FloatingActionButton
            onClick={handleAddProduct}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* 모달들 */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onLike={handleLike}
          onChat={handleChat}
          onEdit={handleEditProduct} // 🔧 수정 함수 전달
          currentUserId={user?.id} // 🔧 현재 사용자 ID 전달
          isDarkMode={isDarkMode}
        />
      )}

      {showAddProduct && (
        <AddProductModal
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onSuccess={handleProductAdded}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 🔧 상품 수정 모달 추가 */}
      {showEditProduct && (
        <EditProductModal
          isOpen={showEditProduct}
          onClose={() => {
            setShowEditProduct(false)
            setEditingProduct(null)
          }}
          onSuccess={handleProductUpdated}
          product={editingProduct}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 🔧 기존 ChatModal 사용 - sellerId prop 추가 */}
      {showChat && chatSellerId && (
        <ChatModal
          isOpen={showChat}
          onClose={() => {
            setShowChat(false)
            setChatSellerId(null)
          }}
          sellerId={chatSellerId}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  )
}

export default MarketplacePage
