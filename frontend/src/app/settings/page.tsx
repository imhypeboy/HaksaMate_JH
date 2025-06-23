"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../sidebar/sidebar"
import {
  Bell,
  User,
  Globe,
  Lock,
  Save,
  LogOut,
  UserIcon,
  Shield,
  Smartphone,
  Mail,
  Languages,
  Moon,
  Sun,
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // 데스크톱에서는 사이드바 기본 열림
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // 최근 10년치 입학년도 리스트
  const currentYear = new Date().getFullYear()
  const admissionYears = Array.from({ length: 10 }, (_, i) => String(currentYear - i))

  // 프로필 상태
  const [profileSettings, setProfileSettings] = useState({
    name: "홍길동",
    email: "student@university.ac.kr",
    department: "컴퓨터공학과",
    studentId: "2021123456",
    year: "2021",
    phone: "010-1234-5678",
  })

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    scheduleReminders: true,
    deadlineAlerts: true,
    systemUpdates: false,
    communityNotifications: true,
    gradeNotifications: true,
  })

  // 일반 설정
  const [generalSettings, setGeneralSettings] = useState({
    language: "ko",
    theme: "light",
    autoSave: true,
    dataSync: true,
    offlineMode: false,
  })

  // 보안 설정
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: "30",
    dataEncryption: true,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // 실제 저장 로직
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("설정이 저장되었습니다.")
    } catch (e) {
      alert("설정 저장에 실패했습니다.")
    }
    setSaving(false)
  }

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      router.push("/")
    }
  }

  const tabs = [
    { id: "profile", label: "프로필 설정", icon: User },
    { id: "notifications", label: "알림 설정", icon: Bell },
    { id: "general", label: "일반 설정", icon: Globe },
    { id: "security", label: "보안 설정", icon: Lock },
  ]

  return (
      <div className="min-h-screen bg-[#FBFBFB] text-gray-900 md:flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className={`flex-1 transition-all duration-500 ease-out ${sidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
          {/* 헤더 */}
          <header
              className="bg-white border-b border-gray-200 py-4 px-4 flex justify-between items-center shadow-sm">
            <div className="w-10 md:hidden"></div>
            <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">설정</h1>
            <button
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 rounded-full bg-[#C4D9FF] hover:bg-[#B0CCFF] flex items-center justify-center transition-colors"
                aria-label="프로필"
            >
              <UserIcon className="h-5 w-5 text-gray-700"/>
            </button>
          </header>

          <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 사이드 탭 */}
              <div className="lg:w-1/4">
                <nav className="bg-white border border-gray-200 rounded-xl p-4 sticky top-8 shadow-sm">
                  <ul className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                          <li key={tab.id}>
                            <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-colors ${
                                    activeTab === tab.id
                                        ? "bg-[#E8F9FF] text-blue-700 border border-blue-200"
                                        : "hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                              <Icon className="h-5 w-5 mr-3"/>
                              <span className="font-medium">{tab.label}</span>
                            </button>
                          </li>
                      )
                    })}
                    <li className="pt-4 mt-4 border-t border-gray-200">
                      <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 rounded-xl flex items-center text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-5 w-5 mr-3"/>
                        <span className="font-medium">로그아웃</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* 메인 설정 패널 */}
              <div className="lg:w-3/4 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                {activeTab === "profile" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-[#E8F9FF] rounded-xl flex items-center justify-center mr-4">
                          <User className="h-6 w-6 text-gray-700"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">프로필 설정</h2>
                          <p className="text-gray-600 text-sm">개인 정보를 관리하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.name}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  name: e.target.value
                                })}
                            />
                          </div>
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.email}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  email: e.target.value
                                })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">학과</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.department}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  department: e.target.value
                                })}
                            />
                          </div>
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">입학년도</label>
                            <select
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.year}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  year: e.target.value
                                })}
                            >
                              {admissionYears.map((year) => (
                                  <option key={year} value={year}>
                                    {year}년
                                  </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">학번</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.studentId}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  studentId: e.target.value
                                })}
                            />
                          </div>
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                            <input
                                type="tel"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.phone}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  phone: e.target.value
                                })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-[#C4D9FF] rounded-xl flex items-center justify-center mr-4">
                          <Bell className="h-6 w-6 text-gray-700"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">알림 설정</h2>
                          <p className="text-gray-600 text-sm">알림 수신 방법을 설정하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-[#E8F9FF] border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Mail className="w-5 h-5 mr-2"/>
                            이메일 알림
                          </h3>
                          <div className="space-y-4">
                            {[
                              {
                                key: "emailNotifications",
                                label: "이메일 알림 수신",
                                desc: "중요한 알림을 이메일로 받습니다",
                              },
                              {
                                key: "scheduleReminders",
                                label: "일정 알림",
                                desc: "수업 및 시험 일정을 미리 알려드립니다",
                              },
                              {
                                key: "deadlineAlerts",
                                label: "마감일 알림",
                                desc: "과제 및 신청 마감일을 알려드립니다"
                              },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                  <div>
                                    <div
                                        className="font-medium text-gray-800">{item.label}</div>
                                    <div className="text-sm text-gray-600">{item.desc}</div>
                                  </div>
                                  <label
                                      className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                        onChange={(e) =>
                                            setNotificationSettings({
                                              ...notificationSettings,
                                              [item.key]: e.target.checked,
                                            })
                                        }
                                    />
                                    <div
                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Smartphone className="w-5 h-5 mr-2"/>앱 알림
                          </h3>
                          <div className="space-y-4">
                            {[
                              {
                                key: "systemUpdates",
                                label: "시스템 업데이트",
                                desc: "앱 업데이트 및 시스템 공지사항"
                              },
                              {
                                key: "communityNotifications",
                                label: "커뮤니티 알림",
                                desc: "댓글, 좋아요 등 커뮤니티 활동",
                              },
                              {key: "gradeNotifications", label: "성적 알림", desc: "성적 입력 및 변경 알림"},
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                  <div>
                                    <div
                                        className="font-medium text-gray-800">{item.label}</div>
                                    <div className="text-sm text-gray-600">{item.desc}</div>
                                  </div>
                                  <label
                                      className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                        onChange={(e) =>
                                            setNotificationSettings({
                                              ...notificationSettings,
                                              [item.key]: e.target.checked,
                                            })
                                        }
                                    />
                                    <div
                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === "general" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-[#C5BAFF] rounded-xl flex items-center justify-center mr-4">
                          <Globe className="h-6 w-6 text-gray-700"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">일반 설정</h2>
                          <p className="text-gray-600 text-sm">앱 사용 환경을 설정하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-[#E8F9FF] border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Languages className="w-5 h-5 mr-2"/>
                            언어 및 지역
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label
                                  className="block text-sm font-medium text-gray-700 mb-2">언어</label>
                              <select
                                  className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                  value={generalSettings.language}
                                  onChange={(e) => setGeneralSettings({
                                    ...generalSettings,
                                    language: e.target.value
                                  })}
                              >
                                <option value="ko">한국어</option>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                                <option value="zh">中文</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            {generalSettings.theme === "light" ? (
                                <Sun className="w-5 h-5 mr-2"/>
                            ) : (
                                <Moon className="w-5 h-5 mr-2"/>
                            )}
                            테마 및 표시
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label
                                  className="block text-sm font-medium text-gray-700 mb-2">테마</label>
                              <select
                                  className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                  value={generalSettings.theme}
                                  onChange={(e) => setGeneralSettings({
                                    ...generalSettings,
                                    theme: e.target.value
                                  })}
                              >
                                <option value="light">라이트 모드</option>
                                <option value="dark">다크 모드</option>
                                <option value="auto">시스템 설정 따름</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            {key: "autoSave", label: "자동 저장", desc: "작성 중인 내용을 자동으로 저장합니다"},
                            {key: "dataSync", label: "데이터 동기화", desc: "여러 기기 간 데이터를 동기화합니다"},
                            {
                              key: "offlineMode",
                              label: "오프라인 모드",
                              desc: "인터넷 연결 없이도 일부 기능을 사용할 수 있습니다",
                            },
                          ].map((item) => (
                              <div
                                  key={item.key}
                                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
                              >
                                <div>
                                  <div className="font-medium text-gray-800">{item.label}</div>
                                  <div className="text-sm text-gray-600">{item.desc}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={generalSettings[item.key as keyof typeof generalSettings] as boolean}
                                      onChange={(e) =>
                                          setGeneralSettings({
                                            ...generalSettings,
                                            [item.key]: e.target.checked,
                                          })
                                      }
                                  />
                                  <div
                                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                          <Lock className="h-6 w-6 text-red-600"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">보안 설정</h2>
                          <p className="text-gray-600 text-sm">계정 보안을 강화하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-red-600"/>
                            인증 설정
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-800">2단계 인증</div>
                                <div className="text-sm text-gray-600">SMS 또는 앱을 통한 추가 인증</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={securitySettings.twoFactorAuth}
                                    onChange={(e) =>
                                        setSecuritySettings({
                                          ...securitySettings,
                                          twoFactorAuth: e.target.checked,
                                        })
                                    }
                                />
                                <div
                                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                              </label>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">세션
                                타임아웃</label>
                              <select
                                  className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                  value={securitySettings.sessionTimeout}
                                  onChange={(e) =>
                                      setSecuritySettings({
                                        ...securitySettings,
                                        sessionTimeout: e.target.value
                                      })
                                  }
                              >
                                <option value="15">15분</option>
                                <option value="30">30분</option>
                                <option value="60">1시간</option>
                                <option value="120">2시간</option>
                                <option value="never">자동 로그아웃 안함</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            {key: "loginAlerts", label: "로그인 알림", desc: "새로운 기기에서 로그인 시 알림을 받습니다"},
                            {
                              key: "dataEncryption",
                              label: "데이터 암호화",
                              desc: "저장된 데이터를 암호화하여 보호합니다",
                            },
                          ].map((item) => (
                              <div
                                  key={item.key}
                                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
                              >
                                <div>
                                  <div className="font-medium text-gray-800">{item.label}</div>
                                  <div className="text-sm text-gray-600">{item.desc}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={securitySettings[item.key as keyof typeof securitySettings] as boolean}
                                      onChange={(e) =>
                                          setSecuritySettings({
                                            ...securitySettings,
                                            [item.key]: e.target.checked,
                                          })
                                      }
                                  />
                                  <div
                                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                          ))}
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <h4 className="font-medium text-yellow-800 mb-2">⚠️ 주의사항</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• 2단계 인증을 활성화하면 로그인 시 추가 인증이 필요합니다</li>
                            <li>• 세션 타임아웃 설정이 짧을수록 보안이 강화됩니다</li>
                            <li>• 데이터 암호화는 성능에 영향을 줄 수 있습니다</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                )}

                {/* 저장 버튼 */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-[#C4D9FF] hover:bg-[#B0CCFF] text-gray-800 rounded-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {saving ? (
                        <>
                          <div
                              className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
                          저장 중...
                        </>
                    ) : (
                        <>
                          <Save className="h-4 w-4 mr-2"/>
                          설정 저장
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 프로필 모달 */}
          {showProfileModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                  <div className="flex flex-col items-center">
                    <div
                        className="w-24 h-24 rounded-full bg-[#E8F9FF] flex items-center justify-center mb-4">
                      <UserIcon className="h-12 w-12 text-gray-700"/>
                    </div>
                    <h2 className="text-xl font-bold mb-1 text-gray-900">{profileSettings.name}</h2>
                    <p className="text-gray-500 mb-6">
                      {profileSettings.department} • {currentYear - Number.parseInt(profileSettings.year) + 1}학년
                    </p>

                    <div className="w-full space-y-3 mb-6">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">학번</span>
                        <span className="text-gray-600">{profileSettings.studentId}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">이메일</span>
                        <span className="text-gray-600">{profileSettings.email}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">전화번호</span>
                        <span className="text-gray-600">{profileSettings.phone}</span>
                      </div>
                    </div>

                    <div className="w-full space-y-3">
                      <button
                          className="w-full py-3 px-4 bg-[#C4D9FF] hover:bg-[#B0CCFF] text-gray-800 rounded-xl transition-colors font-medium">
                        프로필 편집
                      </button>
                      <button
                          className="w-full py-3 px-4 bg-[#C5BAFF] hover:bg-[#B8ABFF] text-gray-800 rounded-xl transition-colors font-medium">
                        계정 관리
                      </button>
                      <button
                          onClick={() => setShowProfileModal(false)}
                          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors font-medium"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  )
}
