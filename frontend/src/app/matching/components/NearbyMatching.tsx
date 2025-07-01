"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { useKakaoMap } from "../hooks/useKakaoMap"
import { useGeolocation } from "../hooks/useGeolocation"
import { useAuth } from "@/hooks/useAuth" // 🔧 통일된 경로
import { ApiKeyErrorDisplay } from "./ApiKeyErrorDisplay"
import { LocationPermissionRequest } from "./LocationPermissionRequest"
import { LoadingDisplay } from "./LoadingDisplay"
import { LocationDeniedDisplay } from "./LocationDeniedDisplay"
import { MapContainer } from "./MapContainer"
import { NearbyUsersList } from "./NearbyUsersList"
import { LocationSharingControls } from "./LocationSharingControls"

// 🔧 통일된 타입 정의
interface Profile {
  id: number
  name: string
  age: number
  mbti: string
  nickname: string
  tags: string[]
  description: string
}

interface RealTimeUser {
  userId: string
  userName: string
  latitude: number
  longitude: number
  timestamp: string
  status: "online" | "offline" | "away"
  isVisible: boolean
}

interface NearbyMatchingProps {
  isDarkMode: boolean
}

const NearbyMatching = React.memo(({ isDarkMode }: NearbyMatchingProps) => {
  // 🔧 상태 관리 통일
  const [isHovered, setIsHovered] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState<Profile[]>([]) // 더미 사용자들
  const [realTimeUsers, setRealTimeUsers] = useState<RealTimeUser[]>([]) // 실시간 위치 공유 사용자들
  const [mapLoaded, setMapLoaded] = useState(false)

  // 🔧 ref 관리 통일
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  // 🔧 커스텀 훅 사용 통일
  const { kakaoLoaded, sdkError, apiKeyError, loadingMessage } = useKakaoMap()
  const { locationPermission, currentLocation, requestLocation } = useGeolocation()
  const { user } = useAuth()

  // 🔧 실시간 사용자 위치 업데이트 핸들러
  const handleNearbyUsersUpdate = useCallback((users: RealTimeUser[]) => {
    console.log("📍 실시간 사용자 업데이트:", users.length, "명")
    setRealTimeUsers(users)
  }, [])

  // 🔧 지도 초기화 함수 개선
  const initializeMap = useCallback(
    (lat: number, lng: number) => {
      if (!kakaoLoaded || !window.kakao || !window.kakao.maps) {
        console.error("❌ 카카오맵 SDK가 아직 로드되지 않았습니다.")
        return
      }

      const container = document.getElementById("kakao-map")
      if (!container) {
        console.error("❌ 지도 컨테이너를 찾을 수 없습니다.")
        return
      }

      try {
        console.log("🗺️ 지도 초기화 시작:", { lat, lng })

        const options = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 3,
        }

        const kakaoMap = new window.kakao.maps.Map(container, options)
        mapRef.current = kakaoMap

        // 🔧 기존 마커들 정리
        markersRef.current.forEach((marker) => marker.setMap(null))
        markersRef.current.clear()

        // 🔧 현재 위치 마커 생성
        const currentMarkerImage = new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          new window.kakao.maps.Size(24, 35),
        )

        const currentMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(lat, lng),
          image: currentMarkerImage,
          map: kakaoMap,
        })

        markersRef.current.set("current", currentMarker)

        // 🔧 현재 위치 인포윈도우
        const currentInfoWindow = new window.kakao.maps.InfoWindow({
          content: '<div style="padding:5px;font-size:12px;color:#000;">📍 현재 위치</div>',
        })
        currentInfoWindow.open(kakaoMap, currentMarker)

        // 🔧 실시간 사용자 마커들 추가
        realTimeUsers.forEach((user) => {
          // 자신 제외
          if (user.userId === user?.id) return

          const userMarkerImage = new window.kakao.maps.MarkerImage(
            user.status === "online"
              ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png"
              : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_grey.png",
            new window.kakao.maps.Size(24, 35),
          )

          const userMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(user.latitude, user.longitude),
            image: userMarkerImage,
            map: kakaoMap,
          })

          markersRef.current.set(`realtime-${user.userId}`, userMarker)

          const userInfoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;color:#000;">
              👤 ${user.userName}<br/>
              <span style="color:${user.status === "online" ? "green" : "gray"};">
                ${user.status === "online" ? "🟢 온라인" : "⚫ 오프라인"}
              </span>
            </div>`,
          })

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(userMarker, "click", () => {
            userInfoWindow.open(kakaoMap, userMarker)
          })
        })

        // 🔧 더미 사용자들 마커 추가 (실시간 사용자와 구분)
        nearbyUsers.forEach((user) => {
          const userLat = lat + (Math.random() - 0.5) * 0.01
          const userLng = lng + (Math.random() - 0.5) * 0.01

          const userMarkerImage = new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_green.png",
            new window.kakao.maps.Size(24, 35),
          )

          const userMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(userLat, userLng),
            image: userMarkerImage,
            map: kakaoMap,
          })

          markersRef.current.set(`dummy-${user.id}`, userMarker)

          const userInfoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;color:#000;">👤 ${user.name} (더미)</div>`,
          })

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(userMarker, "click", () => {
            userInfoWindow.open(kakaoMap, userMarker)
          })
        })

        setMapLoaded(true)
        console.log("✅ 지도 초기화 완료!")
      } catch (error) {
        console.error("❌ 지도 초기화 중 오류:", error)
      }
    },
    [kakaoLoaded, nearbyUsers, realTimeUsers, user],
  )

  // 🔧 위치 권한 요청 및 지도 초기화
  const handleLocationRequest = useCallback(async () => {
    if (!kakaoLoaded) {
      return
    }

    const success = await requestLocation()
    if (success) {
      // 🔧 더미 데이터 생성
      const mockUsers: Profile[] = [
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
        {
          id: 5,
          name: "도서관 친구",
          age: 22,
          mbti: "INTJ",
          nickname: "book_lover",
          tags: ["조용한", "독서"],
          description: "같이 공부해요",
        },
      ]

      setNearbyUsers(mockUsers)
    }
  }, [kakaoLoaded, requestLocation])

  // 🔧 실시간 사용자 변경 시 지도 업데이트
  useEffect(() => {
    if (kakaoLoaded && locationPermission === "granted" && currentLocation && mapLoaded) {
      console.log("🔄 실시간 사용자 변경으로 지도 업데이트")
      initializeMap(currentLocation.lat, currentLocation.lng)
    }
  }, [realTimeUsers, kakaoLoaded, locationPermission, currentLocation, mapLoaded, initializeMap])

  // 🔧 카카오맵 로드 및 위치 권한 확인 시 지도 초기화
  useEffect(() => {
    if (kakaoLoaded && locationPermission === "granted" && nearbyUsers.length > 0 && currentLocation) {
      setTimeout(() => {
        initializeMap(currentLocation.lat, currentLocation.lng)
      }, 500)
    }
  }, [kakaoLoaded, locationPermission, nearbyUsers, currentLocation, initializeMap])

  // 🔧 에러 상태 처리
  if (sdkError || apiKeyError) {
    return <ApiKeyErrorDisplay isDarkMode={isDarkMode} sdkError={sdkError} apiKeyError={apiKeyError} />
  }

  // 🔧 위치 권한 요청 상태
  if (locationPermission === "prompt") {
    return (
      <LocationPermissionRequest
        isDarkMode={isDarkMode}
        kakaoLoaded={kakaoLoaded}
        loadingMessage={loadingMessage}
        onLocationRequest={handleLocationRequest}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
      />
    )
  }

  // 🔧 로딩 상태
  if (locationPermission === "loading") {
    return <LoadingDisplay isDarkMode={isDarkMode} />
  }

  // 🔧 위치 권한 거부 상태
  if (locationPermission === "denied") {
    return <LocationDeniedDisplay isDarkMode={isDarkMode} onRetry={handleLocationRequest} />
  }

  // 🔧 메인 렌더링
  return (
    <div className="relative w-full max-w-sm lg:max-w-none mx-auto space-y-4">
      {/* 실시간 위치 공유 컨트롤 */}
      <LocationSharingControls
        userId={user?.id}
        isDarkMode={isDarkMode}
        onNearbyUsersUpdate={handleNearbyUsersUpdate}
      />

      {/* 지도 컨테이너 */}
      <MapContainer
        isDarkMode={isDarkMode}
        mapLoaded={mapLoaded}
        nearbyUsers={[
          ...nearbyUsers,
          ...realTimeUsers.map((u) => ({
            id: Number.parseInt(u.userId),
            name: u.userName,
            age: 0,
            mbti: "",
            nickname: u.userName,
            tags: [],
            description: "",
          })),
        ]} // 🔧 타입 통일
        kakaoLoaded={kakaoLoaded}
        currentLocation={currentLocation}
        onRefresh={() => {
          if (kakaoLoaded && currentLocation) {
            initializeMap(currentLocation.lat, currentLocation.lng)
          }
        }}
      />

      {/* 더미 사용자 목록 */}
      <NearbyUsersList isDarkMode={isDarkMode} nearbyUsers={nearbyUsers} />

      {/* 실시간 사용자 목록 */}
      {realTimeUsers.length > 0 && (
        <div
          className={`rounded-3xl p-4 transition-all duration-700 ease-out ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-2xl`}
        >
          <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            실시간 위치 공유 중 ({realTimeUsers.length}명)
          </h4>
          <div className="space-y-2">
            {realTimeUsers.map((user) => (
              <div
                key={user.userId}
                className={`flex items-center gap-3 p-2 rounded-lg ${isDarkMode ? "bg-gray-700/30" : "bg-gray-50"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.status === "online" ? "bg-green-500" : "bg-gray-400"
                  } animate-pulse`}
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
  )
})

NearbyMatching.displayName = "NearbyMatching"

export default NearbyMatching
