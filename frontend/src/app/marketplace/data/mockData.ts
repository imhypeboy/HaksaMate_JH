import type { Product } from '../types'

/**
 * Mock Data Factory
 * 실제 프로덕션에서는 API 응답을 시뮬레이션하는 역할
 */
export class MockDataFactory {
  private static readonly BASE_PRODUCTS: Omit<Product, 'id'>[] = [
    {
      title: "MacBook Pro 14인치 M3 Pro",
      description: "2023년 구입한 맥북프로입니다. 상태 매우 좋고 거의 새 제품 수준이에요. 개발용으로 사용했고 스크래치 전혀 없습니다.",
      price: 2800000,
      images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400"],
      category: "전자기기",
      condition: "like-new" as const,
      location: "홍대입구역",
      sellerId: "user1", 
      sellerName: "김개발",
      sellerRating: 4.8,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      status: "available" as const,
      views: 142,
      likes: 28,
      isLiked: false,
      tags: ["맥북", "노트북", "개발"]
    },
    {
      title: "무지 후드티 XL 네이비",
      description: "무인양품 후드티 새상품이에요! 선물받았는데 사이즈가 안 맞아서 판매합니다. 택 달린 새상품입니다.",
      price: 35000,
      images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"],
      category: "의류/잡화",
      condition: "new" as const,
      location: "신촌역",
      sellerId: "user2",
      sellerName: "옷좋아",
      sellerRating: 4.2,
      createdAt: new Date("2024-01-14"),
      updatedAt: new Date("2024-01-14"),
      status: "available" as const,
      views: 67,
      likes: 12,
      isLiked: true,
      tags: ["무지", "후드티", "새상품"]
    },
    {
      title: "미적분학 교재 + 연습문제집 세트",
      description: "수학과 전공 교재입니다. 필기 있지만 깔끔하게 되어있어요. 연습문제집도 함께 드립니다!",
      price: 25000,
      images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400"],
      category: "도서/교재",
      condition: "good" as const,
      location: "이대역",
      sellerId: "user3",
      sellerName: "수학왕",
      sellerRating: 4.5,
      createdAt: new Date("2024-01-13"),
      updatedAt: new Date("2024-01-13"),
      status: "reserved" as const,
      views: 89,
      likes: 7,
      isLiked: false,
      tags: ["교재", "수학", "미적분"]
    },
    {
      title: "캠핑의자 2개 세트",
      description: "코베아 캠핑의자 2개 세트로 판매해요. 몇 번 사용했지만 상태 좋습니다. 접이식이라 보관하기 편해요.",
      price: 45000,
      images: ["https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400"],
      category: "가구/인테리어",
      condition: "good" as const,
      location: "합정역",
      sellerId: "user4",
      sellerName: "캠퍼",
      sellerRating: 4.7,
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-12"),
      status: "available" as const,
      views: 134,
      likes: 19,
      isLiked: false,
      tags: ["캠핑", "의자", "코베아"]
    },
    {
      title: "아이폰 15 Pro 케이스 + 강화유리",
      description: "아이폰 15 프로용 케이스와 강화유리 필름 세트입니다. 색상은 클리어에요. 한 번도 안 써서 새상품이에요!",
      price: 15000,
      images: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400"],
      category: "휴대폰",
      condition: "new" as const,
      location: "강남역",
      sellerId: "user5",
      sellerName: "아이폰러버",
      sellerRating: 4.9,
      createdAt: new Date("2024-01-11"),
      updatedAt: new Date("2024-01-11"),
      status: "sold" as const,
      views: 203,
      likes: 41,
      isLiked: true,
      tags: ["아이폰", "케이스", "액세서리"]
    },
    {
      title: "차량용 트레이너",
      description: "거의 새 차량용 운동기구입니다. 코로나 때 샀는데 몇 번 안 써서 깨끗해요. 설명서도 있습니다.",
      price: 80000,
      images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"],
      category: "차량/오토바이",
      condition: "like-new" as const,
      location: "잠실역",
      sellerId: "user6",
      sellerName: "운동맨",
      sellerRating: 4.3,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
      status: "available" as const,
      views: 78,
      likes: 5,
      isLiked: false,
      tags: ["운동기구", "차량용", "트레이너"]
    }
  ]

  /**
   * 상품 목록 생성 (ID 자동 할당)
   */
  static createProducts(): Product[] {
    return this.BASE_PRODUCTS.map((product, index) => ({
      id: (index + 1).toString(),
      ...product
    }))
  }

  /**
   * 카테고리별 상품 필터링
   */
  static createProductsByCategory(category: string): Product[] {
    const products = this.createProducts()
    
    if (category === "all") {
      return products
    }
    
    return products.filter(product => product.category === category)
  }

  /**
   * 검색 시뮬레이션
   */
  static searchProducts(query: string): Product[] {
    const products = this.createProducts()
    const searchQuery = query.toLowerCase()
    
    return products.filter(product => 
      product.title.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    )
  }

  /**
   * 개발 환경용 로딩 시뮬레이션
   */
  static async createProductsWithDelay(delay: number = 800): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, delay))
    return this.createProducts()
  }

  /**
   * 페이지네이션 시뮬레이션
   */
  static createProductsPage(page: number, pageSize: number = 10): {
    products: Product[]
    totalPages: number
    currentPage: number
    totalItems: number
  } {
    const allProducts = this.createProducts()
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      products: allProducts.slice(startIndex, endIndex),
      totalPages: Math.ceil(allProducts.length / pageSize),
      currentPage: page,
      totalItems: allProducts.length
    }
  }
}

/**
 * 간편한 접근을 위한 Export
 */
export const mockProducts = MockDataFactory.createProducts()
export const createMockProducts = MockDataFactory.createProducts
export const searchMockProducts = MockDataFactory.searchProducts 