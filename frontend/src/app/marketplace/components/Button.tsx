import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  isDarkMode?: boolean
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  children,
  onClick,
  disabled = false,
  className = '',
  isDarkMode = false
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  }
  
  const variantStyles = {
    primary: isDarkMode
      ? "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"
      : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500",
    secondary: isDarkMode
      ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 focus:ring-gray-500"
      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500",
    ghost: isDarkMode
      ? "text-gray-300 hover:bg-gray-700 focus:ring-gray-500"
      : "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger: isDarkMode
      ? "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
      : "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
  }
  
  const disabledStyles = "opacity-50 cursor-not-allowed hover:bg-current"
  
  const buttonClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled ? disabledStyles : ''}
    ${className}
  `.trim()

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
    </button>
  )
}

export default Button 