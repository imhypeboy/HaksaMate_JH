import React from 'react'
import { Search, Plus, ShoppingBag, Filter, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  type?: 'search' | 'category' | 'general'
  searchQuery?: string
  selectedCategory?: string
  onAddProduct?: () => void
  onClearFilters?: () => void
  isDarkMode?: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'general',
  searchQuery,
  selectedCategory,
  onAddProduct,
  onClearFilters,
  isDarkMode = false
}) => {
  const getEmptyStateInfo = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: `"${searchQuery}"에 대한 검색 결과가 없습니다`,
          description: '다른 검색어를 시도하거나 필터를 조정해보세요.',
          suggestions: [
            '검색어의 철자를 확인해보세요',
            '더 간단한 검색어를 사용해보세요',
            '카테고리 필터를 변경해보세요'
          ],
          showAddButton: true
        }
      
      case 'category':
        return {
          icon: Filter,
          title: `${selectedCategory} 카테고리에 상품이 없습니다`,
          description: '이 카테고리에 아직 등록된 상품이 없어요.',
          suggestions: [
            '다른 카테고리를 둘러보세요',
            '전체 상품을 확인해보세요',
            '첫 번째 상품을 등록해보세요'
          ],
          showAddButton: true
        }
      
      default:
        return {
          icon: ShoppingBag,
          title: '아직 등록된 상품이 없습니다',
          description: '첫 번째 상품을 등록하고 거래를 시작해보세요!',
          suggestions: [
            '사용하지 않는 물건을 판매해보세요',
            '필요한 물건을 찾아보세요',
            '다른 학생들과 거래해보세요'
          ],
          showAddButton: true
        }
    }
  }

  const emptyInfo = getEmptyStateInfo()
  const IconComponent = emptyInfo.icon

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* 메인 아이콘 */}
      <div className="mb-8">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto ${
            isDarkMode
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30'
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200'
          } shadow-lg`}
        >
          <IconComponent
            className={`w-16 h-16 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-500'
            }`}
          />
        </div>
      </div>

      {/* 메시지 섹션 */}
      <div className="text-center max-w-lg mx-auto">
        <h3 className={`text-2xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {emptyInfo.title}
        </h3>
        
        <p className={`text-lg mb-8 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {emptyInfo.description}
        </p>

        {/* 제안사항 */}
        <div className={`text-left mb-8 p-6 rounded-2xl ${
          isDarkMode 
            ? 'bg-gray-800/50 border border-gray-700/40' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <h4 className={`font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            <Sparkles className="w-4 h-4" />
            이런 방법은 어때요?
          </h4>
          <ul className="space-y-3">
            {emptyInfo.suggestions.map((suggestion, index) => (
              <li key={index} className={`flex items-start gap-3 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                  isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {index + 1}
                </span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {emptyInfo.showAddButton && onAddProduct && (
            <button
              onClick={onAddProduct}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus className="w-5 h-5" />
              상품 등록하기
            </button>
          )}
          
          {type !== 'general' && onClearFilters && (
            <button
              onClick={onClearFilters}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              전체 상품 보기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmptyState 