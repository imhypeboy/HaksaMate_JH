"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, X, User, Sun, Moon, MapPin, Star, Zap, Coffee, Code, Gamepad2, Music, Palette, Film, Shield, BookOpen, MessageCircle, Navigation } from 'lucide-react'
import Sidebar from '../sidebar/sidebar'
import ChatModal from '../components/ChatModal'
import './styles.css'

// 상수 분리
const DRAG_THRESHOLD = 100
const SWIPE_VELOCITY = 400
const ANIMATION_DURATION = 600

interface Profile {
  id: number
  name: string
  age: number
  mbti: string
  nickname: string
  tags: string[]
  description: string
  major?: string
  year?: number
  interests?: string[]
}

// 관심사 아이콘 매핑
const INTEREST_ICONS: Record<string, React.ReactNode> = {
  '코딩': <Code size={10} />,
  '게임': <Gamepad2 size={10} />,
  '카페': <Coffee size={10} />,
  '그림': <Palette size={10} />,
  '음악': <Music size={10} />,
  '영화': <Film size={10} />,
  '보안': <Shield size={10} />,
  '해킹': <Zap size={10} />,
  '스터디': <BookOpen size={10} />
}

// 성능 최적화를 위한 메모이제이션된 컴포넌트들
const AnimatedBackground = React.memo(({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl transition-all duration-1000 ${
      isDarkMode ? 'bg-gray-600' : 'bg-blue-300'
    }`} 
    style={{
      animation: 'float 8s ease-in-out infinite',
      animationDelay: '0s'
    }} />
    <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-8 blur-3xl transition-all duration-1000 ${
      isDarkMode ? 'bg-gray-700' : 'bg-indigo-300'
    }`}
    style={{
      animation: 'float 10s ease-in-out infinite',
      animationDelay: '3s'
    }} />
  </div>
))

AnimatedBackground.displayName = 'AnimatedBackground'

const ProfileCard = React.memo(({ 
  profile, 
  isDarkMode, 
  exitX, 
  dragX, 
  dragY, 
  rotation, 
  isAnimating, 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd,
  onMouseDown
}: {
  profile: Profile
  isDarkMode: boolean
  exitX: number
  dragX: number
  dragY: number
  rotation: number
  isAnimating: boolean
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
}) => {
  
  const cardStyle = useMemo(() => ({
    transform: `translateX(${exitX + dragX}px) translateY(${dragY}px) rotate(${rotation}deg) ${isAnimating ? 'scale(0.95)' : 'scale(1)'}`,
    transition: exitX !== 0 ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)` : 
                isAnimating ? 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 
                'transform 0.1s ease-out',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    perspective: '1000px'
  }), [exitX, dragX, dragY, rotation, isAnimating])

  const overlayOpacity = Math.abs(dragX) > 50 ? Math.min(Math.abs(dragX) / 150, 0.9) : 0

  return (
    <div 
      className={`relative w-full rounded-3xl p-8 cursor-grab active:cursor-grabbing touch-none select-none ${
        isDarkMode 
          ? 'bg-white/10 backdrop-blur-2xl border border-white/20' 
          : 'bg-white/90 backdrop-blur-2xl border border-white/60'
      } shadow-2xl hover:shadow-3xl transition-shadow duration-300`}
      style={cardStyle}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      
      {/* Enhanced Overlay Icons with Glow Effect */}
      {dragX > 50 && (
        <div 
          className="absolute top-6 right-6 text-pink-500 pointer-events-none transition-opacity duration-200"
          style={{ opacity: overlayOpacity }}
        >
          <div className="relative">
            <Heart size={80} fill="currentColor" className="drop-shadow-2xl animate-pulse" />
            <div className="absolute inset-0 bg-pink-400 rounded-full blur-3xl opacity-60 animate-ping" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
              LIKE!
            </div>
          </div>
        </div>
      )}
      
      {dragX < -50 && (
        <div 
          className="absolute top-6 left-6 text-red-500 pointer-events-none transition-opacity duration-200"
          style={{ opacity: overlayOpacity }}
        >
          <div className="relative">
            <X size={80} className="drop-shadow-2xl animate-pulse" />
            <div className="absolute inset-0 bg-red-400 rounded-full blur-3xl opacity-60 animate-ping" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
              NOPE!
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Avatar with Animated Border */}
      <div className="relative mx-auto mb-6 w-fit">
        <div className={`w-36 h-36 rounded-full p-1 relative ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-600 to-gray-500' 
            : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
        }`}>
          <div className={`w-full h-full rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } relative overflow-hidden`}>
            <User size={52} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
          </div>
        </div>
        
        {/* Online Status with Pulse */}
        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
        </div>
      </div>

      {/* Enhanced Profile Info */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'} tracking-tight`}>
            {profile.name}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm">
            <MapPin size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {profile.major} {profile.year}학년
            </span>
          </div>
        </div>
        
        <div className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          만 {profile.age} · {profile.mbti}
        </div>
        
        <div className={`px-4 py-2 rounded-full inline-block transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 border border-purple-400/30' 
            : 'bg-gradient-to-r from-blue-100 to-purple-100 text-indigo-700 border border-indigo-200'
        }`}>
          @{profile.nickname}
        </div>

        {/* Enhanced Tags with Stagger Animation */}
        <div className="flex flex-wrap justify-center gap-2 my-6">
          {profile.tags.map((tag, i) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-emerald-800/30 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-700/40' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
              style={{ 
                animationDelay: `${i * 150}ms`,
                animation: 'slideInUp 0.6s ease-out forwards'
              }}
            >
              <Star size={12} className="animate-pulse" />
              #{tag}
            </span>
          ))}
        </div>

        {/* Interests Section */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {profile.interests.map((interest, i) => (
              <span
                key={interest}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-blue-800/20 text-blue-300 border border-blue-600/20' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                {INTEREST_ICONS[interest] || null}
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Enhanced Description */}
        <div className={`text-sm leading-relaxed p-4 rounded-2xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10' 
            : 'bg-gray-50/80 text-gray-600 border border-gray-100 hover:bg-gray-100/80'
        }`}>
          {profile.description}
        </div>
      </div>
    </div>
  )
})

ProfileCard.displayName = 'ProfileCard'

// 세그먼트 타입 정의
type SegmentType = 'matching' | 'nearby' | 'liked'

interface SegmentItem {
  id: SegmentType
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

// 세그먼트 목록
const SEGMENTS: SegmentItem[] = [
  { id: 'matching', label: '매칭', icon: Heart },
  { id: 'nearby', label: '근처', icon: MapPin },
  { id: 'liked', label: '좋아요', icon: Star }
]

// Material Design 3 세그먼트 컨트롤 컴포넌트
const SegmentControl = React.memo(({ 
  activeSegment, 
  onSegmentChange, 
  isDarkMode 
}: {
  activeSegment: SegmentType
  onSegmentChange: (segment: SegmentType) => void
  isDarkMode: boolean
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<SegmentType | null>(null)
  
  return (
    <div className={`relative flex rounded-full p-1 mx-6 mb-6 transition-all duration-500 ease-out ${
      isDarkMode 
        ? 'bg-gray-800/40 backdrop-blur-xl border border-gray-700/50' 
        : 'bg-gray-100/80 backdrop-blur-xl border border-gray-200/60'
    } shadow-2xl`}>
      {/* Material Design 3 Indicator */}
      <div 
        className={`absolute top-1 bottom-1 rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode 
            ? 'bg-white/90 shadow-lg shadow-white/20' 
            : 'bg-white shadow-lg shadow-gray-900/10'
        }`}
        style={{
          left: `${4 + (SEGMENTS.findIndex(s => s.id === activeSegment) * (100 / SEGMENTS.length))}%`,
          width: `${(100 / SEGMENTS.length) - 8}%`,
          transform: 'translateX(-4px)'
        }}
      />
      
      {SEGMENTS.map((segment, index) => {
        const Icon = segment.icon
        const isActive = activeSegment === segment.id
        const isHovered = hoveredSegment === segment.id
        
        return (
          <button
            key={segment.id}
            onClick={() => onSegmentChange(segment.id)}
            onMouseEnter={() => setHoveredSegment(segment.id)}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-medium text-sm z-10 ${
              isActive
                ? isDarkMode
                  ? 'text-gray-900 scale-105'
                  : 'text-gray-900 scale-105'
                : isDarkMode
                  ? 'text-gray-300 hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              transform: `scale(${isActive ? 1.05 : isHovered ? 1.02 : 1})`,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Icon 
              size={16} 
              className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isActive ? 'scale-110' : isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
            <span className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isActive ? 'font-semibold' : 'font-medium'
            }`}>
              {segment.label}
            </span>
            
            {/* Material Design 3 Ripple Effect */}
            <div className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ${
              isHovered && !isActive 
                ? isDarkMode 
                  ? 'bg-white/10 opacity-100' 
                  : 'bg-gray-900/5 opacity-100'
                : ''
            }`} />
          </button>
        )
      })}
    </div>
  )
})

SegmentControl.displayName = 'SegmentControl'

// Material Design 3 지도 기반 매칭 컴포넌트
const NearbyMatching = React.memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'loading'>('prompt')
  const [nearbyUsers, setNearbyUsers] = useState<Profile[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  
  // 위치 권한 요청 및 지도 초기화
  const handleLocationRequest = useCallback(async () => {
    setLocationPermission('loading')
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분 캐시
        })
      })
      
      setLocationPermission('granted')
      
      // TODO: 실제 API 호출로 대체
      // const response = await fetchNearbyUsers(position.coords.latitude, position.coords.longitude)
      // setNearbyUsers(response.data)
      
      // 임시 데이터
      setNearbyUsers([
        { id: 3, name: '근처의 김철수', age: 23, mbti: 'ENFP', nickname: 'nearby_user1', tags: ['활발한', '친근한'], description: '같은 과 선배에요!' },
        { id: 4, name: '카페 단골 이영희', age: 21, mbti: 'ISFP', nickname: 'coffee_lover', tags: ['조용한', '카페'], description: '자주 가는 카페에서 봤어요' }
      ])
      
      // 지도 초기화 (카카오맵 API)
      setTimeout(() => setMapLoaded(true), 1000)
      
    } catch (error) {
      console.error('Location error:', error)
      setLocationPermission('denied')
    }
  }, [])

  // 위치 권한이 없는 경우 - 권한 요청 UI
  if (locationPermission === 'prompt') {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <div className={`rounded-3xl p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode 
            ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
            : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
        } shadow-2xl hover:shadow-3xl`}>
          <div className="mb-8">
            {/* Material Design 3 FAB-style Icon */}
            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-400/20 to-blue-600/20 text-blue-300' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600'
            } shadow-lg hover:shadow-xl hover:scale-105`}>
              <MapPin size={36} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
              
              {/* Material Design 3 Pulse Effect */}
              <div className={`absolute inset-0 rounded-full animate-pulse ${
                isDarkMode ? 'bg-blue-400/10' : 'bg-blue-500/10'
              }`} />
              
              {/* Floating Animation Circles */}
              <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full animate-bounce ${
                isDarkMode ? 'bg-blue-400/60' : 'bg-blue-500/60'
              }`} style={{ animationDelay: '0s' }} />
              <div className={`absolute -bottom-2 -left-2 w-3 h-3 rounded-full animate-bounce ${
                isDarkMode ? 'bg-blue-300/40' : 'bg-blue-400/40'
              }`} style={{ animationDelay: '1s' }} />
            </div>
            
            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              주변 매칭
            </h3>
            <p className={`text-sm leading-relaxed transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              위치 기반으로 근처에 있는<br />
              사람들과 매칭해보세요
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Material Design 3 Filled Button */}
            <button 
              onClick={handleLocationRequest}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`relative w-full py-4 px-6 rounded-full font-semibold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
                isDarkMode 
                  ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
              } hover:shadow-xl hover:scale-105 active:scale-95`}
            >
              {/* Material Design 3 Ripple Effect */}
              <div className={`absolute inset-0 rounded-full transition-transform duration-300 ${
                isHovered 
                  ? 'bg-white/10 scale-100' 
                  : 'bg-white/0 scale-0'
              }`} />
              
              <div className="relative flex items-center justify-center gap-2">
                <Navigation 
                  size={18} 
                  className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
                  }`} 
                />
                <span>위치 권한 허용</span>
              </div>
            </button>
            
            {/* Material Design 3 Supporting Text */}
            <div className={`text-xs leading-relaxed transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              현재 위치를 기반으로 1km 반경 내<br />
              사용자들을 찾아드립니다
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (locationPermission === 'loading') {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <div className={`rounded-3xl p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode 
            ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
            : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
        } shadow-2xl`}>
          <div className="mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
            } animate-pulse`}>
              <MapPin size={24} className="animate-bounce" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              위치 확인 중...
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              잠시만 기다려주세요
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 위치 권한 거부된 경우
  if (locationPermission === 'denied') {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <div className={`rounded-3xl p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode 
            ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
            : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
        } shadow-2xl`}>
          <div className="mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'
            }`}>
              <X size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              위치 권한이 필요해요
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              브라우저 설정에서 위치 권한을<br />
              허용해주세요
            </p>
          </div>
          <button 
            onClick={handleLocationRequest}
            className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
            }`}
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // 지도 및 근처 사용자 표시
  return (
    <div className="relative w-full max-w-sm lg:max-w-none mx-auto space-y-4">
      {/* 지도 컨테이너 */}
      <div className={`rounded-3xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isDarkMode 
          ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
          : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
      } shadow-2xl`}>
        <div className="h-64 lg:h-80 relative">
          {!mapLoaded ? (
            // 지도 로딩 상태
            <div className={`w-full h-full flex items-center justify-center ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="text-center">
                <MapPin size={32} className={`mx-auto mb-2 animate-pulse ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  지도 로딩 중...
                </p>
              </div>
            </div>
          ) : (
            // TODO: 실제 카카오맵 컴포넌트로 교체
            <div className={`w-full h-full flex items-center justify-center ${
              isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
            } relative`}>
              <div className="text-center">
                <MapPin size={24} className="mx-auto mb-2 text-blue-500" />
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  지도 영역
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  카카오맵 API 연동 예정
                </p>
              </div>
              
              {/* 임시 위치 마커들 */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <div className="absolute bottom-8 left-8 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
          )}
        </div>
        
        {/* 지도 하단 정보 */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                근처 사용자 {nearbyUsers.length}명
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                반경 1km 내
              </p>
            </div>
            <button className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isDarkMode 
                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}>
              새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 근처 사용자 목록 */}
      {nearbyUsers.length > 0 && (
        <div className="space-y-3">
          {nearbyUsers.slice(0, 3).map((user, index) => (
            <div 
              key={user.id}
              className={`rounded-2xl p-4 transition-all duration-300 hover:scale-102 ${
                isDarkMode 
                  ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                  : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
              } shadow-lg hover:shadow-xl`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <User size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user.name}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    만 {user.age} · {user.mbti} · 500m
                  </p>
                </div>
                
                <Heart size={16} className="text-pink-500 hover:fill-current cursor-pointer transition-colors" />
              </div>
            </div>
          ))}
          
          {nearbyUsers.length > 3 && (
            <button className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 border border-gray-700/40' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              +{nearbyUsers.length - 3}명 더 보기
            </button>
          )}
        </div>
      )}
    </div>
  )
})

NearbyMatching.displayName = 'NearbyMatching'

// Material Design 3 좋아요 목록 컴포넌트
const LikedProfiles = React.memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const [hoveredProfile, setHoveredProfile] = useState<number | null>(null)
  
  const likedProfiles = [
    { id: 1, name: '배고픈 춘식이', age: 22, mbti: 'ENTJ' },
    { id: 2, name: '행복한 라이언', age: 25, mbti: 'INFP' },
  ]

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* Material Design 3 Header */}
      <div className={`text-center mb-8 transition-all duration-500 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <div className="relative inline-block mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode 
              ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20' 
              : 'bg-gradient-to-br from-yellow-50 to-orange-50'
          } shadow-lg hover:shadow-xl hover:scale-105`}>
            <Star size={28} className="text-yellow-500 animate-pulse" />
          </div>
          
          {/* Material Design 3 Floating Elements */}
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <h3 className={`text-lg font-semibold mb-2 transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          좋아요한 프로필
        </h3>
        <p className="text-sm">마음에 드는 사람들과 대화해보세요</p>
      </div>
      
      {/* Material Design 3 Profile Cards */}
      {likedProfiles.map((profile, index) => (
        <div 
          key={profile.id}
          onMouseEnter={() => setHoveredProfile(profile.id)}
          onMouseLeave={() => setHoveredProfile(null)}
          className={`relative rounded-3xl p-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
            isDarkMode 
              ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
              : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
          } shadow-lg hover:shadow-2xl`}
          style={{
            transform: `scale(${hoveredProfile === profile.id ? 1.02 : 1})`,
            animationDelay: `${index * 100}ms`
          }}
        >
          {/* Material Design 3 Ripple Effect */}
          <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
            hoveredProfile === profile.id
              ? isDarkMode 
                ? 'bg-white/5 opacity-100' 
                : 'bg-gray-900/3 opacity-100'
              : 'opacity-0'
          }`} />
          
          <div className="relative flex items-center gap-4">
            {/* Material Design 3 Avatar */}
            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-600 to-gray-700' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            } shadow-lg`}>
              <User size={22} className={`transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`} />
              
              {/* Online Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-base transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {profile.name}
              </h4>
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                만 {profile.age} · {profile.mbti}
              </p>
            </div>
            
            {/* Material Design 3 FAB-style Chat Button */}
            <button className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
              isDarkMode 
                ? 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 shadow-lg shadow-pink-500/10' 
                : 'bg-pink-50 hover:bg-pink-100 text-pink-500 shadow-lg shadow-pink-500/10'
            } hover:scale-110 active:scale-95`}>
              {/* Ripple Effect */}
              <div className={`absolute inset-0 rounded-full transition-transform duration-300 ${
                hoveredProfile === profile.id
                  ? 'bg-white/10 scale-100' 
                  : 'bg-white/0 scale-0'
              }`} />
              
              <MessageCircle size={18} className="relative z-10" />
            </button>
          </div>
        </div>
      ))}
      
      {/* Material Design 3 Empty State */}
      {likedProfiles.length === 0 && (
        <div className={`text-center py-12 transition-all duration-500 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="relative inline-block mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              isDarkMode 
                ? 'bg-gray-800/40' 
                : 'bg-gray-100/60'
            }`}>
              <Heart size={36} className="opacity-40" />
            </div>
            
            {/* Floating Hearts Animation */}
            <div className="absolute -top-2 -right-2 text-pink-400 opacity-20 animate-pulse">
              <Heart size={12} fill="currentColor" />
            </div>
            <div className="absolute -bottom-2 -left-2 text-pink-300 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>
              <Heart size={10} fill="currentColor" />
            </div>
          </div>
          
          <h3 className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            아직 좋아요한 프로필이 없어요
          </h3>
          <p className="text-sm">
            매칭을 통해 마음에 드는<br />
            사람들을 찾아보세요!
          </p>
        </div>
      )}
    </div>
  )
})

LikedProfiles.displayName = 'LikedProfiles'

const MatchingPage: React.FC = () => {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [exitX, setExitX] = useState(0)
  const [showMatch, setShowMatch] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [chatUserId, setChatUserId] = useState<number | undefined>()
  const [activeSegment, setActiveSegment] = useState<SegmentType>('matching')
  
  // 드래그 상태
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })
  


  // 성능 최적화된 프로필 데이터
  const profiles: Profile[] = useMemo(() => [
    {
      id: 1,
      name: '배고픈 춘식이',
      age: 22,
      mbti: 'ENTJ',
      nickname: 'HHHLL',
      major: '컴퓨터공학과',
      year: 3,
      tags: ['긍정적', '독창적', '무계획'],
      interests: ['코딩', '게임', '카페'],
      description: '명확한 비전과 논리적인 사고를 바탕으로 전략을 세우고, 효율적으로 실행하는 것을 좋아합니다.',
    },
    {
      id: 2,
      name: '행복한 라이언',
      age: 25,
      mbti: 'INFP',
      nickname: 'HAPPY',
      major: '경영학과',
      year: 4,
      tags: ['창의적', '감성적', '예술가'],
      interests: ['그림', '음악', '영화'],
      description: '따뜻한 마음과 풍부한 상상력으로 세상을 바라봅니다.',
    },
    {
      id: 3,
      name: '코딩하는 어피치',
      age: 21,
      mbti: 'ISFJ',
      nickname: 'CODE_PEACH',
      major: '정보보안학과',
      year: 2,
      tags: ['성실한', '배려심', '꼼꼼함'],
      interests: ['보안', '해킹', '스터디'],
      description: '차근차근 배워가며 함께 성장하는 것을 좋아합니다.',
    },
  ], [])

  const profile = useMemo(() => profiles[index % profiles.length], [profiles, index])

  // 드래그 계산 (성능 최적화)
  const dragX = useMemo(() => isDragging ? dragCurrent.x - dragStart.x : 0, [isDragging, dragCurrent.x, dragStart.x])
  const dragY = useMemo(() => isDragging ? (dragCurrent.y - dragStart.y) * 0.1 : 0, [isDragging, dragCurrent.y, dragStart.y])
  const rotation = useMemo(() => dragX * 0.1, [dragX])

  // 카드 진입 애니메이션
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), ANIMATION_DURATION)
    return () => clearTimeout(timer)
  }, [index])

  // 전역 마우스 이벤트 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setDragCurrent({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      
      const currentDragX = dragCurrent.x - dragStart.x
      
      if (Math.abs(currentDragX) > DRAG_THRESHOLD) {
        if (currentDragX > 0) {
          // Like 로직
          setExitX(SWIPE_VELOCITY)
          
          // 100% 매칭 성공
          const isMatch = true
          
          setTimeout(() => {
            if (isMatch) {
              setShowMatch(true)
            }
            setIndex((prev) => prev + 1)
            setExitX(0)
            setIsDragging(false)
            setDragCurrent({ x: 0, y: 0 })
            setDragStart({ x: 0, y: 0 })
          }, ANIMATION_DURATION)
                 } else {
           // Dislike 로직
           setExitX(-SWIPE_VELOCITY)
           
           setTimeout(() => {
            setIndex((prev) => prev + 1)
            setExitX(0)
            setIsDragging(false)
            setDragCurrent({ x: 0, y: 0 })
            setDragStart({ x: 0, y: 0 })
          }, ANIMATION_DURATION)
        }
      } else {
        setIsDragging(false)
        setDragCurrent({ x: 0, y: 0 })
        setDragStart({ x: 0, y: 0 })
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragCurrent.x, dragStart.x])

  // 성능 최적화된 함수들
  const nextProfile = useCallback(() => {
    setIndex((prev) => prev + 1)
    setExitX(0)
    setIsDragging(false)
    setDragCurrent({ x: 0, y: 0 })
    setDragStart({ x: 0, y: 0 })
  }, [])

  const handleLike = useCallback(() => {
    if (isDragging) return
    setExitX(SWIPE_VELOCITY)
    
    // 100% 매칭 성공
    const isMatch = true
    
    setTimeout(() => {
      if (isMatch) {
        setShowMatch(true)
      }
      nextProfile()
    }, ANIMATION_DURATION)
  }, [isDragging, nextProfile])

  const handleDislike = useCallback(() => {
    if (isDragging) return
    setExitX(-SWIPE_VELOCITY)
    
    setTimeout(nextProfile, ANIMATION_DURATION)
  }, [isDragging, nextProfile])

  // 터치 이벤트 핸들러들
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setDragCurrent({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    setDragCurrent({ x: touch.clientX, y: touch.clientY })
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    
    if (Math.abs(dragX) > DRAG_THRESHOLD) {
      if (dragX > 0) {
        handleLike()
      } else {
        handleDislike()
      }
    } else {
      // 스프링백 애니메이션
      setIsDragging(false)
      setDragCurrent({ x: 0, y: 0 })
      setDragStart({ x: 0, y: 0 })
    }
  }, [isDragging, dragX, handleLike, handleDislike])

  // 마우스 이벤트 핸들러 (시작만)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragCurrent({ x: e.clientX, y: e.clientY })
  }, [])

  const gotoChat = useCallback(() => {
    setShowMatch(false)
    setChatUserId(profile.id)
    setChatModalOpen(true)
  }, [profile.id])

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  const handleSegmentChange = useCallback((segment: SegmentType) => {
    setActiveSegment(segment)
  }, [])

  // PC 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 현재 매칭 탭이고 모달이나 입력 필드가 열려있지 않을 때만
      if (activeSegment !== 'matching' || chatModalOpen || showMatch) return
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handleDislike()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleLike()
          break
        case 'ArrowUp':
          e.preventDefault()
          // 다시 보기 기능 (프로필 새로고침)
          setIndex((prev) => Math.max(0, prev - 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          // 더 많은 정보 (프로필 상세 보기 - 추후 구현)
          console.log('프로필 상세 정보 표시')
          break
        case ' ': // 스페이스바
          e.preventDefault()
          handleLike()
          break
        case 'Escape':
          e.preventDefault()
          if (showMatch) setShowMatch(false)
          if (chatModalOpen) setChatModalOpen(false)
          break
      }
    }

    // PC에서만 키보드 이벤트 리스너 추가
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeSegment, chatModalOpen, showMatch, handleDislike, handleLike, setIndex])

  // 세그먼트별 컨텐츠 렌더링
  const renderContent = useCallback(() => {
    switch (activeSegment) {
      case 'matching':
        return (
          <div className="relative w-full max-w-sm">
            {/* Profile Card */}
            <ProfileCard
              profile={profile}
              isDarkMode={isDarkMode}
              exitX={exitX}
              dragX={dragX}
              dragY={dragY}
              rotation={rotation}
              isAnimating={isAnimating}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            />

                                      {/* Material Design 3 Action Buttons - PC/Mobile 반응형 */}
             <div className="flex justify-center gap-6 lg:gap-12 mt-8">
               <button
                 onClick={handleDislike}
                 disabled={isDragging}
                 className={`group relative w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-50 overflow-hidden ${
                   isDarkMode 
                     ? 'bg-gray-800/60 hover:bg-red-500/20 backdrop-blur-xl border border-gray-700/40 shadow-lg shadow-red-500/10' 
                     : 'bg-white/90 hover:bg-red-50 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-red-500/10'
                 } hover:shadow-2xl hover:scale-110 active:scale-95`}
               >
                 {/* Material Design 3 Ripple Effect */}
                 <div className="absolute inset-0 rounded-full bg-red-500/10 scale-0 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                 
                 <X size={26} className={`lg:scale-125 relative z-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                   isDarkMode 
                     ? 'text-red-400 group-hover:text-red-300 group-hover:scale-110 group-hover:rotate-90' 
                     : 'text-red-500 group-hover:text-red-600 group-hover:scale-110 group-hover:rotate-90'
                 }`} />
                 
                 {/* Floating Animation Ring */}
                 <div className="absolute inset-0 rounded-full border-2 border-red-400/20 scale-0 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
               </button>
               
               {/* PC 전용 추가 버튼 */}
               <div className="hidden lg:flex items-center gap-4">
                 <button
                   className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                     isDarkMode 
                       ? 'bg-gray-800/40 hover:bg-yellow-500/20 backdrop-blur-xl border border-gray-700/40' 
                       : 'bg-white/80 hover:bg-yellow-50 backdrop-blur-xl border border-gray-200/60'
                   } shadow-lg hover:shadow-xl hover:scale-110`}
                   title="다시 보기"
                 >
                   <div className="absolute inset-0 rounded-full bg-yellow-500/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
                   <Star size={20} className={`relative z-10 transition-colors ${
                     isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                   }`} />
                 </button>
                 
                 <button
                   className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                     isDarkMode 
                       ? 'bg-gray-800/40 hover:bg-blue-500/20 backdrop-blur-xl border border-gray-700/40' 
                       : 'bg-white/80 hover:bg-blue-50 backdrop-blur-xl border border-gray-200/60'
                   } shadow-lg hover:shadow-xl hover:scale-110`}
                   title="더 많은 정보"
                 >
                   <div className="absolute inset-0 rounded-full bg-blue-500/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
                   <BookOpen size={20} className={`relative z-10 transition-colors ${
                     isDarkMode ? 'text-blue-400' : 'text-blue-600'
                   }`} />
                 </button>
               </div>
               
               <button
                 onClick={handleLike}
                 disabled={isDragging}
                 className={`group relative w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-50 overflow-hidden ${
                   isDarkMode 
                     ? 'bg-gray-800/60 hover:bg-pink-500/20 backdrop-blur-xl border border-gray-700/40 shadow-lg shadow-pink-500/10' 
                     : 'bg-white/90 hover:bg-pink-50 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-pink-500/10'
                 } hover:shadow-2xl hover:scale-110 active:scale-95`}
               >
                 {/* Material Design 3 Ripple Effect */}
                 <div className="absolute inset-0 rounded-full bg-pink-500/10 scale-0 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                 
                 <Heart size={26} className={`lg:scale-125 relative z-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                   isDarkMode 
                     ? 'text-pink-400 group-hover:text-pink-300 group-hover:scale-110 group-hover:fill-current' 
                     : 'text-pink-500 group-hover:text-pink-600 group-hover:scale-110 group-hover:fill-current'
                 }`} />
                 
                 {/* Floating Animation Ring */}
                 <div className="absolute inset-0 rounded-full border-2 border-pink-400/20 scale-0 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                 
                 {/* Heart Beat Animation */}
                 <div className="absolute inset-0 rounded-full bg-pink-400/5 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               </button>
             </div>

             {/* PC 전용 키보드 단축키 안내 */}
             <div className="hidden lg:block mt-6 text-center">
               <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                 키보드 단축키: ← (거절) / → (좋아요) / ↑ (다시보기) / ↓ (더보기)
               </p>
             </div>
          </div>
        )
      case 'nearby':
        return <NearbyMatching isDarkMode={isDarkMode} />
      case 'liked':
        return <LikedProfiles isDarkMode={isDarkMode} />
      default:
        return null
    }
  }, [activeSegment, profile, isDarkMode, exitX, dragX, dragY, rotation, isAnimating, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleDislike, handleLike, isDragging])

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`min-h-screen transition-all duration-700 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        
        {/* 성능 최적화된 배경 */}
        <AnimatedBackground isDarkMode={isDarkMode} />

        {/* PC/Mobile 반응형 헤더 */}
        <header className="relative z-10 flex justify-between items-center p-6 md:p-8 pt-8">
          <div className="w-16 md:w-24"></div> {/* 왼쪽 공간 확보 */}

          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          } tracking-tight`}>
            매칭하기
          </h1>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setChatModalOpen(true)}
              className={`p-3 md:p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 relative ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20' 
                  : 'bg-white/80 hover:bg-white/90 backdrop-blur-md border border-white/50'
              } shadow-lg`}
            >
              <MessageCircle size={20} className={isDarkMode ? 'text-blue-300' : 'text-blue-600'} />
              {/* 읽지 않은 메시지 알림 */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </div>
            </button>
            
            <button
              onClick={toggleTheme}
              className={`p-3 md:p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20' 
                  : 'bg-white/80 hover:bg-white/90 backdrop-blur-md border border-white/50'
              } shadow-lg`}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <Moon size={20} className="text-indigo-600" />
              )}
            </button>
          </div>
        </header>

        {/* PC 버전 레이아웃 */}
        <div className="hidden lg:block relative z-10 flex-1 px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* PC 세그먼트 컨트롤 */}
            <div className="mb-8">
              <SegmentControl 
                activeSegment={activeSegment}
                onSegmentChange={handleSegmentChange}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* PC 메인 컨텐츠 */}
            <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
              {/* 왼쪽 패널 - 프로필 카드 */}
              <div className="col-span-5 flex items-center justify-center">
                <div className="w-full max-w-md">
                  {renderContent()}
                </div>
              </div>

              {/* 가운데 구분선 */}
              <div className="col-span-1 flex items-center justify-center">
                <div className={`w-px h-full ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                } opacity-50`} />
              </div>

              {/* 오른쪽 패널 - 추가 정보 */}
              <div className="col-span-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {activeSegment === 'matching' && (
                  <>
                    {/* 매칭 통계 */}
                    <div className={`rounded-3xl p-6 ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        오늘의 매칭 현황
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>12</div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>새로운 프로필</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            isDarkMode ? 'text-pink-400' : 'text-pink-600'
                          }`}>5</div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>매칭 성공</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>8</div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>새 메시지</div>
                        </div>
                      </div>
                    </div>

                                         {/* 추천 프로필 미리보기 */}
                     <div className={`rounded-3xl p-6 ${
                       isDarkMode 
                         ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                         : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                     } shadow-xl`}>
                       <div className="flex items-center justify-between mb-4">
                         <h3 className={`text-xl font-bold ${
                           isDarkMode ? 'text-white' : 'text-gray-800'
                         }`}>
                           🔮 다음 추천 프로필
                         </h3>
                         <button className={`text-xs px-3 py-1 rounded-full ${
                           isDarkMode 
                             ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                             : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                         } transition-colors`}>
                           전체보기
                         </button>
                       </div>
                       <div className="space-y-3">
                         {[
                           { name: '스터디 메이트', age: 22, tags: ['성실한', '열정적'], match: 95, distance: '0.5km' },
                           { name: '카페 친구', age: 24, tags: ['감성적', '여유로운'], match: 88, distance: '1.2km' },
                           { name: '운동 파트너', age: 21, tags: ['활발한', '건강한'], match: 82, distance: '0.8km' }
                         ].map((user, index) => (
                           <div key={index} className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                             isDarkMode 
                               ? 'bg-gray-700/40 border-gray-600/30 hover:bg-gray-700/60 hover:border-gray-500/50' 
                               : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                           }`}>
                             <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full ${
                                 isDarkMode ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-gray-200 to-gray-300'
                               } flex items-center justify-center relative`}>
                                 <User size={18} className={
                                   isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                 } />
                                 {/* 매칭 점수 배지 */}
                                 <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                   user.match >= 90 ? 'bg-green-500 text-white' :
                                   user.match >= 80 ? 'bg-yellow-500 text-white' :
                                   'bg-gray-500 text-white'
                                 }`}>
                                   {user.match}
                                 </div>
                               </div>
                               <div className="flex-1">
                                 <div className="flex items-center justify-between">
                                   <p className={`text-sm font-medium ${
                                     isDarkMode ? 'text-white' : 'text-gray-800'
                                   }`}>
                                     {user.name} · 만 {user.age}
                                   </p>
                                   <span className={`text-xs ${
                                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                   }`}>
                                     📍 {user.distance}
                                   </span>
                                 </div>
                                 <div className="flex gap-1 mt-1">
                                   {user.tags.map((tag, tagIndex) => (
                                     <span key={tagIndex} className={`text-xs px-2 py-0.5 rounded-full ${
                                       isDarkMode 
                                         ? 'bg-blue-500/20 text-blue-300' 
                                         : 'bg-blue-50 text-blue-600'
                                     }`}>
                                       #{tag}
                                     </span>
                                   ))}
                                 </div>
                                 {/* 매칭 이유 */}
                                 <p className={`text-xs mt-2 ${
                                   isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                 }`}>
                                   {index === 0 ? '같은 전공 + 스터디 관심사 일치' :
                                    index === 1 ? '카페 취향 + MBTI 궁합도 높음' :
                                    '운동 관심사 + 나이대 비슷함'}
                                 </p>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                       
                       {/* 큐 상태 */}
                       <div className={`mt-4 p-3 rounded-xl ${
                         isDarkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'
                       }`}>
                         <div className="flex items-center justify-between">
                           <span className={`text-sm font-medium ${
                             isDarkMode ? 'text-purple-300' : 'text-purple-700'
                           }`}>
                             💫 대기 중인 프로필
                           </span>
                           <span className={`text-xs ${
                             isDarkMode ? 'text-purple-400' : 'text-purple-600'
                           }`}>
                             +15명 더
                           </span>
                         </div>
                       </div>
                     </div>
                  </>
                )}

                {activeSegment === 'nearby' && (
                  <div className="space-y-6 h-full">
                    {/* 실시간 근처 활동 */}
                    <div className={`rounded-3xl p-6 ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        📍 실시간 근처 활동
                      </h3>
                      
                      {/* 현재 위치 정보 */}
                      <div className={`p-4 rounded-2xl mb-4 ${
                        isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-green-500" />
                              <h4 className={`font-medium ${
                                isDarkMode ? 'text-green-300' : 'text-green-700'
                              }`}>
                                🎯 메가스터디 대치점
                              </h4>
                            </div>
                            <p className={`text-sm mt-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              반경 500m 내 7명 활동 중
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className={`text-xs ${
                              isDarkMode ? 'text-green-300' : 'text-green-600'
                            }`}>
                              실시간
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 핫스팟 */}
                      <div className="space-y-3">
                        <h4 className={`font-medium text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          🔥 인기 핫스팟
                        </h4>
                        {[
                          { place: '스타벅스 대치점', count: 4, distance: '120m', activity: '스터디', icon: Coffee },
                          { place: '강남구립도서관', count: 3, distance: '350m', activity: '독서', icon: BookOpen },
                          { place: '대치동 카페거리', count: 2, distance: '180m', activity: '수다', icon: MessageCircle }
                        ].map((spot, index) => (
                          <div key={index} className={`p-3 rounded-xl ${
                            isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700/60' : 'bg-gray-50 hover:bg-gray-100'
                          } transition-colors cursor-pointer`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <spot.icon size={14} className={`${
                                    index === 0 ? 'text-green-500' :
                                    index === 1 ? 'text-blue-500' :
                                    'text-purple-500'
                                  }`} />
                                  <p className={`text-sm font-medium ${
                                    isDarkMode ? 'text-white' : 'text-gray-800'
                                  }`}>
                                    {spot.place}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    📍 {spot.distance}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    #{spot.activity}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${
                                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                }`}>
                                  {spot.count}명
                                </p>
                                <p className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  활동중
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 캠퍼스 매칭 */}
                    <div className={`rounded-3xl p-6 ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        🏫 캠퍼스 매칭
                      </h3>
                      
                      <div className="space-y-4">
                        <div className={`p-4 rounded-2xl ${
                          isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-medium ${
                                isDarkMode ? 'text-blue-300' : 'text-blue-700'
                              }`}>
                                🎓 같은 학교 우선 매칭
                              </h4>
                              <p className={`text-sm mt-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                연세대학교 학생 12명 온라인
                              </p>
                            </div>
                            <button className={`text-xs px-3 py-1 rounded-full ${
                              isDarkMode 
                                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            } transition-colors`}>
                              보기
                            </button>
                          </div>
                        </div>

                        <div className={`p-4 rounded-2xl ${
                          isDarkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-medium ${
                                isDarkMode ? 'text-purple-300' : 'text-purple-700'
                              }`}>
                                📚 같은 과 선후배 매칭
                              </h4>
                              <p className={`text-sm mt-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                경영학과 학생 5명과 매칭 가능
                              </p>
                            </div>
                            <button className={`text-xs px-3 py-1 rounded-full ${
                              isDarkMode 
                                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            } transition-colors`}>
                              보기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 위치 설정 */}
                    <div className={`rounded-3xl p-6 ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        ⚙️ 위치 설정
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            위치 기반 매칭
                          </span>
                          <button className={`w-12 h-6 rounded-full relative transition-colors ${
                            isDarkMode ? 'bg-blue-500' : 'bg-blue-500'
                          }`}>
                            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow transition-transform"></div>
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            매칭 반경
                          </span>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            1km
                          </span>
                        </div>
                        
                        <div className={`w-full h-2 rounded-full ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: '30%' }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>0.5km</span>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>3km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSegment === 'liked' && (
                  <div className="space-y-6 h-full">
                    {/* 매칭 성공률 */}
                    <div className={`rounded-3xl p-6 ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        💖 매칭 성공률
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            좋아요 보낸 수
                          </span>
                          <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            24개
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            상호 매칭
                          </span>
                          <span className={`font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                            8개
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            성공률
                          </span>
                          <span className={`font-bold text-green-500`}>
                            33.3%
                          </span>
                        </div>
                        
                        {/* 성공률 프로그레스 바 */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              매칭 성공률
                            </span>
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              평균 15% ↑
                            </span>
                          </div>
                          <div className={`w-full h-3 rounded-full relative overflow-hidden ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full transition-all duration-2000 ease-out relative"
                              style={{ width: '33%' }}
                            >
                              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>0%</span>
                            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>50%</span>
                            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>100%</span>
                          </div>
                          <p className={`text-xs mt-3 px-3 py-2 rounded-full text-center ${
                            isDarkMode 
                              ? 'bg-green-500/10 text-green-300 border border-green-500/20' 
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            ✨ 다른 사용자보다 18% 높은 성공률! 
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 관심사 분석 */}
                    <div className={`rounded-3xl p-6 ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        🎯 인기 관심사
                      </h3>
                      <div className="space-y-3">
                        {[
                          { tag: '카페', count: 12, color: 'brown' },
                          { tag: '영화감상', count: 8, color: 'purple' },
                          { tag: '스터디', count: 6, color: 'blue' },
                          { tag: '운동', count: 4, color: 'green' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.color === 'brown' ? (isDarkMode ? 'bg-amber-800/30 text-amber-300' : 'bg-amber-100 text-amber-700') :
                                item.color === 'purple' ? (isDarkMode ? 'bg-purple-800/30 text-purple-300' : 'bg-purple-100 text-purple-700') :
                                item.color === 'blue' ? (isDarkMode ? 'bg-blue-800/30 text-blue-300' : 'bg-blue-100 text-blue-700') :
                                (isDarkMode ? 'bg-green-800/30 text-green-300' : 'bg-green-100 text-green-700')
                              }`}>
                                #{item.tag}
                              </span>
                            </div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {item.count}명
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 매칭 팁 (기존) */}
                    <div className={`rounded-3xl p-6 ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/40' 
                        : 'bg-white/90 backdrop-blur-xl border border-gray-200/60'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        💡 매칭 팁
                      </h3>
                      <div className="space-y-4">
                        <div className={`p-4 rounded-2xl ${
                          isDarkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
                        }`}>
                          <h4 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                          }`}>
                            📸 프로필 사진 팁
                          </h4>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            자연스러운 미소 사진이 좋아요율 65% 증가
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-2xl ${
                          isDarkMode ? 'bg-pink-500/10 border border-pink-500/20' : 'bg-pink-50 border border-pink-200'
                        }`}>
                          <h4 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-pink-300' : 'text-pink-700'
                          }`}>
                            💬 대화 시작하기
                          </h4>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            "안녕하세요" 보다 관심사 질문이 효과적
                          </p>
                        </div>

                        <div className={`p-4 rounded-2xl ${
                          isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <h4 className={`font-medium mb-2 ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-700'
                          }`}>
                            ⏰ 최적 활동 시간
                          </h4>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            오후 7-9시가 매칭 성공률이 가장 높아요
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 버전 레이아웃 */}
        <div className="lg:hidden">
          {/* 세그먼트 컨트롤 */}
          <SegmentControl 
            activeSegment={activeSegment}
            onSegmentChange={handleSegmentChange}
            isDarkMode={isDarkMode}
          />

          {/* Main Content */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-2">
            {renderContent()}
          </div>
        </div>

        {/* Enhanced Match Success Modal - 완전 모바일 최적화 */}
        {showMatch && (
          <div 
            className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-[99999]" 
            style={{ 
              animation: 'fadeIn 0.3s ease-out',
              position: 'fixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              boxSizing: 'border-box'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMatch(false)
              }
            }}
          >
            <div 
              className={`rounded-3xl p-6 w-full shadow-2xl transition-all duration-700 ${
                isDarkMode 
                  ? 'bg-gray-800/98 backdrop-blur-2xl border border-white/20' 
                  : 'bg-white/98 backdrop-blur-2xl border border-white/60'
              }`}
              style={{ 
                animation: 'zoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                maxWidth: '400px',
                maxHeight: '80vh',
                overflow: 'auto',
                margin: '0 auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
                    <Heart size={40} className="text-white" fill="currentColor" />
                  </div>
                  <div className="absolute inset-0 bg-pink-400 rounded-full blur-2xl opacity-30 animate-ping" />
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
                  <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
                </div>
                
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    🎉 매칭 성공!
                  </h3>
                  <p className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {profile.name}님과 매칭됐어요!<br />
                    지금 바로 대화를 시작해보세요!
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowMatch(false)
                      // 모달만 닫고 프로필은 유지
                    }}
                    className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                    }`}
                  >
                    나중에
                  </button>
                  <button
                    onClick={gotoChat}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    채팅 시작
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          initialUserId={chatUserId}
          isDarkMode={isDarkMode}
        />
      </div>
    </>
  )
}

export default MatchingPage