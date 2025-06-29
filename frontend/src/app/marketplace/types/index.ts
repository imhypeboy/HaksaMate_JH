export interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  condition: "new" | "like-new" | "good" | "fair" | "poor"
  location: string
  sellerId: string
  sellerName: string
  sellerRating: number
  createdAt: Date
  updatedAt: Date
  status: "available" | "reserved" | "sold"
  views: number
  likes: number
  isLiked?: boolean
  tags: string[]
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string[]
  location?: string
  sortBy: "latest" | "price-low" | "price-high" | "popular"
}

export interface User {
  id: string
  name: string
  avatar?: string
  rating: number
  reviewCount: number
  joinDate: Date
  location: string
}
