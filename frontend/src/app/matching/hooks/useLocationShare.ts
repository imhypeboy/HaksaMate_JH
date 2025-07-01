"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Client } from "@stomp/stompjs"

export interface LocationData {
  userId: string
  userName: string
  latitude: number
  longitude: number
  timestamp: string
  status: "online" | "offline" | "away"
  isVisible: boolean
}

interface Location {
  lat: number
  lng: number
}

const BASE_URL = "http://localhost:8080"
const WS_URL = BASE_URL.replace("http://", "ws://")

export function useLocationShare(userId?: string) {
  const [nearbyUsers, setNearbyUsers] = useState<LocationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const stompClientRef = useRef<Client | null>(null)
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  console.log("📍 useLocationShare 호출됨:", { userId })

  // WebSocket 연결 설정
  useEffect(() => {
    if (!userId) return

    console.log("🔌 위치 공유 WebSocket 연결 시작")

    const stompClient = new Client({
      brokerURL: `${WS_URL}/ws`,
      debug: (str) => console.log("🔌 Location STOMP:", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("✅ 위치 공유 WebSocket 연결 성공", frame)
        setIsConnected(true)

        // 근처 사용자 위치 구독
        stompClient.subscribe("/topic/location/nearby", (message) => {
          console.log("📍 근처 사용자 위치 수신:", message.body)
          try {
            const locationData: LocationData = JSON.parse(message.body)

            setNearbyUsers((prev) => {
              if (locationData.status === "offline") {
                // 오프라인 사용자 제거
                return prev.filter((user) => user.userId !== locationData.userId)
              } else {
                // 기존 사용자 업데이트 또는 새 사용자 추가
                const existingIndex = prev.findIndex((user) => user.userId === locationData.userId)
                if (existingIndex >= 0) {
                  const updated = [...prev]
                  updated[existingIndex] = locationData
                  return updated
                } else {
                  return [...prev, locationData]
                }
              }
            })
          } catch (error) {
            console.error("❌ 위치 데이터 파싱 에러:", error)
          }
        })

        // 개인 위치 정보 구독 (초기 데이터)
        stompClient.subscribe(`/user/queue/location/initial`, (message) => {
          console.log("📍 초기 위치 데이터 수신:", message.body)
          try {
            const locationData: LocationData = JSON.parse(message.body)
            setNearbyUsers((prev) => {
              const exists = prev.some((user) => user.userId === locationData.userId)
              return exists ? prev : [...prev, locationData]
            })
          } catch (error) {
            console.error("❌ 초기 위치 데이터 파싱 에러:", error)
          }
        })

        console.log("✅ 위치 공유 구독 완료")
      },
      onDisconnect: (frame) => {
        console.log("❌ 위치 공유 WebSocket 연결 해제", frame)
        setIsConnected(false)
      },
      onStompError: (frame) => {
        console.error("❌ 위치 공유 STOMP 에러:", frame)
        setIsConnected(false)
      },
    })

    try {
      stompClient.activate()
      stompClientRef.current = stompClient
    } catch (error) {
      console.error("❌ 위치 공유 WebSocket 활성화 실패:", error)
    }

    return () => {
      console.log("🔌 위치 공유 WebSocket 연결 정리")
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
      setIsConnected(false)
    }
  }, [userId])

  // 위치 공유 시작
  const startLocationSharing = useCallback(
    async (isVisible = true) => {
      if (!userId || !isConnected || !stompClientRef.current) {
        console.log("⚠️ 위치 공유 시작 조건 미충족")
        return false
      }

      try {
        // 현재 위치 가져오기
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          })
        })

        const locationData = {
          userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isVisible,
        }

        // 위치 공유 참여 메시지 전송
        stompClientRef.current.publish({
          destination: "/app/location.join",
          body: JSON.stringify(locationData),
        })

        setIsSharing(true)

        // 주기적 위치 업데이트 (30초마다)
        locationIntervalRef.current = setInterval(async () => {
          try {
            const newPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 30000,
              })
            })

            const updatedLocationData = {
              userId,
              latitude: newPosition.coords.latitude,
              longitude: newPosition.coords.longitude,
              isVisible,
            }

            stompClientRef.current?.publish({
              destination: "/app/location.update",
              body: JSON.stringify(updatedLocationData),
            })

            console.log("📍 위치 업데이트 전송")
          } catch (error) {
            console.error("❌ 위치 업데이트 실패:", error)
          }
        }, 30000)

        console.log("✅ 위치 공유 시작")
        return true
      } catch (error) {
        console.error("❌ 위치 공유 시작 실패:", error)
        return false
      }
    },
    [userId, isConnected],
  )

  // 위치 공유 중지
  const stopLocationSharing = useCallback(() => {
    if (!userId || !stompClientRef.current) return

    try {
      // 위치 공유 종료 메시지 전송
      stompClientRef.current.publish({
        destination: "/app/location.leave",
        body: userId,
      })

      // 주기적 업데이트 중지
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
        locationIntervalRef.current = null
      }

      setIsSharing(false)
      setNearbyUsers([]) // 근처 사용자 목록 초기화

      console.log("✅ 위치 공유 중지")
    } catch (error) {
      console.error("❌ 위치 공유 중지 실패:", error)
    }
  }, [userId])

  // 근처 사용자 새로고침
  const refreshNearbyUsers = useCallback(async () => {
    if (!userId) return

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      await fetch(
        `${BASE_URL}/api/location/nearby?userId=${userId}&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`,
        {
          method: "POST",
        },
      )

      console.log("🔄 근처 사용자 새로고침 요청")
    } catch (error) {
      console.error("❌ 근처 사용자 새로고침 실패:", error)
    }
  }, [userId])

  return {
    nearbyUsers,
    isConnected,
    isSharing,
    startLocationSharing,
    stopLocationSharing,
    refreshNearbyUsers,
  }
}
