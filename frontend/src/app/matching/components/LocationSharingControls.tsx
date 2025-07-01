"use client"

import React, { useState } from "react"
import { MapPin, Users, Eye, EyeOff, Play, Square } from "lucide-react"
import { useLocationShare } from "../hooks/useLocationShare"

interface LocationSharingControlsProps {
  userId?: string
  isDarkMode: boolean
  onNearbyUsersUpdate: (users: any[]) => void
}

export const LocationSharingControls = React.memo(
  ({ userId, isDarkMode, onNearbyUsersUpdate }: LocationSharingControlsProps) => {
    const [isVisible, setIsVisible] = useState(true)
    const { nearbyUsers, isConnected, isSharing, startLocationSharing, stopLocationSharing, refreshNearbyUsers } =
      useLocationShare(userId)

    // 근처 사용자 업데이트를 부모 컴포넌트에 전달
    React.useEffect(() => {
      onNearbyUsersUpdate(nearbyUsers)
    }, [nearbyUsers, onNearbyUsersUpdate])

    const handleToggleSharing = async () => {
      if (isSharing) {
        stopLocationSharing()
      } else {
        const success = await startLocationSharing(isVisible)
        if (!success) {
          alert("위치 공유를 시작할 수 없습니다. 위치 권한을 확인해주세요.")
        }
      }
    }

    return (
      <div
        className={`rounded-3xl p-6 transition-all duration-700 ease-out ${
          isDarkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
            : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
        } shadow-2xl`}
      >
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
                }`}
              >
                <MapPin size={20} />
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>실시간 위치 공유</h3>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {isConnected ? "연결됨" : "연결 안됨"} • {nearbyUsers.length}명 근처
                </p>
              </div>
            </div>

            {/* 연결 상태 표시 */}
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          </div>

          {/* 공개 설정 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                위치 {isVisible ? "공개" : "비공개"}
              </span>
            </div>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isVisible
                  ? isDarkMode
                    ? "bg-green-500/20 text-green-300"
                    : "bg-green-100 text-green-600"
                  : isDarkMode
                    ? "bg-gray-500/20 text-gray-300"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {isVisible ? "공개" : "비공개"}
            </button>
          </div>

          {/* 컨트롤 버튼들 */}
          <div className="flex gap-2">
            <button
              onClick={handleToggleSharing}
              disabled={!isConnected}
              className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                isSharing
                  ? isDarkMode
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                    : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                  : isDarkMode
                    ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSharing ? <Square size={16} /> : <Play size={16} />}
              {isSharing ? "공유 중지" : "공유 시작"}
            </button>

            <button
              onClick={refreshNearbyUsers}
              disabled={!isConnected}
              className={`px-4 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center ${
                isDarkMode
                  ? "bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Users size={16} />
            </button>
          </div>

          {/* 근처 사용자 목록 */}
          {nearbyUsers.length > 0 && (
            <div className="space-y-2">
              <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                근처 사용자 ({nearbyUsers.length}명)
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {nearbyUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.userId}
                    className={`flex items-center gap-2 p-2 rounded-lg ${isDarkMode ? "bg-gray-700/30" : "bg-gray-50"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${user.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{user.userName}</span>
                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(user.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  },
)

LocationSharingControls.displayName = "LocationSharingControls"
