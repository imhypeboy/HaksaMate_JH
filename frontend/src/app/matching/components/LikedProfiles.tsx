"use client"

import React, { useState } from "react"
import { Star, User, Heart, MessageCircle, X } from "lucide-react"
import { useLikedProfiles } from "../hooks/useLikedProfiles"
import { useAuth } from "../../../hooks/useAuth"

interface LikedProfilesProps {
  isDarkMode: boolean
  onOpenChat?: (profileId: string) => void
}

const LikedProfiles = React.memo(({ isDarkMode, onOpenChat }: LikedProfilesProps) => {
  const { user } = useAuth()
  const { likedProfiles, isLoading, unlikeProfile } = useLikedProfiles(user?.id)
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null)

  const handleUnlike = async (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await unlikeProfile(profileId)
  }

  const handleChatClick = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("💬 채팅 버튼 클릭:", profileId)
    onOpenChat?.(profileId)
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-4">
        <div className="text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? "bg-yellow-500/20 text-yellow-300" : "bg-yellow-100 text-yellow-600"
            } animate-pulse`}
          >
            <Star size={28} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            좋아요한 프로필 로딩 중...
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* Material Design 3 Header */}
      <div className={`text-center mb-8 transition-all duration-500 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
        <div className="relative inline-block mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isDarkMode
                ? "bg-gradient-to-br from-yellow-400/20 to-orange-400/20"
                : "bg-gradient-to-br from-yellow-50 to-orange-50"
            } shadow-lg hover:shadow-xl hover:scale-105`}
          >
            <Star size={28} className="text-yellow-500 animate-pulse" />
          </div>

          {/* Material Design 3 Floating Elements */}
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <h3
          className={`text-lg font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          좋아요한 프로필
        </h3>
        <p className="text-sm">
          {likedProfiles.length > 0 ? `${likedProfiles.length}명과 연결되었어요` : "마음에 드는 사람들과 대화해보세요"}
        </p>
      </div>

      {/* Material Design 3 Profile Cards */}
      {likedProfiles.map((profile, index) => (
        <div
          key={profile.id}
          onMouseEnter={() => setHoveredProfile(profile.id)}
          onMouseLeave={() => setHoveredProfile(null)}
          className={`relative rounded-3xl p-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-lg hover:shadow-2xl`}
          style={{
            transform: `scale(${hoveredProfile === profile.id ? 1.02 : 1})`,
            animationDelay: `${index * 100}ms`,
          }}
        >
          {/* Material Design 3 Ripple Effect */}
          <div
            className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
              hoveredProfile === profile.id
                ? isDarkMode
                  ? "bg-white/5 opacity-100"
                  : "bg-gray-900/3 opacity-100"
                : "opacity-0"
            }`}
          />

          {/* Unlike Button */}
          <button
            onClick={(e) => handleUnlike(profile.id, e)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 ${
              hoveredProfile === profile.id ? "opacity-100" : ""
            } ${
              isDarkMode ? "bg-red-500/20 hover:bg-red-500/30 text-red-300" : "bg-red-50 hover:bg-red-100 text-red-500"
            } hover:scale-110 z-10`}
          >
            <X size={14} />
          </button>

          <div className="relative flex items-center gap-4">
            {/* Material Design 3 Avatar */}
            <div
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-600 to-gray-700"
                  : "bg-gradient-to-br from-gray-100 to-gray-200"
              } shadow-lg`}
            >
              <User
                size={22}
                className={`transition-colors duration-500 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              />

              {/* Online Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold text-base transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {profile.name}
              </h4>
              <p className={`text-sm transition-colors duration-500 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {profile.department} {profile.year}학년
              </p>
              <p
                className={`text-xs mt-1 line-clamp-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                title={profile.profile}
              >
                {profile.profile}
              </p>
            </div>

            {/* Material Design 3 FAB-style Chat Button */}
            <button
              onClick={(e) => handleChatClick(profile.id, e)}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
                isDarkMode
                  ? "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 shadow-lg shadow-pink-500/10"
                  : "bg-pink-50 hover:bg-pink-100 text-pink-500 shadow-lg shadow-pink-500/10"
              } hover:scale-110 active:scale-95`}
              title={`${profile.name}님과 채팅하기`}
            >
              {/* Ripple Effect */}
              <div
                className={`absolute inset-0 rounded-full transition-transform duration-300 ${
                  hoveredProfile === profile.id ? "bg-white/10 scale-100" : "bg-white/0 scale-0"
                }`}
              />

              <MessageCircle size={18} className="relative z-10" />

              {/* 채팅 시작 표시 */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white animate-pulse" />
            </button>
          </div>
        </div>
      ))}

      {/* Material Design 3 Empty State */}
      {likedProfiles.length === 0 && (
        <div
          className={`text-center py-12 transition-all duration-500 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          <div className="relative inline-block mb-6">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                isDarkMode ? "bg-gray-800/40" : "bg-gray-100/60"
              }`}
            >
              <Heart size={36} className="opacity-40" />
            </div>

            {/* Floating Hearts Animation */}
            <div className="absolute -top-2 -right-2 text-pink-400 opacity-20 animate-pulse">
              <Heart size={12} fill="currentColor" />
            </div>
            <div
              className="absolute -bottom-2 -left-2 text-pink-300 opacity-30 animate-pulse"
              style={{ animationDelay: "1s" }}
            >
              <Heart size={10} fill="currentColor" />
            </div>
          </div>

          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            아직 좋아요한 프로필이 없어요
          </h3>
          <p className="text-sm">
            매칭을 통해 마음에 드는
            <br />
            사람들을 찾아보세요!
          </p>
        </div>
      )}
    </div>
  )
})

LikedProfiles.displayName = "LikedProfiles"

export default LikedProfiles
