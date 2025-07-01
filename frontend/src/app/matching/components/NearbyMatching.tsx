"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { useKakaoMap } from "../hooks/useKakaoMap"
import { useGeolocation } from "../hooks/useGeolocation"
import { ApiKeyErrorDisplay } from "./ApiKeyErrorDisplay"
import { LocationPermissionRequest } from "./LocationPermissionRequest"
import { LoadingDisplay } from "./LoadingDisplay"
import { LocationDeniedDisplay } from "./LocationDeniedDisplay"
import { MapContainer } from "./MapContainer"
import { NearbyUsersList } from "./NearbyUsersList"

// Profile 타입 정의
interface Profile {
  id: number
  name: string
  age: number
  mbti: string
  nickname: string
  tags: string[]
  description: string
}

interface NearbyMatchingProps {
  isDarkMode: boolean
}

const NearbyMatching = React.memo(({ isDarkMode }: NearbyMatchingProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState<Profile[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<any>(null)

  // 커스텀 훅 사용
  const { kakaoLoaded, sdkError, apiKeyError, loadingMessage } = useKakaoMap()
  const { locationPermission, currentLocation, requestLocation } = useGeolocation()

  // 지도 초기화
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

        // 현재 위치 마커
        const currentMarkerImage = new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          new window.kakao.maps.Size(24, 35),
        )

        const currentMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(lat, lng),
          image: currentMarkerImage,
          map: kakaoMap,
        })

        // 현재 위치 인포윈도우
        const currentInfoWindow = new window.kakao.maps.InfoWindow({
          content: '<div style="padding:5px;font-size:12px;color:#000;">📍 현재 위치</div>',
        })

        currentInfoWindow.open(kakaoMap, currentMarker)

        // 근처 사용자 마커들
        nearbyUsers.forEach((user, idx) => {
          const userLat = lat + (Math.random() - 0.5) * 0.01
          const userLng = lng + (Math.random() - 0.5) * 0.01

          const userMarkerImage = new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png",
            new window.kakao.maps.Size(24, 35),
          )

          const userMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(userLat, userLng),
            image: userMarkerImage,
            map: kakaoMap,
          })

          const userInfoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;color:#000;">👤 ${user.name}</div>`,
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
    [kakaoLoaded, nearbyUsers],
  )

  // 위치 권한 요청 및 지도 초기화
  const handleLocationRequest = useCallback(async () => {
    if (!kakaoLoaded) {
      return
    }

    const success = await requestLocation()
    if (success) {
      // 임시 데이터
      const mockUsers = [
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

  // 카카오맵이 로드되고 위치 권한이 있을 때 지도 초기화
  useEffect(() => {
    if (kakaoLoaded && locationPermission === "granted" && nearbyUsers.length > 0 && currentLocation) {
      setTimeout(() => {
        initializeMap(currentLocation.lat, currentLocation.lng)
      }, 500)
    }
  }, [kakaoLoaded, locationPermission, nearbyUsers, currentLocation, initializeMap])

  // SDK 에러가 있는 경우
  if (sdkError || apiKeyError) {
    return <ApiKeyErrorDisplay isDarkMode={isDarkMode} sdkError={sdkError} apiKeyError={apiKeyError} />
  }

  // 위치 권한이 없는 경우
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

  // 로딩 상태
  if (locationPermission === "loading") {
    return <LoadingDisplay isDarkMode={isDarkMode} />
  }

  // 위치 권한 거부된 경우
  if (locationPermission === "denied") {
    return <LocationDeniedDisplay isDarkMode={isDarkMode} onRetry={handleLocationRequest} />
  }

  // 지도 및 근처 사용자 표시
  return (
    <div className="relative w-full max-w-sm lg:max-w-none mx-auto space-y-4">
      <MapContainer
        isDarkMode={isDarkMode}
        mapLoaded={mapLoaded}
        nearbyUsers={nearbyUsers}
        kakaoLoaded={kakaoLoaded}
        currentLocation={currentLocation}
        onRefresh={() => {
          if (kakaoLoaded && currentLocation) {
            initializeMap(currentLocation.lat, currentLocation.lng)
          }
        }}
      />

      <NearbyUsersList isDarkMode={isDarkMode} nearbyUsers={nearbyUsers} />
    </div>
  )
})

NearbyMatching.displayName = "NearbyMatching"

export default NearbyMatching
