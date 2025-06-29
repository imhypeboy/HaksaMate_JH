"use client"

import React from "react"

interface SidePanelProps {
  isDarkMode: boolean
}

const SidePanel = React.memo(({ isDarkMode }: SidePanelProps) => {
  return (
    <div className="col-span-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
      {/* 매칭 통계 */}
      <div
        className={`rounded-3xl p-6 ${
          isDarkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
            : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
        } shadow-xl`}
      >
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>오늘의 매칭 현황</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>12</div>
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>새로운 프로필</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}>5</div>
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>매칭 성공</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? "text-green-400" : "text-green-600"}`}>8</div>
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>새 메시지</div>
          </div>
        </div>
      </div>

      {/* 추천 프로필 미리보기 */}
      <div
        className={`rounded-3xl p-6 ${
          isDarkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
            : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
        } shadow-xl`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>🔮 다음 추천 프로필</h3>
          <button
            className={`text-xs px-3 py-1 rounded-full ${
              isDarkMode
                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            } transition-colors`}
          >
            전체보기
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: "스터디 메이트", age: 22, tags: ["성실한", "열정적"], match: 95, distance: "0.5km" },
            { name: "카페 친구", age: 24, tags: ["감성적", "여유로운"], match: 88, distance: "1.2km" },
            { name: "운동 파트너", age: 21, tags: ["활발한", "건강한"], match: 82, distance: "0.8km" },
          ].map((user, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                isDarkMode
                  ? "bg-gray-700/40 border-gray-600/30 hover:bg-gray-700/60 hover:border-gray-500/50"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${
                    isDarkMode
                      ? "bg-gradient-to-br from-gray-600 to-gray-700"
                      : "bg-gradient-to-br from-gray-200 to-gray-300"
                  } flex items-center justify-center relative`}
                >
                  {/* 매칭 점수 배지 */}
                  <div
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.match >= 90
                        ? "bg-green-500 text-white"
                        : user.match >= 80
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-500 text-white"
                    }`}
                  >
                    {user.match}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {user.name} · 만 {user.age}
                    </p>
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      📍 {user.distance}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {user.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {/* 매칭 이유 */}
                  <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {index === 0
                      ? "같은 전공 + 스터디 관심사 일치"
                      : index === 1
                        ? "카페 취향 + MBTI 궁합도 높음"
                        : "운동 관심사 + 나이대 비슷함"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

SidePanel.displayName = "SidePanel"

export default SidePanel
