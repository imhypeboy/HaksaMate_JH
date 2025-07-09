"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Bell, Clock, AlertTriangle, Filter, Star, GraduationCap, BookOpen, PartyPopper, Users, MapPin, Search, Sun, Moon } from "lucide-react"
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

export default function AcademicCalendarPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  const [showNotifications, setShowNotifications] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")

  // 2025-2026년 최신 학사 일정 데이터
  const academicEvents: AcademicEvent[] = [
    // 2025년 7월
    {
      id: 1,
      title: "계절학기 성적입력",
      description: "하계 계절학기 성적 입력 기간입니다.",
      startDate: "2025-07-10",
      endDate: "2025-07-15",
      category: "성적",
      priority: "보통",
      daysLeft: 180,
      icon: "📝"
    },
    {
      id: 2,
      title: "계절학기 성적확인",
      description: "하계 계절학기 성적을 확인할 수 있습니다.",
      startDate: "2025-07-16",
      category: "성적",
      priority: "보통",
      daysLeft: 186,
      icon: "📊"
    },
    {
      id: 3,
      title: "졸업사정회",
      description: "졸업 요건 심사가 진행됩니다.",
      startDate: "2025-07-28",
      category: "졸업",
      priority: "높음",
      daysLeft: 198,
      icon: "🎓"
    },
    {
      id: 4,
      title: "예비수강신청",
      description: "다음 학기 예비 수강신청 기간입니다.",
      startDate: "2025-07-28",
      endDate: "2025-07-30",
      category: "수강신청",
      priority: "높음",
      daysLeft: 198,
      icon: "📚"
    },
    // 2025년 3월
    {
      id: 5,
      title: "삼일절",
      description: "3·1절 국경일입니다.",
      startDate: "2025-03-01",
      category: "공휴일",
      priority: "낮음",
      daysLeft: 60,
      icon: "🇰🇷"
    },
    {
      id: 6,
      title: "개강 / 입학식",
      description: "2025학년도 1학기 개강 및 입학식이 있습니다.",
      startDate: "2025-03-04",
      category: "개강",
      priority: "높음",
      daysLeft: 63,
      icon: "🏫"
    },
    {
      id: 7,
      title: "수강과목 중도포기",
      description: "수강 과목 중도포기 신청 기간입니다. (4주차)",
      startDate: "2025-03-25",
      endDate: "2025-03-27",
      category: "수강신청",
      priority: "보통",
      daysLeft: 84,
      icon: "❌"
    },
    // 2025년 4월
    {
      id: 8,
      title: "중간강의평가",
      description: "중간 강의평가 기간입니다. (7주차)",
      startDate: "2025-04-14",
      endDate: "2025-05-02",
      category: "기타",
      priority: "보통",
      daysLeft: 104,
      icon: "⭐"
    },
    {
      id: 9,
      title: "교직원 영성축제",
      description: "교직원 영성축제가 개최됩니다.",
      startDate: "2025-04-21",
      endDate: "2025-04-25",
      category: "축제",
      priority: "낮음",
      daysLeft: 111,
      icon: "🎉"
    },
    {
      id: 10,
      title: "중간고사",
      description: "1학기 중간고사 기간입니다. (8주차)",
      startDate: "2025-04-22",
      endDate: "2025-04-28",
      category: "시험",
      priority: "높음",
      daysLeft: 112,
      icon: "📝"
    },
    // 2025년 5월
    {
      id: 11,
      title: "근로자의 날",
      description: "근로자의 날 공휴일입니다.",
      startDate: "2025-05-01",
      category: "공휴일",
      priority: "낮음",
      daysLeft: 121,
      icon: "👷"
    },
    {
      id: 12,
      title: "학교현장 교육실습",
      description: "교육실습생 학교현장 실습 기간입니다.",
      startDate: "2025-05-07",
      endDate: "2025-05-30",
      category: "실습",
      priority: "높음",
      daysLeft: 127,
      icon: "🏫"
    },
    {
      id: 13,
      title: "사랑나눔축제",
      description: "대학 사랑나눔축제가 개최됩니다.",
      startDate: "2025-05-12",
      endDate: "2025-05-16",
      category: "축제",
      priority: "보통",
      daysLeft: 132,
      icon: "❤️"
    },
    {
      id: 14,
      title: "계절학기 수강신청",
      description: "하계 계절학기 수강신청 기간입니다.",
      startDate: "2025-05-26",
      endDate: "2025-05-28",
      category: "수강신청",
      priority: "보통",
      daysLeft: 146,
      icon: "📚"
    },
    // 2025년 6월
    {
      id: 15,
      title: "현충일",
      description: "현충일 국경일입니다.",
      startDate: "2025-06-06",
      category: "공휴일",
      priority: "낮음",
      daysLeft: 157,
      icon: "🇰🇷"
    },
    {
      id: 16,
      title: "기말고사",
      description: "1학기 기말고사 기간입니다. (15주차)",
      startDate: "2025-06-10",
      endDate: "2025-06-16",
      category: "시험",
      priority: "높음",
      daysLeft: 161,
      icon: "📝"
    },
    {
      id: 17,
      title: "성적입력기간",
      description: "교수님들의 성적 입력 기간입니다.",
      startDate: "2025-06-10",
      endDate: "2025-06-23",
      category: "성적",
      priority: "보통",
      daysLeft: 161,
      icon: "📊"
    },
    {
      id: 18,
      title: "하계계절학기",
      description: "여름 계절학기가 진행됩니다.",
      startDate: "2025-06-23",
      endDate: "2025-07-11",
      category: "개강",
      priority: "보통",
      daysLeft: 174,
      icon: "☀️"
    },
    // 2025년 8월
    {
      id: 19,
      title: "본수강신청",
      description: "2학기 본 수강신청 기간입니다.",
      startDate: "2025-08-04",
      endDate: "2025-08-06",
      category: "수강신청",
      priority: "높음",
      daysLeft: 215,
      icon: "📚"
    },
    {
      id: 20,
      title: "후기 학위수여식",
      description: "후기 졸업식이 진행됩니다.",
      startDate: "2025-08-14",
      category: "졸업",
      priority: "높음",
      daysLeft: 225,
      icon: "🎓"
    },
    {
      id: 21,
      title: "재학생 등록기간",
      description: "재학생 등록 기간입니다.",
      startDate: "2025-08-18",
      endDate: "2025-08-22",
      category: "등록",
      priority: "높음",
      daysLeft: 229,
      icon: "📋"
    },
    // 2025년 9월
    {
      id: 22,
      title: "2학기 개강",
      description: "2025학년도 2학기가 시작됩니다.",
      startDate: "2025-09-01",
      category: "개강",
      priority: "높음",
      daysLeft: 243,
      icon: "🏫"
    },
    {
      id: 23,
      title: "수강신청 확인 및 정정",
      description: "수강신청 확인 및 정정 기간입니다. (1주차)",
      startDate: "2025-09-01",
      endDate: "2025-09-05",
      category: "수강신청",
      priority: "높음",
      daysLeft: 243,
      icon: "✏️"
    },
    {
      id: 24,
      title: "천보축전",
      description: "대학 천보축전이 개최됩니다.",
      startDate: "2025-09-29",
      category: "축제",
      priority: "보통",
      daysLeft: 271,
      icon: "🎊"
    },
    {
      id: 25,
      title: "체육대회",
      description: "전교 체육대회가 열립니다.",
      startDate: "2025-09-30",
      category: "축제",
      priority: "보통",
      daysLeft: 272,
      icon: "🏃"
    }
  ]

  const categories = ["전체", "성적", "수강신청", "시험", "축제", "공휴일", "등록", "실습", "개강", "졸업", "기타"]

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

  // 다크모드 감지
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
  }, [])

  const getFilteredEvents = () => {
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
    
    return filtered.sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
  }

  const getUpcomingEvents = () => {
    return academicEvents
      .filter((event) => event.daysLeft && event.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
      .slice(0, 3)
  }

  const getPriorityColor = (priority: string) => {
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
  }

  const getCategoryColor = (category: string) => {
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
  }

  const getCategoryIcon = (category: string) => {
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
  }

  const filteredEvents = getFilteredEvents()
  const upcomingEvents = getUpcomingEvents()

  const themeClasses = darkMode 
    ? "bg-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900"

  const cardClasses = darkMode
    ? "bg-gray-800/50 backdrop-blur-md border-gray-700/50"
    : "bg-white/70 backdrop-blur-md border-white/50 shadow-xl shadow-blue-100/20"

  return (
    <div className={`flex min-h-screen transition-all duration-300 ${themeClasses}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 font-sans pb-12">
        {/* 헤더 */}
        <header className={`${cardClasses} py-6 px-4 flex justify-between items-center border-b sticky top-0 z-50`}>
          <div className="w-10"></div>
          <h1 className="text-2xl font-bold flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            학사 일정 알림
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl transition-all duration-300 ${
              darkMode 
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                : "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
          {/* 긴급 알림 - 글래스모피즘 디자인 */}
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
                      <p className="opacity-90 mb-4">다가오는 중요한 학사 일정을 확인하세요!</p>
                      <div className="grid gap-3">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">{event.icon}</span>
                                <div>
                                  <span className="font-semibold block">{event.title}</span>
                                  <span className="text-sm opacity-75">{event.description}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                                  {event.daysLeft}일 남음
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
                    className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 통계 카드 - 현대적인 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${cardClasses} p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl`}>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold opacity-70">전체 일정</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {academicEvents.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${cardClasses} p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl`}>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold opacity-70">임박한 일정</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {upcomingEvents.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${cardClasses} p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl`}>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Bell className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold opacity-70">알림 설정</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ON
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${cardClasses} p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl`}>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold opacity-70">중요 일정</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {academicEvents.filter(e => e.priority === "높음").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className={`${cardClasses} rounded-2xl p-6`}>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="일정 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                    darkMode 
                      ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400" 
                      : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 opacity-70" />
                  <select
                    className={`border rounded-xl px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                      darkMode 
                        ? "bg-gray-700/50 border-gray-600 text-gray-100" 
                        : "bg-white/50 border-gray-200 text-gray-900"
                    }`}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      viewMode === "grid" 
                        ? "bg-white dark:bg-gray-600 shadow-md" 
                        : "hover:bg-white/50 dark:hover:bg-gray-600/50"
                    }`}
                  >
                    격자
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      viewMode === "list" 
                        ? "bg-white dark:bg-gray-600 shadow-md" 
                        : "hover:bg-white/50 dark:hover:bg-gray-600/50"
                    }`}
                  >
                    목록
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 학사 일정 목록 */}
          <div className={`${cardClasses} rounded-2xl p-6`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-blue-600" />
              학사 일정
              <span className="ml-3 text-sm font-normal opacity-60">
                ({filteredEvents.length}개)
              </span>
            </h2>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'} backdrop-blur-sm p-6 rounded-2xl border ${darkMode ? 'border-gray-600/50' : 'border-gray-200/50'} hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3 group-hover:scale-110 transition-transform duration-300">
                          {event.icon}
                        </span>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(event.category)}`}
                          >
                            {getCategoryIcon(event.category)}
                            <span className="ml-1">{event.category}</span>
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getPriorityColor(event.priority)}`}
                      >
                        {event.priority}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {event.title}
                    </h3>
                    <p className="text-sm opacity-75 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center opacity-60">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString('ko-KR')}
                          {event.endDate && ` ~ ${new Date(event.endDate).toLocaleDateString('ko-KR')}`}
                        </span>
                      </div>
                      {event.daysLeft !== undefined && (
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
                    </div>
                    
                    <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02]">
                      알림 설정
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'} backdrop-blur-sm p-6 rounded-2xl border ${darkMode ? 'border-gray-600/50' : 'border-gray-200/50'} hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.01] group`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                            {event.icon}
                          </span>
                          <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors duration-300">
                            {event.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(event.category)}`}
                          >
                            {getCategoryIcon(event.category)}
                            <span className="ml-1">{event.category}</span>
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getPriorityColor(event.priority)}`}
                          >
                            {event.priority}
                          </span>
                        </div>
                        <p className="opacity-75 mb-3">{event.description}</p>
                        <div className="flex items-center text-sm opacity-60">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString('ko-KR')}
                            {event.endDate && ` ~ ${new Date(event.endDate).toLocaleDateString('ko-KR')}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        {event.daysLeft !== undefined && (
                          <div
                            className={`text-sm font-medium mb-3 ${
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
                        <button className="py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.05] text-sm">
                          알림 설정
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
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
      </div>
    </div>
  )
}
