import React from 'react'

/**
 * Price formatting utilities
 * 실무에서는 i18n과 통화 설정을 고려해야 함
 */
export const formatPrice = (price: number, currency: string = '원'): string => {
  return `${price.toLocaleString()}${currency}`
}

export const formatDiscountedPrice = (originalPrice: number, discountRate: number): {
  discountedPrice: number
  discountAmount: number
  formattedOriginal: string
  formattedDiscounted: string
} => {
  const discountAmount = Math.round(originalPrice * (discountRate / 100))
  const discountedPrice = originalPrice - discountAmount
  
  return {
    discountedPrice,
    discountAmount,
    formattedOriginal: formatPrice(originalPrice),
    formattedDiscounted: formatPrice(discountedPrice)
  }
}

/**
 * Price Display Component Props
 */
export interface PriceDisplayProps {
  price: number
  originalPrice?: number    // 할인 전 가격
  discountRate?: number     // 할인율 (%)
  currency?: string         // 통화 단위
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showDiscount?: boolean    // 할인 정보 표시 여부
  className?: string
  priceClassName?: string   // 가격 텍스트 전용 스타일
  highlightDiscount?: boolean // 할인 강조 표시
}

/**
 * Size variants
 */
const sizeVariants = {
  sm: {
    price: 'text-sm font-semibold',
    original: 'text-xs',
    discount: 'text-xs'
  },
  md: {
    price: 'text-lg font-bold', 
    original: 'text-sm',
    discount: 'text-sm'
  },
  lg: {
    price: 'text-xl font-bold',
    original: 'text-base',
    discount: 'text-base'
  },
  xl: {
    price: 'text-2xl font-bold',
    original: 'text-lg',
    discount: 'text-lg'
  }
} as const

/**
 * PriceDisplay Component
 * 
 * @example
 * ```tsx
 * // 기본 가격 표시
 * <PriceDisplay price={25000} />
 * 
 * // 할인 가격 표시
 * <PriceDisplay 
 *   price={20000} 
 *   originalPrice={25000} 
 *   discountRate={20}
 *   showDiscount
 * />
 * 
 * // 큰 크기로 강조
 * <PriceDisplay price={2800000} size="xl" />
 * ```
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discountRate,
  currency = '원',
  size = 'md',
  showDiscount = false,
  className = '',
  priceClassName = '',
  highlightDiscount = false
}) => {
  const sizeClasses = sizeVariants[size]
  const hasDiscount = originalPrice && discountRate && originalPrice > price
  
  // 할인 정보 계산
  const discountInfo = hasDiscount ? formatDiscountedPrice(originalPrice, discountRate) : null
  
  // 가격 색상 결정
  const getPriceColor = () => {
    if (hasDiscount && highlightDiscount) {
      return 'text-red-600 dark:text-red-400'
    }
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* 메인 가격 */}
      <div className="flex items-center gap-2">
        <span className={`${sizeClasses.price} ${getPriceColor()} ${priceClassName}`}>
          {formatPrice(price, currency)}
        </span>
        
        {/* 할인율 배지 */}
        {hasDiscount && showDiscount && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
            -{discountRate}%
          </span>
        )}
      </div>
      
      {/* 원래 가격 (취소선) */}
      {hasDiscount && showDiscount && (
        <div className="flex items-center gap-2">
          <span className={`${sizeClasses.original} text-gray-500 dark:text-gray-400 line-through`}>
            {formatPrice(originalPrice, currency)}
          </span>
          
          {discountInfo && (
            <span className={`${sizeClasses.discount} text-green-600 dark:text-green-400 font-medium`}>
              {formatPrice(discountInfo.discountAmount, currency)} 할인
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Preset Price Components
 */
export const CompactPrice: React.FC<Pick<PriceDisplayProps, 'price' | 'currency'>> = ({ price, currency }) => (
  <PriceDisplay price={price} currency={currency} size="sm" />
)

export const FeaturedPrice: React.FC<PriceDisplayProps> = (props) => (
  <PriceDisplay {...props} size="xl" highlightDiscount />
)

export const DiscountPrice: React.FC<PriceDisplayProps> = (props) => (
  <PriceDisplay {...props} showDiscount highlightDiscount />
)

/**
 * Hook for price calculations
 */
export const usePriceCalculations = (price: number, originalPrice?: number) => {
  const hasDiscount = originalPrice && originalPrice > price
  const discountAmount = hasDiscount ? originalPrice - price : 0
  const discountRate = hasDiscount ? Math.round((discountAmount / originalPrice) * 100) : 0
  const savings = discountAmount
  
  return {
    hasDiscount: !!hasDiscount,
    discountAmount,
    discountRate,
    savings,
    formattedPrice: formatPrice(price),
    formattedOriginal: originalPrice ? formatPrice(originalPrice) : null,
    formattedSavings: savings > 0 ? formatPrice(savings) : null
  }
} 