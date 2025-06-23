"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Send, Smile, Heart, User, MoreVertical } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'me' | 'other'
  timestamp: Date
  type: 'text' | 'emoji'
}

interface ChatUser {
  id: number
  name: string
  nickname: string
  isOnline: boolean
}

const ChatPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "안녕하세요! 매칭되어서 반가워요! 😊",
      sender: 'other',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: 2,
      text: "안녕하세요! 저도 반가워요!",
      sender: 'me',
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    },
    {
      id: 3,
      text: "어떤 취미를 가지고 계신가요?",
      sender: 'other',
      timestamp: new Date(Date.now() - 180000),
      type: 'text'
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 가짜 사용자 데이터 (실제로는 API에서 가져와야 함)
  const chatUser: ChatUser = {
    id: parseInt(userId),
    name: userId === '1' ? '배고픈 춘식이' : userId === '2' ? '행복한 라이언' : '코딩하는 어피치',
    nickname: userId === '1' ? 'HHHLL' : userId === '2' ? 'HAPPY' : 'CODE_PEACH',
    isOnline: true
  }

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 메시지 전송
  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return
    
    const message: Message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'me',
      timestamp: new Date(),
      type: 'text'
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // 상대방 자동 응답 (시뮬레이션)
    setTimeout(() => {
      const responses = [
        "정말요? 재밌네요! 😄",
        "저도 그렇게 생각해요!",
        "오 대박! 👍",
        "그런가요? 신기하네요!",
        "ㅎㅎ 맞아요!",
        "좋은 생각이에요! ✨"
      ]
      
      const autoReply: Message = {
        id: Date.now() + 1,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'other',
        timestamp: new Date(),
        type: 'text'
      }
      
      setMessages(prev => [...prev, autoReply])
    }, 1000 + Math.random() * 2000) // 1-3초 랜덤 딜레이
  }, [newMessage])

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

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            
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
                    <User size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </div>
                </div>
                
                {/* Online Status */}
                {chatUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {chatUser.name}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {chatUser.isOnline ? '온라인' : '오프라인'} • @{chatUser.nickname}
                </p>
              </div>
            </div>
          </div>
          
          <button
            className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
              message.sender === 'me'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'me' 
                  ? 'text-blue-100' 
                  : isDarkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`sticky bottom-0 backdrop-blur-md border-t p-4 ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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
              <Smile size={18} />
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
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage 