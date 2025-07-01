import React from 'react'
import { RefreshCw, Wifi, AlertCircle, Home } from 'lucide-react'

interface ErrorStateProps {
  error: string
  onRetry?: () => void
  isDarkMode?: boolean
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isDarkMode = false }) => {
  const getErrorInfo = (errorMessage: string) => {
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      return {
        icon: Wifi,
        title: '연결 문제가 발생했습니다',
        description: '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.',
        suggestions: [
          '인터넷 연결을 확인해주세요',
          '서버가 점검 중일 수 있습니다',
          '잠시 후 다시 시도해주세요'
        ]
      }
    }
    
    return {
      icon: AlertCircle,
      title: '문제가 발생했습니다',
      description: '잠시 후 다시 시도해주세요.',
      suggestions: [
        '페이지를 새로고침해주세요',
        '잠시 후 다시 시도해주세요'
      ]
    }
  }

  const errorInfo = getErrorInfo(error)
  const IconComponent = errorInfo.icon

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* 아이콘 */}
      <div className="mb-8">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
            isDarkMode
              ? 'bg-red-500/20 border-2 border-red-400/30'
              : 'bg-red-50 border-2 border-red-200'
          }`}
        >
          <IconComponent
            className={`w-12 h-12 ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`}
          />
        </div>
      </div>

      {/* 에러 메시지 */}
      <div className="text-center max-w-md mx-auto">
        <h3 className={`text-2xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {errorInfo.title}
        </h3>
        
        <p className={`text-lg mb-6 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {errorInfo.description}
        </p>

        {/* 제안사항 */}
        <div className={`text-left mb-8 p-4 rounded-2xl ${
          isDarkMode 
            ? 'bg-gray-800/50 border border-gray-700/40' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <h4 className={`font-semibold mb-3 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            해결 방법:
          </h4>
          <ul className="space-y-2">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className={`flex items-start gap-2 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                  isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                }`} />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-colors duration-200 ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            }`}
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorState 