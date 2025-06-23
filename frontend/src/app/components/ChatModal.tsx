"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { X, Send, Smile, User, ArrowLeft, MessageCircle, Search, MoreVertical } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'me' | 'other'
  timestamp: Date
  type: 'text' | 'emoji'
  isRead?: boolean
  readAt?: Date
}

interface ChatUser {
  id: number
  name: string
  nickname: string
  isOnline: boolean
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount?: number
  isTyping?: boolean
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  initialUserId?: number
  isDarkMode: boolean
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, initialUserId, isDarkMode }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUserId || null)
  const [messages, setMessages] = useState<Record<number, Message[]>>({
    1: [
      {
        id: 1,
        text: "안녕하세요! 매칭되어서 반가워요! 😊",
        sender: 'other',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        isRead: true,
        readAt: new Date(Date.now() - 299000)
      },
      {
        id: 2,
        text: "안녕하세요! 저도 반가워요!",
        sender: 'me',
        timestamp: new Date(Date.now() - 240000),
        type: 'text',
        isRead: true,
        readAt: new Date(Date.now() - 239000)
      }
    ],
    2: [
      {
        id: 1,
        text: "안녕하세요! 어떻게 지내세요?",
        sender: 'other',
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      }
    ],
    3: [
      {
        id: 1,
        text: "코딩 스터디 같이 해요!",
        sender: 'other',
        timestamp: new Date(Date.now() - 120000),
        type: 'text'
      }
    ]
  })
  
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 채팅 사용자 목록 - 메모이제이션으로 성능 최적화
  const chatUsers: ChatUser[] = useMemo(() => [
    {
      id: 1,
      name: '배고픈 춘식이',
      nickname: 'HHHLL',
      isOnline: true,
      lastMessage: '안녕하세요! 저도 반가워요!',
      lastMessageTime: new Date(Date.now() - 240000),
      unreadCount: 0
    },
    {
      id: 2,
      name: '행복한 라이언',
      nickname: 'HAPPY',
      isOnline: true,
      lastMessage: '안녕하세요! 어떻게 지내세요?',
      lastMessageTime: new Date(Date.now() - 180000),
      unreadCount: 2
    },
    {
      id: 3,
      name: '코딩하는 어피치',
      nickname: 'CODE_PEACH',
      isOnline: false,
      lastMessage: '코딩 스터디 같이 해요!',
      lastMessageTime: new Date(Date.now() - 120000),
      unreadCount: 1
    }
  ], [])

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 검색된 사용자 필터링 - 메모이제이션으로 성능 최적화
  const filteredUsers = useMemo(() => 
    chatUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    ), [chatUsers, searchTerm]
  )

  // 선택된 사용자 정보 메모이제이션
  const selectedUser = useMemo(() => 
    chatUsers.find(u => u.id === selectedUserId), 
    [chatUsers, selectedUserId]
  )

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (selectedUserId && messages[selectedUserId]) {
      scrollToBottom()
    }
  }, [messages, selectedUserId, scrollToBottom])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // 타이핑 시작 처리
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true)
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }, [isTyping])

  // 고유 ID 생성 (충돌 방지)
  const generateMessageId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // 메시지 전송
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedUserId) return
    
    const message: Message = {
      id: parseInt(generateMessageId().replace(/[^0-9]/g, '').substring(0, 10)),
      text: newMessage.trim(),
      sender: 'me',
      timestamp: new Date(),
      type: 'text',
      isRead: false
    }
    
    setMessages(prev => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] || []), message]
    }))
    setNewMessage('')
    setIsTyping(false)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // 상대방이 타이핑 중 표시
    setTypingUsers(prev => new Set([...prev, selectedUserId]))
    
    // 상대방 자동 응답
    setTimeout(() => {
      const responses = [
        "정말요? 재밌네요! 😄",
        "저도 그렇게 생각해요!",
        "오 대박! 👍",
        "그런가요? 신기하네요!",
        "ㅎㅎ 맞아요!",
        "좋은 생각이에요! ✨"
      ]
      
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(selectedUserId)
        return newSet
      })
      
      const autoReply: Message = {
        id: Date.now() + 1,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'other',
        timestamp: new Date(),
        type: 'text',
        isRead: true,
        readAt: new Date()
      }
      
      setMessages(prev => ({
        ...prev,
        [selectedUserId]: [...(prev[selectedUserId] || []), autoReply]
      }))
      
      // 내 메시지를 읽음으로 표시
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [selectedUserId]: prev[selectedUserId]?.map(msg => 
            msg.sender === 'me' && !msg.isRead 
              ? { ...msg, isRead: true, readAt: new Date() }
              : msg
          ) || []
        }))
      }, 500)
      
    }, 1000 + Math.random() * 2000)
  }, [newMessage, selectedUserId])

  // 엔터키로 전송
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatLastMessageTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  if (!isOpen) return null

  // 모바일 전용 모달
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]">
        <div className="fixed inset-0 bg-white dark:bg-gray-900">
          {!selectedUserId ? (
            // 모바일 채팅 목록
            <div className="h-full flex flex-col">
              {/* 헤더 */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  채팅 목록
                </h1>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* 검색창 */}
              <div className="p-4">
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="대화 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 border border-gray-600'
                        : 'bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-blue-500 border border-gray-200'
                    }`}
                  />
                </div>
              </div>

              {/* 사용자 목록 */}
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full p-0.5 ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-gray-600 to-gray-500' 
                            : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
                        }`}>
                          <div className={`w-full h-full rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                          }`}>
                            <User size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                          </div>
                        </div>
                        
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {user.name}
                          </h3>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.lastMessageTime && formatLastMessageTime(user.lastMessageTime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {typingUsers.has(user.id) ? (
                              <span className="italic text-blue-500">입력 중...</span>
                            ) : (
                              user.lastMessage
                            )}
                          </p>
                          {user.unreadCount && user.unreadCount > 0 && (
                            <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                              {user.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // 모바일 개별 채팅
            <div className="h-full flex flex-col">
              {/* 채팅 헤더 */}
              <div className={`flex items-center gap-3 p-4 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ArrowLeft size={18} />
                </button>
                
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full p-0.5 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-600 to-gray-500' 
                      : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
                  }`}>
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <User size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                    </div>
                  </div>
                  
                  {chatUsers.find(u => u.id === selectedUserId)?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {chatUsers.find(u => u.id === selectedUserId)?.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {chatUsers.find(u => u.id === selectedUserId)?.isOnline ? '온라인' : '오프라인'}
                  </p>
                </div>
                
                <button
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(messages[selectedUserId] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl shadow-lg ${
                      message.sender === 'me'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.sender === 'me' 
                            ? 'text-blue-100' 
                            : isDarkMode 
                              ? 'text-gray-400' 
                              : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                        
                        {message.sender === 'me' && (
                          <div className="flex items-center gap-1">
                            {message.isRead ? (
                              <span className="text-xs text-blue-200">✓✓</span>
                            ) : (
                              <span className="text-xs text-blue-300 opacity-60">✓</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 타이핑 인디케이터 */}
                {selectedUserId && typingUsers.has(selectedUserId) && (
                  <div className="flex justify-start">
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                      isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          {chatUsers.find(u => u.id === selectedUserId)?.name}가 입력 중
                        </span>
                        <div className="flex gap-1 ml-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTypingStart()
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="메시지를 입력하세요..."
                      rows={1}
                      className={`w-full px-4 py-3 pr-12 rounded-2xl resize-none transition-all duration-300 focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 border border-gray-600'
                          : 'bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-blue-500 border border-gray-200'
                      }`}
                      style={{ 
                        minHeight: '48px',
                        maxHeight: '120px'
                      }}
                    />
                    
                    <button
                      className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all duration-300 ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-300' 
                          : 'text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      <Smile size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      newMessage.trim()
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // PC 버전 (기존 레이아웃 개선)
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className={`w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 backdrop-blur-2xl border border-white/20' 
            : 'bg-white/95 backdrop-blur-2xl border border-white/60'
        }`}
        style={{ animation: 'zoomIn 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* PC 헤더 - 항상 고정 */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedUser ? (
                <>채팅 - {selectedUser.name}</>
              ) : (
                '채팅 목록'
              )}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } z-10`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-full">
          {/* PC 좌측 채팅 목록 */}
          <div className={`w-80 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
            
            {/* 검색창 */}
            <div className="p-4">
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="대화 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 border border-gray-600'
                      : 'bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-blue-500 border border-gray-200'
                  }`}
                />
              </div>
            </div>

            {/* 사용자 목록 - 접근성 개선 */}
            <div className="flex-1 overflow-y-auto" role="list">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedUserId(user.id)
                    }
                  }}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${user.name}과의 대화${user.unreadCount ? `, ${user.unreadCount}개의 읽지 않은 메시지` : ''}`}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedUserId === user.id
                      ? isDarkMode 
                        ? 'bg-gray-700 border-r-2 border-purple-500' 
                        : 'bg-blue-50 border-r-2 border-blue-500'
                      : isDarkMode
                        ? 'hover:bg-gray-700/50'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full p-0.5 ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-gray-600 to-gray-500' 
                          : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
                      }`}>
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                          <User size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                        </div>
                      </div>
                      
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {user.name}
                        </h3>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.lastMessageTime && formatLastMessageTime(user.lastMessageTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {typingUsers.has(user.id) ? (
                            <span className="italic text-blue-500">입력 중...</span>
                          ) : (
                            user.lastMessage
                          )}
                        </p>
                        {user.unreadCount && user.unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                            {user.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PC 우측 채팅 영역 */}
          <div className="flex-1 flex flex-col">
            {selectedUserId ? (
              <>

                {/* 메시지 영역 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4"
                  style={{ background: isDarkMode ? 'linear-gradient(to bottom, rgb(31, 41, 55), rgb(17, 24, 39))' : 'linear-gradient(to bottom, rgb(249, 250, 251), rgb(243, 244, 246))' }}
                >
                  {(messages[selectedUserId] || []).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
                        message.sender === 'me'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-100'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender === 'me' 
                              ? 'text-blue-100' 
                              : isDarkMode 
                                ? 'text-gray-400' 
                                : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                          
                          {message.sender === 'me' && (
                            <div className="flex items-center gap-1">
                              {message.isRead ? (
                                <span className="text-xs text-blue-200">✓✓</span>
                              ) : (
                                <span className="text-xs text-blue-300 opacity-60">✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 타이핑 인디케이터 */}
                  {selectedUserId && typingUsers.has(selectedUserId) && (
                    <div className="flex justify-start">
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">
                            {chatUsers.find(u => u.id === selectedUserId)?.name}가 입력 중
                          </span>
                          <div className="flex gap-1 ml-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div className={`p-4 border-t backdrop-blur-lg ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'}`}>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value)
                          handleTypingStart()
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        rows={1}
                        className={`w-full px-4 py-3 pr-12 rounded-2xl resize-none transition-all duration-300 focus:outline-none focus:ring-2 ${
                          isDarkMode
                            ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 border border-gray-600'
                            : 'bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-blue-500 border border-gray-200'
                        }`}
                        style={{ 
                          minHeight: '48px',
                          maxHeight: '120px'
                        }}
                      />
                      
                      <button
                        className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-500 hover:text-gray-600'
                        }`}
                      >
                        <Smile size={16} />
                      </button>
                    </div>
                    
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        newMessage.trim()
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-500'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // 채팅 선택 안했을 때 - 개선된 UI
              <div className="flex-1 flex items-center justify-center"
                style={{ background: isDarkMode ? 'linear-gradient(to bottom, rgb(31, 41, 55), rgb(17, 24, 39))' : 'linear-gradient(to bottom, rgb(249, 250, 251), rgb(243, 244, 246))' }}
              >
                <div className="text-center space-y-6 max-w-md">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10' 
                      : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200'
                  }`}>
                    <MessageCircle size={48} className={isDarkMode ? 'text-purple-400' : 'text-purple-500'} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      대화를 시작해보세요! 💬
                    </h3>
                    <p className={`text-base mt-3 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      왼쪽 목록에서 채팅하고 싶은<br />
                      상대를 선택해주세요
                    </p>
                  </div>
                  <div className={`flex items-center justify-center gap-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{chatUsers.filter(u => u.isOnline).length}명 온라인</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default ChatModal 