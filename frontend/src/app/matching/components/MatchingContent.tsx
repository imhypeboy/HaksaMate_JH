"use client"

import React from "react"
import ProfileCard from "./ProfileCard"
import ActionButtons from "./ActionButtons"
import type { Profile } from "../types"

interface MatchingContentProps {
  profile: Profile
  isDarkMode: boolean
  exitX: number
  dragX: number
  dragY: number
  rotation: number
  isAnimating: boolean
  isDragging: boolean
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
  onLike: () => void
  onDislike: () => void
}

const MatchingContent = React.memo(
  ({
    profile,
    isDarkMode,
    exitX,
    dragX,
    dragY,
    rotation,
    isAnimating,
    isDragging,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onLike,
    onDislike,
  }: MatchingContentProps) => {
    return (
      <div className="relative w-full max-w-sm">
        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          isDarkMode={isDarkMode}
          exitX={exitX}
          dragX={dragX}
          dragY={dragY}
          rotation={rotation}
          isAnimating={isAnimating}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        />

        {/* Action Buttons */}
        <ActionButtons isDarkMode={isDarkMode} isDragging={isDragging} onLike={onLike} onDislike={onDislike} />

        {/* PC 전용 키보드 단축키 안내 */}
        <div className="hidden lg:block mt-6 text-center">
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            키보드 단축키: ← (거절) / → (좋아요) / ↑ (다시보기) / ↓ (더보기)
          </p>
        </div>
      </div>
    )
  },
)

MatchingContent.displayName = "MatchingContent"

export default MatchingContent
