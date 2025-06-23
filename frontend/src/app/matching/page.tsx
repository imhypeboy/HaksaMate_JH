"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, X, User, Sun, Moon, MapPin, Star, Zap, Coffee, Code, Gamepad2, Music, Palette, Film, Shield, BookOpen, MessageCircle } from 'lucide-react'
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

        {/* Enhanced Header */}
        <header className="relative z-10 flex justify-between items-center p-6 pt-8">
          <div className="w-16"></div> {/* 왼쪽 공간 확보 */}

          <h1 className={`text-3xl font-bold transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          } tracking-tight`}>
            매칭하기
          </h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChatModalOpen(true)}
              className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 relative ${
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
              className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
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

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-2">
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

            {/* Enhanced Action Buttons */}
            <div className="flex justify-center gap-8 mt-8">
              <button
                onClick={handleDislike}
                disabled={isDragging}
                className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-95 disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-red-500/20 backdrop-blur-md border border-white/20 hover:border-red-400/50' 
                    : 'bg-white/90 hover:bg-red-50 backdrop-blur-md border border-gray-200 hover:border-red-300'
                } shadow-lg hover:shadow-2xl`}
              >
                <X size={24} className={`transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-red-400 group-hover:text-red-300 group-hover:scale-110' 
                    : 'text-red-500 group-hover:text-red-600 group-hover:scale-110'
                }`} />
                <div className="absolute inset-0 rounded-full bg-red-500/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
              </button>
              
              <button
                onClick={handleLike}
                disabled={isDragging}
                className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-95 disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-pink-500/20 backdrop-blur-md border border-white/20 hover:border-pink-400/50' 
                    : 'bg-white/90 hover:bg-pink-50 backdrop-blur-md border border-gray-200 hover:border-pink-300'
                } shadow-lg hover:shadow-2xl`}
              >
                <Heart size={24} className={`transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-pink-400 group-hover:text-pink-300 group-hover:scale-110' 
                    : 'text-pink-500 group-hover:text-pink-600 group-hover:scale-110'
                }`} />
                <div className="absolute inset-0 rounded-full bg-pink-500/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
              </button>
            </div>
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
        </div>

        {/* Chat Modal */}
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          initialUserId={chatUserId}
          isDarkMode={isDarkMode}
        />
      </>
    )
  }
  
  export default MatchingPage