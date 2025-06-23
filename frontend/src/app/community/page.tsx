"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  MessageSquare,
  Users,
  Hash,
  MessageCircle,
  Share,
  Trash2,
  Plus,

  TrendingUp,
  FlameIcon as Fire,
  Heart,
  Send,
  ImageIcon,
  Smile,
  MoreHorizontal,
  Search,
  Bell,
  Bookmark,
  X,

} from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import {
  fetchPosts,
  createPost,
  deletePost,
  fetchUserLikedPostIds,
  likePost,
  unlikePost,
  fetchComments,
  createComment,
  deleteComment,
} from "@/lib/community"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

interface Post {
  id: number
  author_id: string
  author_username: string
  content: string
  tags: string[]
  likes: number
  created_at: string
}

interface Comment {
  id: number
  post_id: number
  author_id: string
  author_username: string
  content: string
  created_at: string
}

export default function CommunityPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "popular" | "following">("all")
  const [newPost, setNewPost] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string>("")
  const [likedPostIds, setLikedPostIds] = useState<number[]>([])
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<number[]>([])
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<number, string>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isPullRefreshing, setIsPullRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'like' | 'comment' | 'new_post'
    message: string
    timestamp: Date
    read: boolean
  }>>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 트렌딩 토픽 데이터 메모이제이션
  const trendingTopics = useMemo(
    () => [
      { tag: "webdev", posts: 2345, trend: "up", color: "from-blue-400 to-cyan-400", emoji: "💻" },
      { tag: "react", posts: 1890, trend: "up", color: "from-purple-400 to-pink-400", emoji: "⚛️" },
      { tag: "typescript", posts: 1567, trend: "stable", color: "from-indigo-400 to-blue-400", emoji: "📘" },
      { tag: "nextjs", posts: 1234, trend: "up", color: "from-green-400 to-emerald-400", emoji: "🚀" },
      { tag: "javascript", posts: 987, trend: "down", color: "from-yellow-400 to-orange-400", emoji: "⚡" },
    ],
    [],
  )

  const communityRules = useMemo(
    () => [
      { icon: "🤝", title: "서로 존중하는 언어 사용", desc: "모든 구성원을 배려하는 대화" },
      { icon: "🚫", title: "스팸 및 광고 금지", desc: "주제와 관련 없는 홍보 금지" },
      { icon: "💡", title: "건설적인 토론 문화", desc: "지식 공유와 학습을 위한 소통" },
      { icon: "🔒", title: "개인정보 보호", desc: "타인의 프라이버시 존중" },
    ],
    [],
  )



  // 알림 패널 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showNotifications && !target.closest('[data-notification-panel]') && !target.closest('[data-notification-button]')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])



  // 알림 추가 함수
  const addNotification = useCallback((type: 'like' | 'comment' | 'new_post', message: string) => {
    const newNotification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)) // 최대 10개
    setUnreadCount(prev => prev + 1)
    
    // 3초 후 자동으로 읽음 처리
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === newNotification.id ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }, 3000)
  }, [])

  // WebSocket 시뮬레이션 (실제 환경에서는 실제 WebSocket 사용)
  useEffect(() => {
    if (!user) return

    const simulateRealTimeEvents = () => {
      const events = [
        () => addNotification('like', '누군가가 당신의 게시글에 좋아요를 눌렀습니다! ❤️'),
        () => addNotification('comment', '새로운 댓글이 달렸습니다! 💬'),
        () => addNotification('new_post', '팔로우한 사용자가 새 글을 작성했습니다! 📝'),
      ]
      
      // 랜덤한 시간 간격으로 알림 생성 (10-30초)
      const randomDelay = Math.random() * 20000 + 10000
      const timeout = setTimeout(() => {
        const randomEvent = events[Math.floor(Math.random() * events.length)]
        randomEvent()
        simulateRealTimeEvents() // 재귀적으로 계속 실행
      }, randomDelay)

      return timeout
    }

    const timeout = simulateRealTimeEvents()
    return () => clearTimeout(timeout)
  }, [user, addNotification])

  // 알림 패널 토글
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev)
    if (!showNotifications) {
      // 알림 패널 열 때 모든 알림을 읽음 처리
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
      setUnreadCount(0)
    }
  }, [showNotifications])

  // 북마크 토글 함수
  const handleBookmark = useCallback((postId: number) => {
    setBookmarkedPostIds(prev => {
      const newBookmarks = prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
      
      // 로컬스토리지에 저장
      localStorage.setItem('bookmarkedPosts', JSON.stringify(newBookmarks))
      
      return newBookmarks
    })
  }, [])

  // 북마크 데이터 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bookmarkedPosts')
      if (saved) {
        setBookmarkedPostIds(JSON.parse(saved))
      }
    } catch (error) {
      console.error('북마크 로드 실패:', error)
    }
  }, [])

  // 댓글 토글 함수
  const toggleComments = useCallback((postId: number) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }, [])

  // 인증 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth/login")
          return
        }
        setUser(session.user)

        const { data, error } = await supabase.from("profiles").select("nickname").eq("id", session.user.id).single()

        if (!error && data) {
          setUsername(data.nickname)
        } else {
          setUsername(session.user.email?.split("@")[0] || "사용자")
        }

        const liked = await fetchUserLikedPostIds(session.user.id)
        setLikedPostIds(liked)
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }

    checkAuth()
    loadPosts()
  }, [router])

  // 게시글 로드
  const loadPosts = useCallback(async (isInitial = true) => {
    if (isInitial) {
      setIsLoading(true)
      setPage(1)
    } else {
      setIsLoadingMore(true)
    }
    
    try {
      const data = await fetchPosts()
      
      if (isInitial) {
        setPosts(data)
      } else {
        // 실제로는 페이지네이션 API가 필요하지만, 현재는 시뮬레이션
        setPosts(prev => [...prev, ...data.slice(prev.length, prev.length + 5)])
      }

      // 댓글 로드 최적화
      const commentsData: Record<number, Comment[]> = {}
      await Promise.all(
        data.map(async (post) => {
          try {
            const postComments = await fetchComments(post.id)
            commentsData[post.id] = postComments
          } catch (error) {
            console.error(`Failed to fetch comments for post ${post.id}:`, error)
            commentsData[post.id] = []
          }
        }),
      )
      setComments(prev => ({ ...prev, ...commentsData }))
      
      // 댓글 숨김 상태 초기화 (기본적으로 모든 댓글 숨김)
      const initialCommentState: Record<number, boolean> = {}
      data.forEach(post => {
        initialCommentState[post.id] = false
      })
      setShowComments(prev => ({ ...prev, ...initialCommentState }))
      
      // 더 로드할 데이터가 있는지 확인 (실제로는 API 응답에서 확인)
      if (data.length < 10) {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Pull-to-Refresh 함수
  const handlePullRefresh = useCallback(async () => {
    setIsPullRefreshing(true)
    try {
      await loadPosts(true)
    } finally {
      setIsPullRefreshing(false)
      setPullDistance(0)
    }
  }, [loadPosts])

  // 터치 이벤트 핸들러들
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && startY > 0) {
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - startY)
      
      if (distance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance * 0.5, 100)) // 최대 100px
      }
    }
  }, [startY])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60 && !isPullRefreshing) {
      handlePullRefresh()
    } else {
      setPullDistance(0)
    }
    setStartY(0)
  }, [pullDistance, isPullRefreshing, handlePullRefresh])

  // 터치 이벤트 리스너 등록
  useEffect(() => {
    const element = document.body
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // 무한 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !isLoadingMore &&
        !isLoading
      ) {
        setPage(prev => prev + 1)
        loadPosts(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoadingMore, isLoading, loadPosts])

  // 게시글 생성
  const handleCreatePost = useCallback(async () => {
    if (!newPost.trim() || !user || isCreatingPost) return

    setIsCreatingPost(true)
    try {
      await createPost({
        author_id: user.id,
        author_username: username,
        content: newPost.trim(),
        tags: [],
      })
      setNewPost("")
      setShowNewPostForm(false)
      await loadPosts()
    } catch (error) {
      console.error("Failed to create post:", error)
      alert("게시글 등록에 실패했습니다.")
    } finally {
      setIsCreatingPost(false)
    }
  }, [newPost, user, username, isCreatingPost, loadPosts])

  // 게시글 삭제
  const handleDeletePost = useCallback(
    async (id: number) => {
      if (!user) return
      if (!window.confirm("정말 삭제하시겠습니까?")) return

      try {
        await deletePost(id, user.id)
        await loadPosts()
      } catch (error) {
        console.error("Failed to delete post:", error)
        alert("게시글 삭제에 실패했습니다.")
      }
    },
    [user, loadPosts],
  )

  // 좋아요 토글
  const handleLike = useCallback(
    async (postId: number) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      try {
        if (likedPostIds.includes(postId)) {
          await unlikePost(postId, user.id)
          setLikedPostIds((prev) => prev.filter((id) => id !== postId))
        } else {
          await likePost(postId, user.id)
          setLikedPostIds((prev) => [...prev, postId])
        }
        await loadPosts()
      } catch (error) {
        console.error("Failed to toggle like:", error)
        alert("좋아요 처리에 실패했습니다.")
      }
    },
    [user, likedPostIds, loadPosts],
  )

  // 댓글 추가
  const handleAddComment = useCallback(
    async (postId: number) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      const content = newComment[postId]?.trim()
      if (!content) return

      try {
        await createComment({
          post_id: postId,
          author_id: user.id,
          author_username: username,
          content,
        })
        setNewComment((prev) => ({ ...prev, [postId]: "" }))

        const postComments = await fetchComments(postId)
        setComments((prev) => ({ ...prev, [postId]: postComments }))
        await loadPosts()
      } catch (error) {
        console.error("Failed to add comment:", error)
        alert("댓글 등록에 실패했습니다.")
      }
    },
    [user, username, newComment, loadPosts],
  )

  // 댓글 삭제
  const handleDeleteComment = useCallback(
    async (commentId: number, postId: number) => {
      if (!user) return

      try {
        await deleteComment(commentId, user.id)
        const postComments = await fetchComments(postId)
        setComments((prev) => ({ ...prev, [postId]: postComments }))
        await loadPosts()
      } catch (error) {
        console.error("Failed to delete comment:", error)
        alert("댓글 삭제에 실패했습니다.")
      }
    },
    [user, loadPosts],
  )

  // 필터링된 게시글 - 인기글 로직 추가
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((post) => 
      searchQuery ? post.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
    )

    // 탭에 따른 정렬
    if (activeTab === "popular") {
      // 인기글: 일단 간단히 좋아요 수로만 정렬 (테스트)
      filtered = filtered.sort((a, b) => {
        return b.likes - a.likes
      })
        } else if (activeTab === "following") {
      // 좋아요: 내가 좋아요 누른 게시글만 표시
      filtered = filtered.filter(post => likedPostIds.includes(post.id))
      // 최신순으로 정렬
      filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else {
        // 전체: 최신순
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }

    return filtered
  }, [posts, searchQuery, activeTab, comments])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* 배경 장식 요소들 - 성능 최적화 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="flex relative z-10">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* 메인 컨텐츠 영역 - 레이아웃 개선 */}
        <div className={`flex-1 transition-all duration-300 ease-out ${sidebarOpen ? "md:ml-[280px]" : "ml-0"}`}>
          {/* Pull-to-Refresh 인디케이터 */}
          <div 
            className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateY(${pullDistance - 60}px)`,
              opacity: pullDistance > 20 ? 1 : 0
            }}
          >
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-b-2xl px-6 py-3 shadow-lg">
              {isPullRefreshing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-200 dark:border-blue-300 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">새로고침 중...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`transition-transform duration-200 ${pullDistance > 60 ? 'rotate-180' : ''} text-slate-600 dark:text-slate-300`}>
                    ↓
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {pullDistance > 60 ? '놓아서 새로고침' : '아래로 당겨서 새로고침'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 개선된 헤더 - 모바일 중앙 정렬 */}
          <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-700/20 shadow-lg shadow-black/5 dark:shadow-black/20 transition-colors duration-300">
            <div className="py-3 px-4 md:px-6">
              {/* 모바일: 중앙 정렬, 데스크톱: 양쪽 정렬 + 중앙 제목 */}
              <div className="flex items-center justify-between relative">
                {/* 왼쪽: 햄버거 메뉴 (모바일에서만) */}
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200"
                  >
                    <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                      <div className="w-full h-0.5 bg-slate-600 dark:bg-slate-400"></div>
                      <div className="w-full h-0.5 bg-slate-600 dark:bg-slate-400"></div>
                      <div className="w-full h-0.5 bg-slate-600 dark:bg-slate-400"></div>
                    </div>
                  </button>
                </div>

                {/* 중앙: 제목 (PC에서 절대 중앙, 모바일에서도 중앙) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-3">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-slate-100 dark:bg-slate-700 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-200/50 dark:border-slate-600/50">
                    <MessageSquare className="w-4 md:w-5 h-4 md:h-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent whitespace-nowrap">
                    대학생 커뮤니티
                  </h1>
                </div>



                {/* 헤더 액션 버튼들 */}
                <div className="flex items-center gap-2">

                  {/* 데스크톱 검색바 및 액션 버튼들 */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <input
                        type="text"
                        placeholder="게시글 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-600/80 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 shadow-lg transition-all duration-300"
                      />
                    </div>
                    {/* 알림 버튼 */}
                    <button 
                      onClick={toggleNotifications}
                      data-notification-button
                      className="relative p-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200"
                    >
                      <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                      )}
                    </button>

                  </div>

                  {/* 모바일 액션 버튼들 */}
                  <div className="md:hidden flex items-center gap-2">
                    {/* 모바일 검색 토글 */}
                    <button
                      onClick={() => setShowMobileSearch(!showMobileSearch)}
                      className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-600/60 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/50 shadow-md transition-all duration-200"
                    >
                      <Search className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                    

                  </div>
                </div>
              </div>

              {/* 모바일 검색바 */}
              {showMobileSearch && (
                <div className="md:hidden mt-3 animate-in slide-in-from-top duration-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <input
                      type="text"
                      placeholder="게시글 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 py-3 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-600/80 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 shadow-xl transition-all duration-300"
                    />
                                          <button
                        onClick={() => setShowMobileSearch(false)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* 알림 패널 */}
          {showNotifications && (
            <div className="absolute top-20 right-4 md:right-6 z-50 w-80 max-w-[calc(100vw-2rem)] animate-in slide-in-from-top duration-200" data-notification-panel>
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-600/20 overflow-hidden">
                {/* 헤더 */}
                <div className="px-4 py-3 border-b border-slate-200/20 dark:border-slate-600/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">알림</h3>
                    <button
                      onClick={toggleNotifications}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* 알림 목록 */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">새로운 알림이 없습니다</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-l-4 ${
                            notification.read 
                              ? 'border-transparent' 
                              : notification.type === 'like' 
                                ? 'border-red-400' 
                                : notification.type === 'comment'
                                  ? 'border-blue-400'
                                  : 'border-green-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'like' 
                                ? 'bg-red-100 dark:bg-red-900/30' 
                                : notification.type === 'comment'
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : 'bg-green-100 dark:bg-green-900/30'
                            }`}>
                              {notification.type === 'like' && <Heart className="w-4 h-4 text-red-500" />}
                              {notification.type === 'comment' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                              {notification.type === 'new_post' && <Plus className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {notification.timestamp.toLocaleString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 푸터 */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-200/20 dark:border-slate-600/20 bg-slate-50/50 dark:bg-slate-800/50">
                    <button 
                      onClick={() => {
                        setNotifications([])
                        setUnreadCount(0)
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      모든 알림 지우기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex">
            {/* 메인 컨텐츠 - 개선된 레이아웃 */}
            <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
              {/* Material Design 3 세그먼트 컨트롤 */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 mb-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* 스프링 애니메이션이 적용된 세그먼트 컨트롤 */}
                  <div className="relative bg-slate-100 dark:bg-slate-700 rounded-full p-1 w-full md:w-auto">
                    {/* 활성 탭 배경 애니메이션 */}
                    <div 
                      className="absolute top-1 h-[calc(100%-8px)] bg-white dark:bg-slate-600 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        left: activeTab === "all" ? "4px" : activeTab === "popular" ? "calc(33.333% + 1px)" : "calc(66.666% - 2px)",
                        width: "calc(33.333% - 2px)"
                      }}
                    />
                    
                    <nav className="relative flex w-full md:w-auto">
                      {(["all", "popular", "following"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 md:flex-none px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center gap-2 relative z-10 ${
                            activeTab === tab
                              ? "text-slate-900 dark:text-slate-100"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          <div className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                            activeTab === tab ? "scale-110" : "scale-100"
                          }`}>
                            {tab === "all" && <span className={`text-xs font-bold ${activeTab === tab ? "text-blue-600" : ""}`}>All</span>}
                            {tab === "popular" && <Fire className={`w-4 h-4 ${activeTab === tab ? "text-orange-500" : ""}`} />}
                            {tab === "following" && <Heart className={`w-4 h-4 ${activeTab === tab ? "text-red-500" : ""}`} />}
                          </div>
                          <span className="hidden sm:inline">
                            {tab === "all" && "모든글"}
                            {tab === "popular" && "인기"}
                            {tab === "following" && "좋아요"}
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>


                </div>
              </div>



              {/* 게시글 목록 - 개선된 스켈레톤 로딩 */}
              <div className="space-y-6">
                {isLoading ? (
                  // 스켈레톤 로딩 UI
                  <div className="space-y-6">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl shadow-black/5 border border-white/20 p-6 md:p-8 animate-pulse">
                        {/* 게시글 헤더 스켈레톤 */}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 bg-slate-200 rounded-2xl flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <div className="h-5 bg-slate-200 rounded-lg w-32 mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded-lg w-48"></div>
                          </div>
                          <div className="w-8 h-8 bg-slate-100 rounded-xl"></div>
                        </div>
                        
                        {/* 게시글 내용 스켈레톤 */}
                        <div className="mb-6 space-y-3">
                          <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                          <div className="h-4 bg-slate-200 rounded-lg w-4/5"></div>
                          <div className="h-4 bg-slate-200 rounded-lg w-3/5"></div>
                        </div>
                        
                        {/* 태그 스켈레톤 */}
                        <div className="flex gap-2 mb-6">
                          <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                          <div className="h-6 bg-slate-100 rounded-full w-20"></div>
                        </div>
                        
                        {/* 액션 버튼 스켈레톤 */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4">
                            <div className="h-8 bg-slate-100 rounded-xl w-16"></div>
                            <div className="h-8 bg-slate-100 rounded-xl w-16"></div>
                            <div className="h-8 bg-slate-100 rounded-xl w-16"></div>
                          </div>
                          <div className="h-8 bg-slate-100 rounded-xl w-8"></div>
                        </div>
                      </div>
                    ))}
                    
                    {/* 로딩 인디케이터 */}
                    <div className="text-center py-8">
                      <div className="relative mx-auto w-8 h-8">
                        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-3 text-slate-500 text-sm">게시글을 불러오는 중...</p>
                    </div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-12 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {searchQuery ? "검색 결과가 없습니다" : "아직 게시글이 없습니다"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {searchQuery ? "다른 키워드로 검색해보세요" : "첫 번째 게시글을 작성해보세요!"}
                    </p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group"
                    >
                      {/* 게시글 헤더 - 개선된 레이아웃 */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                              <span className="text-white font-bold text-lg">
                                {post.author_username[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base sm:text-lg truncate">{post.author_username}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>
                              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full"></span>
                              <span>공개</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {user && user.id === post.author_id && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 rounded-xl bg-white/60 hover:bg-white/80 text-slate-600 hover:text-slate-800 transition-all duration-200 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 게시글 내용 */}
                      <div className="mb-4 sm:mb-6">
                        <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap break-words">
                          {post.content}
                        </p>
                      </div>

                      {/* 태그 */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 mb-6 flex-wrap">
                          {post.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm rounded-full border border-blue-200/50 hover:from-blue-200 hover:to-purple-200 transition-all duration-200 cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 액션 버튼 - Material Design 3 스타일 */}
                      <div className="flex items-center justify-between mb-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1">
                          <button
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200 ${
                              likedPostIds.includes(post.id)
                                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className={`w-4 h-4 ${likedPostIds.includes(post.id) ? "fill-current" : ""}`} />
                            <span className="font-medium">{post.likes}</span>
                          </button>
                          <button 
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200 ${
                              showComments[post.id] 
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                            onClick={() => toggleComments(post.id)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">{comments[post.id]?.length ?? 0}</span>
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
                            <Share className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          className={`p-2 rounded-full transition-all duration-200 ${
                            bookmarkedPostIds.includes(post.id)
                              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                          onClick={() => handleBookmark(post.id)}
                          title={bookmarkedPostIds.includes(post.id) ? "북마크 제거" : "북마크 추가"}
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarkedPostIds.includes(post.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* 댓글 섹션 - 애니메이션이 적용된 UI */}
                      <div className={`space-y-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
                        showComments[post.id] 
                          ? "max-h-screen opacity-100 transform translate-y-0" 
                          : "max-h-0 opacity-0 transform -translate-y-4"
                      }`}>
                        {(comments[post.id] || []).map((comment: Comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-xs">
                                {comment.author_username[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">
                                  {comment.author_username}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(comment.created_at).toLocaleString("ko-KR")}
                                  </span>
                                  {user && user.id === comment.author_id && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                      className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                      title="댓글 삭제"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 text-sm break-words">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* 댓글 작성 - Material Design 3 스타일 */}
                        {user && (
                          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-xs">{username[0]?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                className="flex-1 px-4 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                type="text"
                                placeholder="댓글 추가..."
                                value={newComment[post.id] || ""}
                                onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddComment(post.id)
                                }}
                              />
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium flex-shrink-0"
                                onClick={() => handleAddComment(post.id)}
                              >
                                등록
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                )}
                
                {/* 무한 스크롤 로딩 인디케이터 */}
                {isLoadingMore && (
                  <div className="text-center py-8">
                    <div className="relative mx-auto w-8 h-8">
                      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-3 text-slate-500 text-sm">더 많은 게시글을 불러오는 중...</p>
                  </div>
                )}
                
                {/* 모든 게시글을 불러왔을 때 */}
                {!hasMore && filteredPosts.length > 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">모든 게시글을 확인했습니다! 🎉</p>
                  </div>
                )}
              </div>
            </main>

            {/* 오른쪽 사이드바 - 개선된 반응형 */}
            <aside className="hidden xl:block w-80 p-6 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* 트렌딩 토픽 - 개선된 디자인 */}
                <section className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl shadow-black/5 border border-white/20 p-6">
                  <h2 className="text-lg font-bold mb-6 flex items-center text-slate-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                      <Hash className="w-4 h-4 text-white" />
                    </div>
                    트렌딩 토픽
                  </h2>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={topic.tag}
                        className="group p-4 hover:bg-white/60 rounded-2xl transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-black/5"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{topic.emoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">#{topic.tag}</span>
                                {topic.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                                {topic.trend === "down" && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                              </div>
                              <div className="text-xs text-slate-400">
                                {index === 0 && "🔥 급상승 중"}
                                {index === 1 && "⭐ 인기 급상승"}
                                {index === 2 && "💎 꾸준한 인기"}
                                {index === 3 && "🚀 새로운 트렌드"}
                                {index === 4 && "📈 관심 증가"}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500 font-medium">{topic.posts.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 커뮤니티 규칙 - 개선된 디자인 */}
                <section className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-3xl shadow-xl shadow-black/5 border border-white/20 p-6">
                  <h2 className="text-lg font-bold mb-6 flex items-center text-slate-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    커뮤니티 규칙
                  </h2>
                  <ul className="space-y-4 text-sm text-slate-700">
                    {communityRules.map((rule, index) => (
                      <li
                        key={index}
                        className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">{rule.icon}</span>
                          <div>
                            <div className="font-semibold text-slate-800 mb-1">{rule.title}</div>
                            <div className="text-xs text-slate-600">{rule.desc}</div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </aside>
          </div>
        </div>

        {/* 모바일용 플로팅 액션 버튼 */}
        {user && (
          <button
            onClick={() => setShowNewPostModal(true)}
            className="md:hidden fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-105 active:scale-95 z-50 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}



        {/* 새 글 작성 모달 */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">새 글 작성</h2>
                <button
                  onClick={() => {
                    setShowNewPostModal(false)
                    setNewPost("")
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">{username[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{username}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">공개 게시</p>
                  </div>
                </div>

                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="무슨 일이 일어나고 있나요?"
                  className="w-full h-40 p-4 border border-slate-200 dark:border-slate-600 rounded-2xl resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  autoFocus
                />

                {/* 모달 액션 버튼들 */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={async () => {
                      await handleCreatePost()
                      setShowNewPostModal(false)
                    }}
                    disabled={!newPost.trim() || isCreatingPost}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {isCreatingPost ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        게시 중...
                      </div>
                    ) : (
                      "게시하기"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
