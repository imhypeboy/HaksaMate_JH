import React from 'react'

/**
 * Product Badge Variants
 * 실무에서는 일관된 스타일을 위해 variants 패턴 사용
 */
const badgeVariants = {
  status: {
    available: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    reserved: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", 
    sold: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
  },
  size: {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs", 
    lg: "px-4 py-1.5 text-sm",
  }
} as const

/**
 * Status labels mapping
 * 다국어 지원을 위해 별도 객체로 분리
 */
const STATUS_LABELS = {
  available: '판매중',
  reserved: '예약중',
  sold: '판매완료'
} as const

/**
 * Product Badge Component Props
 */
export interface ProductBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: keyof typeof STATUS_LABELS
  size?: keyof typeof badgeVariants.size
  customLabel?: string // 커스텀 라벨 지원
  showIcon?: boolean   // 아이콘 표시 여부
}

/**
 * Status icons mapping
 */
const STATUS_ICONS = {
  available: '🟢',
  reserved: '🟡', 
  sold: '🔴'
} as const

/**
 * ProductBadge Component
 * 
 * @example
 * ```tsx
 * // 기본 사용
 * <ProductBadge status="available" />
 * 
 * // 커스텀 라벨과 아이콘
 * <ProductBadge status="reserved" customLabel="예약 대기" showIcon />
 * 
 * // 크기 조정
 * <ProductBadge status="sold" size="lg" />
 * ```
 */
export const ProductBadge: React.FC<ProductBadgeProps> = ({
  status,
  size = 'md',
  customLabel,
  showIcon = false,
  className,
  ...props
}) => {
  const label = customLabel || STATUS_LABELS[status]
  const icon = showIcon ? STATUS_ICONS[status] : null
  
  // 클래스 합치기 (기본 스타일 + variants + 커스텀)
  const baseClasses = "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-200"
  const statusClasses = badgeVariants.status[status]
  const sizeClasses = badgeVariants.size[size]
  const combinedClasses = `${baseClasses} ${statusClasses} ${sizeClasses} ${className || ''}`.trim()

  return (
    <span
      className={combinedClasses}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
  )
}

/**
 * Preset Badge Components for common use cases
 */
export const AvailableBadge: React.FC<Omit<ProductBadgeProps, 'status'>> = (props) => (
  <ProductBadge status="available" {...props} />
)

export const ReservedBadge: React.FC<Omit<ProductBadgeProps, 'status'>> = (props) => (
  <ProductBadge status="reserved" {...props} />
)

export const SoldBadge: React.FC<Omit<ProductBadgeProps, 'status'>> = (props) => (
  <ProductBadge status="sold" {...props} />
)

/**
 * Hook for status badge logic
 * 비즈니스 로직 분리
 */
export const useProductStatus = (status: keyof typeof STATUS_LABELS) => {
  const isAvailable = status === 'available'
  const isReserved = status === 'reserved'
  const isSold = status === 'sold'
  
  const canPurchase = isAvailable || isReserved
  const label = STATUS_LABELS[status]
  
  return {
    isAvailable,
    isReserved, 
    isSold,
    canPurchase,
    label
  }
} 