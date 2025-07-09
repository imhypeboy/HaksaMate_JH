"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Bell, Clock, AlertTriangle, Filter, Star, GraduationCap, BookOpen, PartyPopper, Users, MapPin, Search, Sun, Moon, ChevronLeft, ChevronRight, Grid3x3, CalendarDays } from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import { supabase } from "@/lib/supabaseClient"

interface AcademicEvent {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  category: "성적" | "수강신청" | "시험" | "축제" | "공휴일" | "등록" | "실습" | "개강" | "졸업" | "기타"
  priority: "높음" | "보통" | "낮음"
  isCompleted?: boolean
  daysLeft?: number
  location?: string
  icon?: string
}

// 날짜 계산 유틸리티 함수
const calculateDaysLeft = (startDate: string): number => {
  const today = new Date()
  const eventDate = new Date(startDate)
  const diffTime = eventDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 데이터를 컴포넌트 외부로 이동 (상수화)
const ACADEMIC_EVENTS_RAW = [
  // 2025년 7월
  {
    id: 1,
    title: "계절학기 성적입력",
    description: "하계 계절학기 성적 입력 기간입니다.",
    startDate: "2025-07-10",
    endDate: "2025-07-15",
    category: "성적" as const,
    priority: "보통" as const,
    icon: "📝"
  },
  {
    id: 2,
    title: "계절학기 성적확인",
    description: "하계 계절학기 성적을 확인할 수 있습니다.",
    startDate: "2025-07-16",
    category: "성적" as const,
    priority: "보통" as const,
    icon: "📊"
  },
  {
    id: 3,
    title: "졸업사정회",
    description: "졸업 요건 심사가 진행됩니다.",
    startDate: "2025-07-28",
    category: "졸업" as const,
    priority: "높음" as const,
    icon: "🎓"
  },
  {
    id: 4,
    title: "예비수강신청",
    description: "다음 학기 예비 수강신청 기간입니다.",
    startDate: "2025-07-28",
    endDate: "2025-07-30",
    category: "수강신청" as const,
    priority: "높음" as const,
    icon: "📚"
  },
  // 2025년 3월
  {
    id: 5,
    title: "삼일절",
    description: "3·1절 국경일입니다.",
    startDate: "2025-03-01",
    category: "공휴일" as const,
    priority: "낮음" as const,
    icon: "🇰🇷"
  },
  {
    id: 6,
    title: "개강 / 입학식",
    description: "2025학년도 1학기 개강 및 입학식이 있습니다.",
    startDate: "2025-03-04",
    category: "개강" as const,
    priority: "높음" as const,
    icon: "🏫"
  },
  {
    id: 7,
    title: "수강과목 중도포기",
    description: "수강 과목 중도포기 신청 기간입니다. (4주차)",
    startDate: "2025-03-25",
    endDate: "2025-03-27",
    category: "수강신청" as const,
    priority: "보통" as const,
    icon: "❌"
  },
  // 2025년 4월
  {
    id: 8,
    title: "중간강의평가",
    description: "중간 강의평가 기간입니다. (7주차)",
    startDate: "2025-04-14",
    endDate: "2025-05-02",
    category: "기타" as const,
    priority: "보통" as const,
    icon: "⭐"
  },
  {
    id: 9,
    title: "교직원 영성축제",
    description: "교직원 영성축제가 개최됩니다.",
    startDate: "2025-04-21",
    endDate: "2025-04-25",
    category: "축제" as const,
    priority: "낮음" as const,
    icon: "🎉"
  },
  {
    id: 10,
    title: "중간고사",
    description: "1학기 중간고사 기간입니다. (8주차)",
    startDate: "2025-04-22",
    endDate: "2025-04-28",
    category: "시험" as const,
    priority: "높음" as const,
    icon: "📝"
  },
  // 2025년 5월
  {
    id: 11,
    title: "근로자의 날",
    description: "근로자의 날 공휴일입니다.",
    startDate: "2025-05-01",
    category: "공휴일" as const,
    priority: "낮음" as const,
    icon: "👷"
  },
  {
    id: 12,
    title: "학교현장 교육실습",
    description: "교육실습생 학교현장 실습 기간입니다.",
    startDate: "2025-05-07",
    endDate: "2025-05-30",
    category: "실습" as const,
    priority: "높음" as const,
    icon: "🏫"
  },
  {
    id: 13,
    title: "사랑나눔축제",
    description: "대학 사랑나눔축제가 개최됩니다.",
    startDate: "2025-05-12",
    endDate: "2025-05-16",
    category: "축제" as const,
    priority: "보통" as const,
    icon: "❤️"
  },
  {
    id: 14,
    title: "계절학기 수강신청",
    description: "하계 계절학기 수강신청 기간입니다.",
    startDate: "2025-05-26",
    endDate: "2025-05-28",
    category: "수강신청" as const,
    priority: "보통" as const,
    icon: "📚"
  },
  // 2025년 6월
  {
    id: 15,
    title: "현충일",
    description: "현충일 국경일입니다.",
    startDate: "2025-06-06",
    category: "공휴일" as const,
    priority: "낮음" as const,
    icon: "🇰🇷"
  },
  {
    id: 16,
    title: "기말고사",
    description: "1학기 기말고사 기간입니다. (15주차)",
    startDate: "2025-06-10",
    endDate: "2025-06-16",
    category: "시험" as const,
    priority: "높음" as const,
    icon: "📝"
  },
  {
    id: 17,
    title: "성적입력기간",
    description: "교수님들의 성적 입력 기간입니다.",
    startDate: "2025-06-10",
    endDate: "2025-06-23",
    category: "성적" as const,
    priority: "보통" as const,
    icon: "📊"
  },
  {
    id: 18,
    title: "하계계절학기",
    description: "여름 계절학기가 진행됩니다.",
    startDate: "2025-06-23",
    endDate: "2025-07-11",
    category: "개강" as const,
    priority: "보통" as const,
    icon: "☀️"
  },
  // 2025년 8월
  {
    id: 19,
    title: "본수강신청",
    description: "2학기 본 수강신청 기간입니다.",
    startDate: "2025-08-04",
    endDate: "2025-08-06",
    category: "수강신청" as const,
    priority: "높음" as const,
    icon: "📚"
  },
  {
    id: 20,
    title: "후기 학위수여식",
    description: "후기 졸업식이 진행됩니다.",
    startDate: "2025-08-14",
    category: "졸업" as const,
    priority: "높음" as const,
    icon: "🎓"
  },
  {
    id: 21,
    title: "재학생 등록기간",
    description: "재학생 등록 기간입니다.",
    startDate: "2025-08-18",
    endDate: "2025-08-22",
    category: "등록" as const,
    priority: "높음" as const,
    icon: "📋"
  },
  // 2025년 9월
  {
    id: 22,
    title: "2학기 개강",
    description: "2025학년도 2학기가 시작됩니다.",
    startDate: "2025-09-01",
    category: "개강" as const,
    priority: "높음" as const,
    icon: "🏫"
  },
  {
    id: 23,
    title: "수강신청 확인 및 정정",
    description: "수강신청 확인 및 정정 기간입니다. (1주차)",
    startDate: "2025-09-01",
    endDate: "2025-09-05",
    category: "수강신청" as const,
    priority: "높음" as const,
    icon: "✏️"
  },
  {
    id: 24,
    title: "천보축전",
    description: "대학 천보축전이 개최됩니다.",
    startDate: "2025-09-29",
    category: "축제" as const,
    priority: "보통" as const,
    icon: "🎊"
  },
  {
    id: 25,
    title: "체육대회",
    description: "전교 체육대회가 열립니다.",
    startDate: "2025-09-30",
    category: "축제" as const,
    priority: "보통" as const,
    icon: "🏃"
  }
] as const

export default function AcademicCalendarPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  const [showNotifications, setShowNotifications] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid")
  const [notificationSettings, setNotificationSettings] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  // 캘린더 관련 상태
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [modalType, setModalType] = useState<'all' | 'upcoming' | 'notifications' | 'important' | null>(null)

  const categories = ["전체", "성적", "수강신청", "시험", "축제", "공휴일", "등록", "실습", "개강", "졸업", "기타"]

  // 토스트 메시지 표시 함수
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // 알림 설정 토글 함수
  const toggleNotification = useCallback(async (eventId: number, eventTitle: string) => {
    setIsLoading(true)
    try {
      // 실제 API 호출을 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setNotificationSettings(prev => {
        const newSettings = new Set(prev)
        if (newSettings.has(eventId)) {
          newSettings.delete(eventId)
          showToast(`"${eventTitle}" 알림이 해제되었습니다`, 'info')
        } else {
          newSettings.add(eventId)
          showToast(`"${eventTitle}" 알림이 설정되었습니다`, 'success')
        }
        
        // localStorage에 저장
        localStorage.setItem('notificationSettings', JSON.stringify([...newSettings]))
        return newSettings
      })
    } catch (error) {
      showToast('알림 설정 중 오류가 발생했습니다', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  // 실제 날짜 계산이 포함된 이벤트 데이터
  const academicEvents: AcademicEvent[] = useMemo(() => {
    return ACADEMIC_EVENTS_RAW.map(event => ({
      ...event,
      daysLeft: calculateDaysLeft(event.startDate)
    }))
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
        return
      }
      setUserId(session.user.id)
    }
    checkAuth()
  }, [router])

  // 다크모드 localStorage 지원 추가
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode))
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    }
  }, [])

  // 다크모드 토글 함수 개선
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem('darkMode', JSON.stringify(newValue))
      return newValue
    })
  }, [])

  // localStorage에서 알림 설정 복원
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      try {
        const settings = JSON.parse(savedNotifications)
        setNotificationSettings(new Set(settings))
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      }
    }
  }, [])

  // 모바일 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // 모달 ESC 키 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalType(null)
        setSelectedDate(null)
      }
    }
    
    if (modalType || selectedDate) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [modalType, selectedDate])

  // 지나간 일정인지 확인하는 함수
  const isPastEvent = useCallback((event: AcademicEvent) => {
    const today = new Date()
    const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
    today.setHours(0, 0, 0, 0)
    eventEndDate.setHours(23, 59, 59, 999)
    return eventEndDate < today
  }, [])

  const getFilteredEvents = useCallback(() => {
    let filtered = academicEvents
    
    if (selectedCategory !== "전체") {
      filtered = filtered.filter((event) => event.category === selectedCategory)
    }
    
    if (searchTerm) {
      filtered = filtered.filter((event) => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // 완료된 일정을 뒤로 정렬 (진행중/예정 일정이 먼저 표시)
    return filtered.sort((a, b) => {
      const aIsPast = isPastEvent(a)
      const bIsPast = isPastEvent(b)
      
      // 완료 상태가 다르면 완료되지 않은 것이 먼저
      if (aIsPast !== bIsPast) {
        return aIsPast ? 1 : -1
      }
      
      // 같은 완료 상태면 날짜순 정렬 (가까운 날짜가 먼저)
      if (!aIsPast && !bIsPast) {
        // 진행중/예정 일정은 daysLeft 기준으로 정렬
        return (a.daysLeft || 0) - (b.daysLeft || 0)
      } else {
        // 완료된 일정은 날짜순으로 정렬 (최신 완료가 먼저)
        const aDate = new Date(a.startDate)
        const bDate = new Date(b.startDate)
        return bDate.getTime() - aDate.getTime()
      }
    })
  }, [academicEvents, selectedCategory, searchTerm, isPastEvent])

  const getUpcomingEvents = useCallback(() => {
    return academicEvents
      .filter((event) => event.daysLeft !== undefined && event.daysLeft >= 0 && event.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
      .slice(0, 3)
  }, [academicEvents])

  // 메모이제이션된 결과
  const filteredEvents = useMemo(() => getFilteredEvents(), [getFilteredEvents])
  const upcomingEvents = useMemo(() => getUpcomingEvents(), [getUpcomingEvents])

  const getPriorityColor = useCallback((priority: string) => {
    const colors = {
      높음: darkMode 
        ? "bg-red-900/30 text-red-300 border-red-700/50 backdrop-blur-sm"
        : "bg-red-50 text-red-700 border-red-200/50 backdrop-blur-sm",
      보통: darkMode
        ? "bg-amber-900/30 text-amber-300 border-amber-700/50 backdrop-blur-sm"
        : "bg-amber-50 text-amber-700 border-amber-200/50 backdrop-blur-sm",
      낮음: darkMode
        ? "bg-emerald-900/30 text-emerald-300 border-emerald-700/50 backdrop-blur-sm"
        : "bg-emerald-50 text-emerald-700 border-emerald-200/50 backdrop-blur-sm"
    }
    return colors[priority as keyof typeof colors] || colors.보통
  }, [darkMode])

  const getCategoryColor = useCallback((category: string) => {
    const colors = {
      성적: darkMode ? "bg-blue-900/30 text-blue-300 border-blue-700/50" : "bg-blue-50 text-blue-700 border-blue-200/50",
      수강신청: darkMode ? "bg-purple-900/30 text-purple-300 border-purple-700/50" : "bg-purple-50 text-purple-700 border-purple-200/50",
      시험: darkMode ? "bg-red-900/30 text-red-300 border-red-700/50" : "bg-red-50 text-red-700 border-red-200/50",
      축제: darkMode ? "bg-pink-900/30 text-pink-300 border-pink-700/50" : "bg-pink-50 text-pink-700 border-pink-200/50",
      공휴일: darkMode ? "bg-indigo-900/30 text-indigo-300 border-indigo-700/50" : "bg-indigo-50 text-indigo-700 border-indigo-200/50",
      등록: darkMode ? "bg-orange-900/30 text-orange-300 border-orange-700/50" : "bg-orange-50 text-orange-700 border-orange-200/50",
      실습: darkMode ? "bg-teal-900/30 text-teal-300 border-teal-700/50" : "bg-teal-50 text-teal-700 border-teal-200/50",
      개강: darkMode ? "bg-green-900/30 text-green-300 border-green-700/50" : "bg-green-50 text-green-700 border-green-200/50",
      졸업: darkMode ? "bg-yellow-900/30 text-yellow-300 border-yellow-700/50" : "bg-yellow-50 text-yellow-700 border-yellow-200/50",
      기타: darkMode ? "bg-gray-700/30 text-gray-300 border-gray-600/50" : "bg-gray-50 text-gray-700 border-gray-200/50"
    }
    return colors[category as keyof typeof colors] || colors.기타
  }, [darkMode])

  // 선택된 날짜에서 더 잘 보이는 색상 (다크모드용)
  const getCategoryColorForSelected = useCallback((category: string) => {
    const colors = {
      성적: "bg-blue-600 text-white border-blue-500",
      수강신청: "bg-purple-600 text-white border-purple-500",
      시험: "bg-red-600 text-white border-red-500",
      축제: "bg-pink-600 text-white border-pink-500",
      공휴일: "bg-indigo-600 text-white border-indigo-500",
      등록: "bg-orange-600 text-white border-orange-500",
      실습: "bg-teal-600 text-white border-teal-500",
      개강: "bg-green-600 text-white border-green-500",
      졸업: "bg-yellow-600 text-white border-yellow-500",
      기타: "bg-gray-600 text-white border-gray-500"
    }
    return colors[category as keyof typeof colors] || colors.기타
  }, [])

  // 통계 카드 데이터 (완료된 일정은 뒤로 정렬)
  const statsData = useMemo(() => {
    const sortEvents = (events: AcademicEvent[]) => {
      return events.sort((a, b) => {
        const aIsPast = isPastEvent(a)
        const bIsPast = isPastEvent(b)
        
        // 완료 상태가 다르면 완료되지 않은 것이 먼저
        if (aIsPast !== bIsPast) {
          return aIsPast ? 1 : -1
        }
        
        // 같은 완료 상태면 날짜순 정렬
        if (!aIsPast && !bIsPast) {
          return (a.daysLeft || 0) - (b.daysLeft || 0)
        } else {
          const aDate = new Date(a.startDate)
          const bDate = new Date(b.startDate)
          return bDate.getTime() - aDate.getTime()
        }
      })
    }

    return {
      all: sortEvents([...academicEvents]),
      upcoming: upcomingEvents, // 이미 정렬됨
      notifications: sortEvents(academicEvents.filter(event => notificationSettings.has(event.id))),
      important: sortEvents(academicEvents.filter(event => event.priority === "높음"))
    }
  }, [academicEvents, upcomingEvents, notificationSettings, isPastEvent])

  const getCategoryIcon = useCallback((category: string) => {
    const icons = {
      성적: <Star className="w-4 h-4" />,
      수강신청: <BookOpen className="w-4 h-4" />,
      시험: <Clock className="w-4 h-4" />,
      축제: <PartyPopper className="w-4 h-4" />,
      공휴일: <Calendar className="w-4 h-4" />,
      등록: <Users className="w-4 h-4" />,
      실습: <MapPin className="w-4 h-4" />,
      개강: <Bell className="w-4 h-4" />,
      졸업: <GraduationCap className="w-4 h-4" />,
      기타: <Calendar className="w-4 h-4" />
    }
    return icons[category as keyof typeof icons] || icons.기타
  }, [])

  const themeClasses = darkMode 
    ? "bg-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900"

  const cardClasses = darkMode
    ? "bg-gray-800/50 backdrop-blur-md border-gray-700/50"
    : "bg-white/70 backdrop-blur-md border-white/50 shadow-xl shadow-blue-100/20"

  // 캘린더 유틸리티 함수들
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // 주의 첫째 날까지 포함
    
    const days = []
    const currentDay = new Date(startDate)
    
    // 6주 분량의 날짜 생성 (42일)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }

  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredEvents.filter(event => {
      const eventStart = event.startDate
      const eventEnd = event.endDate || event.startDate
      return dateStr >= eventStart && dateStr <= eventEnd
    })
  }, [filteredEvents])

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSameMonth = (date: Date, month: Date) => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear()
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }

  // 캘린더 뷰 컴포넌트
  const CalendarView = () => {
    const days = getDaysInMonth(currentDate)
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

    return (
      <div className="space-y-6">
        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h3>
            <button
              onClick={goToToday}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                darkMode 
                  ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30" 
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              오늘
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              aria-label="이전 달"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              aria-label="다음 달"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-semibold ${
                index === 0 
                  ? "text-red-500" 
                  : index === 6 
                    ? "text-blue-500" 
                    : darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)
            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] p-1 sm:p-2 rounded-lg sm:rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/90 dark:bg-gray-800/90 dark:border-blue-400"
                    : isTodayDate
                      ? "border-blue-300 bg-blue-25 dark:bg-blue-900/10"
                      : darkMode
                        ? "border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/50"
                        : "border-gray-200/50 bg-white/50 hover:bg-gray-50"
                } ${!isCurrentMonth && "opacity-40"}`}
              >
                {/* 날짜 */}
                <div className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
                  isTodayDate
                    ? "text-blue-600 dark:text-blue-400"
                    : index % 7 === 0
                      ? "text-red-500"
                      : index % 7 === 6
                        ? "text-blue-500"
                        : isSelected && darkMode
                          ? "text-gray-100"
                          : darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  {day.getDate()}
                </div>

                {/* 일정들 */}
                <div className="space-y-0.5 sm:space-y-1">
                  {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => {
                    const isPast = isPastEvent(event)
                    return (
                      <div
                        key={event.id}
                        className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium truncate transition-all duration-300 hover:scale-105 ${
                          isPast
                            ? 'bg-gray-400/30 text-gray-500 border border-gray-400/30 line-through opacity-60'
                            : isSelected && darkMode
                              ? getCategoryColorForSelected(event.category)
                              : getCategoryColor(event.category)
                        }`}
                        title={`${event.title}${isPast ? ' (완료됨)' : ''}`}
                      >
                        <span className={`mr-1 text-xs ${isPast ? 'grayscale' : ''}`}>{event.icon}</span>
                        <span className="hidden sm:inline">{event.title}</span>
                        <span className="sm:hidden">{event.title.slice(0, 6)}...</span>
                      </div>
                    )
                  })}
                  {dayEvents.length > (isMobile ? 2 : 3) && (
                    <div className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                      isSelected && darkMode
                        ? "bg-gray-600 text-gray-200 border border-gray-500"
                        : darkMode 
                          ? "bg-gray-600 text-gray-300" 
                          : "bg-gray-200 text-gray-700"
                    }`}>
                      +{dayEvents.length - (isMobile ? 2 : 3)}개
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 선택된 날짜의 일정 상세 */}
        {selectedDate && (
          <div className={`${cardClasses} rounded-2xl p-6 mt-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold">
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => {
                  const isPast = isPastEvent(event)
                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                        isPast 
                          ? darkMode ? 'bg-gray-800/20 border-gray-700/30 opacity-70' : 'bg-gray-100/50 border-gray-300/30 opacity-70'
                          : darkMode ? 'bg-gray-700/30 border-gray-600/50' : 'bg-gray-50/50 border-gray-200/50'
                      }`}
                    >
                      {isPast && (
                        <div className="flex items-center mb-3">
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-500 rounded-full text-xs font-medium border border-gray-400/30">
                            ✓ 완료된 일정
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap px-1">
                            <span className={`text-xl flex-shrink-0 ${isPast ? 'grayscale' : ''}`}>{event.icon}</span>
                            <h5 className={`font-semibold text-base ${isPast ? 'text-gray-500 line-through' : ''}`}>{event.title}</h5>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              isPast 
                                ? 'bg-gray-400/20 text-gray-500 border border-gray-400/30'
                                : getCategoryColor(event.category)
                            }`}>
                              {event.category}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              isPast 
                                ? 'bg-gray-400/20 text-gray-500 border border-gray-400/30'
                                : getPriorityColor(event.priority)
                            }`}>
                              {event.priority}
                            </span>
                          </div>
                          <p className={`text-sm mb-3 px-1 leading-relaxed ${isPast ? 'opacity-50' : 'opacity-75'}`}>{event.description}</p>
                          <div className={`flex items-center text-sm px-1 ${isPast ? 'opacity-40' : 'opacity-60'}`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString('ko-KR')}
                              {event.endDate && ` ~ ${new Date(event.endDate).toLocaleDateString('ko-KR')}`}
                            </span>
                            {isPast && (
                              <span className="ml-3 font-medium text-gray-500">
                                • 완료됨
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleNotification(event.id, event.title)}
                          className={`py-2 px-4 ${
                            isPast 
                              ? 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                          } rounded-xl hover:shadow-lg transition-all duration-300 text-sm ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={isLoading || isPast}
                        >
                          {isPast ? "완료된 일정" : isLoading ? "설정 중..." : notificationSettings.has(event.id) ? "알림 해제" : "알림 설정"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 text-gray-500">
                이 날에는 일정이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen transition-all duration-300 ${themeClasses}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 font-sans pb-12">
        {/* 토스트 메시지 */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 transform ${
            toast.type === 'success' 
              ? 'bg-green-500/90 text-white border-green-400/50' 
              : toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400/50'
                : 'bg-blue-500/90 text-white border-blue-400/50'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <p className="font-medium">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="ml-3 text-white/70 hover:text-white transition-colors"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <header className={`${cardClasses} py-6 px-4 flex justify-between items-center border-b sticky top-0 z-40`}>
          <div className="w-10"></div>
          <h1 className="text-2xl font-bold flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            학사 일정 알림
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none ${
              darkMode 
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                : "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
            }`}
            aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
          {/* 긴급 알림 - 조건 개선 */}
          {showNotifications && upcomingEvents.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-md border border-white/20 shadow-2xl">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">🚨 긴급 알림</h2>
                      <p className="opacity-90 mb-4">30일 이내 중요한 학사 일정을 확인하세요!</p>
                      <div className="grid gap-3">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-2">
                              <div className="flex items-start sm:items-center flex-1 min-w-0">
                                <span className="text-2xl mr-4 flex-shrink-0">{event.icon}</span>
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-semibold text-white break-words text-base">{event.title}</span>
                                    <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium text-white/90 border border-white/20 whitespace-nowrap">
                                      {event.category}
                                    </span>
                                  </div>
                                  <span className="text-sm text-white/80 block leading-relaxed">{event.description}</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right sm:text-center">
                                <span className="text-sm bg-white/25 border border-white/30 px-4 py-2 rounded-full font-medium backdrop-blur-sm text-white inline-block">
                                  {event.daysLeft && event.daysLeft > 0 ? `${event.daysLeft}일 남음` : "진행중"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    aria-label="긴급 알림 닫기"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 빈 상태 처리 개선 */}
          {showNotifications && upcomingEvents.length === 0 && (
            <div className={`${cardClasses} rounded-2xl p-6 text-center`}>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">😌</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">모든 일정이 여유롭습니다</h3>
              <p className="text-sm opacity-70">30일 이내에 임박한 중요 일정이 없습니다.</p>
            </div>
          )}

          {/* 통계 카드 - 반응형 개선 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <button 
              onClick={() => setModalType('all')}
              className={`${cardClasses} p-4 lg:p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-left w-full`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                  <Calendar className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm lg:text-lg font-semibold opacity-70">전체 일정</h3>
                  <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {academicEvents.length}
                  </p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setModalType('upcoming')}
              className={`${cardClasses} p-4 lg:p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none text-left w-full`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                  <Clock className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm lg:text-lg font-semibold opacity-70">임박한 일정</h3>
                  <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {upcomingEvents.length}
                  </p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setModalType('notifications')}
              className={`${cardClasses} p-4 lg:p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-green-500/50 focus:outline-none text-left w-full`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                  <Bell className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm lg:text-lg font-semibold opacity-70">알림 설정</h3>
                  <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {notificationSettings.size}
                  </p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setModalType('important')}
              className={`${cardClasses} p-4 lg:p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-purple-500/50 focus:outline-none text-left w-full`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                  <Star className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm lg:text-lg font-semibold opacity-70">중요 일정</h3>
                  <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {academicEvents.filter(e => e.priority === "높음").length}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* 검색 및 필터 - 접근성 개선 */}
          <div className={`${cardClasses} rounded-2xl p-6`}>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="일정 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none ${
                    darkMode 
                      ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400" 
                      : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                  aria-label="학사 일정 검색"
                />
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 opacity-70" />
                  <select
                    className={`border rounded-xl px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none ${
                      darkMode 
                        ? "bg-gray-700/50 border-gray-600 text-gray-100" 
                        : "bg-white/50 border-gray-200 text-gray-900"
                    }`}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="카테고리 필터"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl p-1" role="tablist" aria-label="보기 모드 선택">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none flex items-center gap-2 font-medium ${
                      viewMode === "grid" 
                        ? "bg-white dark:bg-gray-700 shadow-lg border border-gray-200/50 dark:border-gray-500/50 text-gray-900 dark:text-gray-100" 
                        : "hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    role="tab"
                    aria-selected={viewMode === "grid"}
                    aria-controls="calendar-content"
                  >
                    <Grid3x3 className="w-4 h-4" />
                    격자
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none flex items-center gap-2 font-medium ${
                      viewMode === "calendar" 
                        ? "bg-white dark:bg-gray-700 shadow-lg border border-gray-200/50 dark:border-gray-500/50 text-gray-900 dark:text-gray-100" 
                        : "hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    role="tab"
                    aria-selected={viewMode === "calendar"}
                    aria-controls="calendar-content"
                  >
                    <CalendarDays className="w-4 h-4" />
                    캘린더
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 학사 일정 목록 */}
          <div className={`${cardClasses} rounded-2xl p-6`} id="calendar-content">
            <h2 className="text-2xl font-bold mb-6 flex items-center px-2">
              <Calendar className="w-6 h-6 mr-3 text-blue-600" />
              학사 일정
              <span className="ml-3 text-sm font-normal opacity-60">
                ({filteredEvents.length}개)
              </span>
            </h2>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
                {filteredEvents.map((event) => {
                  const isPast = isPastEvent(event)
                  return (
                    <div
                      key={event.id}
                      className={`${
                        isPast 
                          ? darkMode ? 'bg-gray-800/20 border-gray-700/30' : 'bg-gray-100/50 border-gray-300/30'
                          : darkMode ? 'bg-gray-700/30 border-gray-600/50' : 'bg-gray-50/50 border-gray-200/50'
                      } backdrop-blur-sm p-6 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] group ${
                        isPast ? 'opacity-70' : ''
                      }`}
                    >
                      {isPast && (
                        <div className="flex items-center mb-3">
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-500 rounded-full text-xs font-medium border border-gray-400/30">
                            ✓ 완료된 일정
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4 px-1">
                        <div className="flex items-center flex-1 min-w-0">
                          <span className={`text-3xl mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${
                            isPast ? 'grayscale' : ''
                          }`}>
                            {event.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm inline-flex items-center ${
                                isPast 
                                  ? 'bg-gray-400/20 text-gray-500 border-gray-400/30'
                                  : getCategoryColor(event.category)
                              }`}
                            >
                              {getCategoryIcon(event.category)}
                              <span className="ml-2">{event.category}</span>
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm flex-shrink-0 ml-3 ${
                            isPast 
                              ? 'bg-gray-400/20 text-gray-500 border-gray-400/30'
                              : getPriorityColor(event.priority)
                          }`}
                        >
                          {event.priority}
                        </span>
                      </div>
                      
                      <h3 className={`text-lg font-bold mb-3 px-1 group-hover:text-blue-600 transition-colors duration-300 ${
                        isPast ? 'text-gray-500 line-through' : ''
                      }`}>
                        {event.title}
                      </h3>
                      <p className={`text-sm mb-4 px-1 line-clamp-2 leading-relaxed ${
                        isPast ? 'opacity-50' : 'opacity-75'
                      }`}>{event.description}</p>
                      
                      <div className="flex items-center justify-between text-sm px-1">
                        <div className={`flex items-center ${isPast ? 'opacity-40' : 'opacity-60'}`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString('ko-KR')}
                            {event.endDate && ` ~ ${new Date(event.endDate).toLocaleDateString('ko-KR')}`}
                          </span>
                        </div>
                        {event.daysLeft !== undefined && !isPast && (
                          <div
                            className={`font-medium ${
                              event.daysLeft <= 7
                                ? "text-red-600"
                                : event.daysLeft <= 30
                                  ? "text-orange-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {event.daysLeft > 0 ? `${event.daysLeft}일 남음` : "진행중"}
                          </div>
                        )}
                        {isPast && (
                          <div className="font-medium text-gray-500">
                            완료됨
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => toggleNotification(event.id, event.title)}
                        className={`w-full mt-4 py-2 px-4 ${
                          isPast 
                            ? 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02]'
                        } rounded-xl hover:shadow-lg transition-all duration-300 ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading || isPast}
                      >
                        {isPast ? "완료된 일정" : isLoading ? "설정 중..." : notificationSettings.has(event.id) ? "알림 해제" : "알림 설정"}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <CalendarView />
            )}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-24 h-24 mx-auto mb-4 opacity-30">
                  <Calendar className="w-full h-full" />
                </div>
                <p className="text-lg opacity-60">
                  {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : "선택한 카테고리에 해당하는 일정이 없습니다."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 통계 모달 */}
        {modalType && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalType(null)
            }}
          >
            <div 
              className={`${cardClasses} rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto mx-4`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  {modalType === 'all' && <><Calendar className="w-6 h-6 mr-3 text-blue-600" /> 전체 일정</>}
                  {modalType === 'upcoming' && <><Clock className="w-6 h-6 mr-3 text-orange-600" /> 임박한 일정</>}
                  {modalType === 'notifications' && <><Bell className="w-6 h-6 mr-3 text-green-600" /> 알림 설정된 일정</>}
                  {modalType === 'important' && <><Star className="w-6 h-6 mr-3 text-purple-600" /> 중요 일정</>}
                  <span className="ml-3 text-sm font-normal opacity-60">
                    ({statsData[modalType].length}개)
                  </span>
                </h2>
                <button
                  onClick={() => setModalType(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  aria-label="모달 닫기"
                >
                  ✕
                </button>
              </div>

              {statsData[modalType].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                  {statsData[modalType].map((event) => {
                    const isPast = isPastEvent(event)
                    return (
                      <div
                        key={event.id}
                        className={`${
                          isPast 
                            ? darkMode ? 'bg-gray-800/20 border-gray-700/30' : 'bg-gray-100/50 border-gray-300/30'
                            : darkMode ? 'bg-gray-700/30 border-gray-600/50' : 'bg-gray-50/50 border-gray-200/50'
                        } backdrop-blur-sm p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                          isPast ? 'opacity-70' : ''
                        }`}
                      >
                        {isPast && (
                          <div className="flex items-center mb-2">
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-500 rounded-lg text-xs font-medium border border-gray-400/30">
                              ✓ 완료
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3 px-1">
                          <div className="flex items-center flex-1 min-w-0">
                            <span className={`text-2xl mr-4 flex-shrink-0 ${isPast ? 'grayscale' : ''}`}>
                              {event.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                  isPast 
                                    ? 'bg-gray-400/20 text-gray-500 border-gray-400/30'
                                    : getCategoryColor(event.category)
                                }`}
                              >
                                {event.category}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex-shrink-0 ml-3 ${
                              isPast 
                                ? 'bg-gray-400/20 text-gray-500 border-gray-400/30'
                                : getPriorityColor(event.priority)
                            }`}
                          >
                            {event.priority}
                          </span>
                        </div>
                        
                        <h3 className={`text-lg font-semibold mb-2 px-1 ${
                          isPast ? 'text-gray-500 line-through' : ''
                        }`}>
                          {event.title}
                        </h3>
                        <p className={`text-sm mb-3 px-1 leading-relaxed ${
                          isPast ? 'opacity-50' : 'opacity-75'
                        }`}>{event.description}</p>
                        
                        <div className="flex items-center justify-between text-sm px-1">
                          <div className={`flex items-center ${isPast ? 'opacity-40' : 'opacity-60'}`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString('ko-KR')}
                              {event.endDate && ` ~ ${new Date(event.endDate).toLocaleDateString('ko-KR')}`}
                            </span>
                          </div>
                          {event.daysLeft !== undefined && !isPast && (
                            <div
                              className={`font-medium ${
                                event.daysLeft <= 7
                                  ? "text-red-600"
                                  : event.daysLeft <= 30
                                    ? "text-orange-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {event.daysLeft > 0 ? `${event.daysLeft}일 남음` : "진행중"}
                            </div>
                          )}
                          {isPast && (
                            <div className="font-medium text-gray-500">
                              완료됨
                            </div>
                          )}
                        </div>

                        {modalType === 'notifications' && (
                          <button 
                            onClick={() => toggleNotification(event.id, event.title)}
                            className={`w-full mt-3 py-2 px-4 ${
                              isPast 
                                ? 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                            } rounded-lg hover:shadow-lg transition-all duration-300 text-sm ${
                              isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isLoading || isPast}
                          >
                            {isPast ? "완료된 일정" : isLoading ? "해제 중..." : "알림 해제"}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 opacity-30">
                    {modalType === 'all' && <Calendar className="w-full h-full" />}
                    {modalType === 'upcoming' && <Clock className="w-full h-full" />}
                    {modalType === 'notifications' && <Bell className="w-full h-full" />}
                    {modalType === 'important' && <Star className="w-full h-full" />}
                  </div>
                  <p className="text-lg opacity-60">
                    {modalType === 'all' && "등록된 일정이 없습니다."}
                    {modalType === 'upcoming' && "임박한 일정이 없습니다."}
                    {modalType === 'notifications' && "알림 설정된 일정이 없습니다."}
                    {modalType === 'important' && "중요 일정이 없습니다."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
