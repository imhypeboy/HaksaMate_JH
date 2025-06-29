"use client"

import React, { useState, useCallback } from "react"
import { MapPin, X, Navigation, User, Heart } from "lucide-react"
import type { Profile } from "../types"

interface NearbyMatchingProps {
  isDarkMode: boolean
}

const NearbyMatching = React.memo(({ isDarkMode }: NearbyMatchingProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt" | "loading">("prompt")
  const [nearbyUsers, setNearbyUsers] = useState<Profile[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // 위치 권한 요청 및 지도 초기화
  const handleLocationRequest = useCallback(async () => {
    setLocationPermission("loading")

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation not supported")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분 캐시
        })
      })

      setLocationPermission("granted")

      // 임시 데이터
      setNearbyUsers([
        {
          id: 3,
          name: "근처의 김철수",
          age: 23,
          mbti: "ENFP",
          nickname: "nearby_user1",
          tags: ["활발한", "친근한"],
          description: "같은 과 선배에요!",
        },
        {
          id: 4,
          name: "카페 단골 이영희",
          age: 21,
          mbti: "ISFP",
          nickname: "coffee_lover",
          tags: ["조용한", "카페"],
          description: "자주 가는 카페에서 봤어요",
        },
      ])

      // 지도 초기화 (카카오맵 API)
      setTimeout(() => setMapLoaded(true), 1000)
    } catch (error) {
      console.error("Location error:", error)
      setLocationPermission("denied")
    }
  }, [])

  // 위치 권한이 없는 경우 - 권한 요청 UI
  if (locationPermission === "prompt") {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <div
          className={`rounded-3xl p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-2xl hover:shadow-3xl`}
        >
          <div className="mb-8">
            {/* Material Design 3 FAB-style Icon */}
            <div
              className={`relative w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-400/20 to-blue-600/20 text-blue-300"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600"
              } shadow-lg hover:shadow-xl hover:scale-105`}
            >
              <MapPin size={36} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />

              {/* Material Design 3 Pulse Effect */}
              <div
                className={`absolute inset-0 rounded-full animate-pulse ${
                  isDarkMode ? "bg-blue-400/10" : "bg-blue-500/10"
                }`}
              />

              {/* Floating Animation Circles */}
              <div
                className={`absolute -top-2 -right-2 w-4 h-4 rounded-full animate-bounce ${
                  isDarkMode ? "bg-blue-400/60" : "bg-blue-500/60"
                }`}
                style={{ animationDelay: "0s" }}
              />
              <div
                className={`absolute -bottom-2 -left-2 w-3 h-3 rounded-full animate-bounce ${
                  isDarkMode ? "bg-blue-300/40" : "bg-blue-400/40"
                }`}
                style={{ animationDelay: "1s" }}
              />
            </div>

            <h3
              className={`text-2xl font-bold mb-3 transition-colors duration-500 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              주변 매칭
            </h3>
            <p
              className={`text-sm leading-relaxed transition-colors duration-500 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              위치 기반으로 근처에 있는
              <br />
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
                  ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              } hover:shadow-xl hover:scale-105 active:scale-95`}
            >
              {/* Material Design 3 Ripple Effect */}
              <div
                className={`absolute inset-0 rounded-full transition-transform duration-300 ${
                  isHovered ? "bg-white/10 scale-100" : "bg-white/0 scale-0"
                }`}
              />

              <div className="relative flex items-center justify-center gap-2">
                <Navigation
                  size={18}
                  className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isHovered ? "scale-110 rotate-12" : "scale-100 rotate-0"
                  }`}
                />
                <span>위치 권한 허용</span>
              </div>
            </button>

            {/* Material Design 3 Supporting Text */}
            <div
              className={`text-xs leading-relaxed transition-colors duration-500 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              현재 위치를 기반으로 1km 반경 내<br />
              사용자들을 찾아드립니다
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (locationPermission === "loading") {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <div
          className={`rounded-3xl p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-2xl`}
        >
          <div className="mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
              } animate-pulse`}
            >
              <MapPin size={24} className="animate-bounce" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>위치 확인 중...</h3>
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    )
  }

  // 위치 권한 거부된 경우
  if (locationPermission === "denied") {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <div
          className={`rounded-3xl p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-2xl`}
        >
          <div className="mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"
              }`}
            >
              <X size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              위치 권한이 필요해요
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              브라우저 설정에서 위치 권한을
              <br />
              허용해주세요
            </p>
          </div>
          <button
            onClick={handleLocationRequest}
            className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
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
      <div
        className={`rounded-3xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
            : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
        } shadow-2xl`}
      >
        <div className="h-64 lg:h-80 relative">
          {!mapLoaded ? (
            // 지도 로딩 상태
            <div
              className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <div className="text-center">
                <MapPin
                  size={32}
                  className={`mx-auto mb-2 animate-pulse ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                />
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>지도 로딩 중...</p>
              </div>
            </div>
          ) : (
            // TODO: 실제 카카오맵 컴포넌트로 교체
            <div
              className={`w-full h-full flex items-center justify-center ${
                isDarkMode ? "bg-blue-900/20" : "bg-blue-50"
              } relative`}
            >
              <div className="text-center">
                <MapPin size={24} className="mx-auto mb-2 text-blue-500" />
                <p className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>지도 영역</p>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>카카오맵 API 연동 예정</p>
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
              <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                근처 사용자 {nearbyUsers.length}명
              </p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>반경 1km 내</p>
            </div>
            <button
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isDarkMode
                  ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
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
                  ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
                  : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
              } shadow-lg hover:shadow-xl`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <User size={16} className={isDarkMode ? "text-gray-300" : "text-gray-600"} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>{user.name}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    만 {user.age} · {user.mbti} · 500m
                  </p>
                </div>

                <Heart size={16} className="text-pink-500 hover:fill-current cursor-pointer transition-colors" />
              </div>
            </div>
          ))}

          {nearbyUsers.length > 3 && (
            <button
              className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? "bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 border border-gray-700/40"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              +{nearbyUsers.length - 3}명 더 보기
            </button>
          )}
        </div>
      )}
    </div>
  )
})

NearbyMatching.displayName = "NearbyMatching"

export default NearbyMatching
