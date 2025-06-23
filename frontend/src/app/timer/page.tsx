"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Plus, Minus, Clock, TimerIcon, AlarmClockIcon as Alarm, Flag, Settings, MoreVertical } from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import { showToast, ToastContainer } from "../components/toast"

type TimerState = "idle" | "running" | "paused"
type StopwatchState = "idle" | "running" | "paused"
type ActiveTab = "alarm" | "stopwatch" | "timer"

interface AlarmItem {
    id: string
    time: string
    label: string
    enabled: boolean
    days: string[]
}

interface LapTime {
    id: string
    time: number
    lapNumber: number
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
        },
    },
}

export default function TimerApp() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("timer")
    const [currentTime, setCurrentTime] = useState(new Date())
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    // 알람 중복 실행 방지 (각 알람별로 관리)
    const lastAlarmCheckRef = useRef<Set<string>>(new Set())
    
    // 오디오 컨텍스트 재사용
    const audioContextRef = useRef<AudioContext | null>(null)

    // 오디오 컨텍스트 초기화
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        return audioContextRef.current
    }, [])

    // 알림 소리 재생 함수 (개선됨)
    const playNotificationSound = useCallback(() => {
        try {
            const audioContext = getAudioContext()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 1)
        } catch (error) {
            console.log('오디오 재생 실패:', error)
        }
    }, [getAudioContext])



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

    // 컴포넌트 언마운트 시 오디오 컨텍스트 정리
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close()
                audioContextRef.current = null
            }
        }
    }, [])

    // Timer states
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(5)
    const [seconds, setSeconds] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [timerState, setTimerState] = useState<TimerState>("idle")

    // Stopwatch states
    const [stopwatchTime, setStopwatchTime] = useState(0)
    const [stopwatchState, setStopwatchState] = useState<StopwatchState>("idle")
    const [lapTimes, setLapTimes] = useState<LapTime[]>([])
    const [lapCounter, setLapCounter] = useState(0)
    
    // Enhanced stopwatch features
    const [targetTime, setTargetTime] = useState(0) // 목표 시간 (밀리초)
    const [targetEnabled, setTargetEnabled] = useState(false)
    const [intervalTime, setIntervalTime] = useState(60000) // 인터벌 시간 (밀리초)
    const [intervalEnabled, setIntervalEnabled] = useState(false)
    const [lastIntervalTime, setLastIntervalTime] = useState(0)
    const [soundEnabled, setSoundEnabled] = useState(true)

    // Alarm states
    const [alarms, setAlarms] = useState<AlarmItem[]>([
        {
            id: "1",
            time: "07:00",
            label: "Morning Alarm",
            enabled: true,
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        },
        {
            id: "2",
            time: "22:00",
            label: "Sleep Time",
            enabled: false,
            days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
    ])
    const [showAddAlarm, setShowAddAlarm] = useState(false)
    const [newAlarmTime, setNewAlarmTime] = useState("12:00")
    const [newAlarmLabel, setNewAlarmLabel] = useState("")

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    // 알람 체크 로직
    useEffect(() => {
        const playAlarmSoundLocal = () => {
            try {
                const audioContext = getAudioContext()
                
                // 3번 반복하는 알람음
                for (let i = 0; i < 3; i++) {
                    const oscillator = audioContext.createOscillator()
                    const gainNode = audioContext.createGain()
                    
                    oscillator.connect(gainNode)
                    gainNode.connect(audioContext.destination)
                    
                    // 더 높은 주파수로 알람 느낌
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + i * 1.5)
                    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + i * 1.5)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 1.5 + 0.8)
                    
                    oscillator.start(audioContext.currentTime + i * 1.5)
                    oscillator.stop(audioContext.currentTime + i * 1.5 + 0.8)
                }
            } catch (error) {
                console.log('알람 오디오 재생 실패:', error)
            }
        }

        const checkAlarms = () => {
            const now = new Date()
            const currentTime = now.toTimeString().slice(0, 5) // HH:MM 형식
            const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' })
            
            alarms.forEach(alarm => {
                if (alarm.enabled && alarm.time === currentTime) {
                    // 요일 체크
                    if (alarm.days.includes(currentDay)) {
                        const alarmKey = `${alarm.id}-${currentTime}-${currentDay}`
                        
                        // 중복 실행 방지 (각 알람별로)
                        if (lastAlarmCheckRef.current.has(alarmKey)) return
                        lastAlarmCheckRef.current.add(alarmKey)
                        
                        // 1분 후 키 정리 (다음 번에 다시 울릴 수 있도록)
                        setTimeout(() => {
                            lastAlarmCheckRef.current.delete(alarmKey)
                        }, 60000)
                        
                        // 멀티모달 알람 알림
                        showToast({
                            type: 'warning',
                            title: `🔔 ${alarm.label}`,
                            message: `${alarm.time} 알람이 울렸습니다!`
                        })
                        
                        // 알람 소리 (더 길고 반복적인 소리)
                        playAlarmSoundLocal()
                        
                        // 브라우저 알림
                        if (Notification.permission === "granted") {
                            new Notification(`🔔 ${alarm.label}`, {
                                body: `${alarm.time} 알람이 울렸습니다!`,
                                icon: "/favicon.ico",
                                tag: `alarm-${alarm.id}`,
                                requireInteraction: true
                            })
                        }
                        
                        // 모바일 진동
                        if (navigator.vibrate) {
                            navigator.vibrate([300, 200, 300, 200, 300, 200, 300])
                        }
                    }
                }
            })
        }
        
        // 매분 0초에 알람 체크
        const now = new Date()
        const secondsUntilNextMinute = 60 - now.getSeconds()
        
        const timeout = setTimeout(() => {
            checkAlarms()
            const interval = setInterval(checkAlarms, 60000) // 매분마다 체크
            return () => clearInterval(interval)
        }, secondsUntilNextMinute * 1000)
        
        return () => clearTimeout(timeout)
    }, [alarms])

    // Timer countdown logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (timerState === "running" && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setTimerState("idle")
                        
                        // 멀티 모달 알림 (토스트 + 소리 + 브라우저 알림)
                        // 1. 토스트 알림
                        showToast({
                            type: 'success',
                            title: '⏰ 타이머 완료!',
                            message: '설정한 시간이 끝났습니다.'
                        })
                        
                        // 2. 알림 소리
                        playNotificationSound()
                        
                        // 3. 브라우저 알림 (백그라운드용)
                        if (Notification.permission === "granted") {
                            new Notification("⏰ 타이머 완료!", {
                                body: "설정한 시간이 끝났습니다.",
                                icon: "/favicon.ico",
                                tag: "timer-finished",
                                requireInteraction: true
                            })
                        } else if (Notification.permission === "default") {
                            // 권한 요청
                            Notification.requestPermission().then(permission => {
                                if (permission === "granted") {
                                    new Notification("⏰ 타이머 완료!", {
                                        body: "설정한 시간이 끝났습니다.",
                                        icon: "/favicon.ico",
                                        tag: "timer-finished",
                                        requireInteraction: true
                                    })
                                }
                            })
                        }
                        
                        // 4. 모바일 진동 (지원되는 경우)
                        if (navigator.vibrate) {
                            navigator.vibrate([200, 100, 200, 100, 200])
                        }
                        
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [timerState, timeLeft])

    // Stopwatch logic - Enhanced with interval and target notifications
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (stopwatchState === "running") {
            interval = setInterval(() => {
                setStopwatchTime((prev) => {
                    const newTime = prev + 10
                    
                    // 인터벌 알림 체크
                    if (intervalEnabled && intervalTime > 0) {
                        const currentInterval = Math.floor(newTime / intervalTime)
                        const lastInterval = Math.floor(prev / intervalTime)
                        
                        if (currentInterval > lastInterval && currentInterval > 0) {
                            // 인터벌 도달 알림
                            if (soundEnabled) {
                                try {
                                    const audioContext = getAudioContext()
                                    const oscillator = audioContext.createOscillator()
                                    const gainNode = audioContext.createGain()
                                    
                                    oscillator.connect(gainNode)
                                    gainNode.connect(audioContext.destination)
                                    
                                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
                                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
                                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
                                    
                                    oscillator.start(audioContext.currentTime)
                                    oscillator.stop(audioContext.currentTime + 0.3)
                                } catch (error) {
                                    console.log('인터벌 사운드 재생 실패:', error)
                                }
                            }
                            
                            showToast({ 
                                type: 'info', 
                                title: '인터벌 알림', 
                                message: `인터벌 ${currentInterval} 도달! ⏰` 
                            })
                            
                            // 진동 (모바일)
                            if (navigator.vibrate) {
                                navigator.vibrate([100, 50, 100])
                            }
                        }
                    }
                    
                    // 목표 시간 달성 체크
                    if (targetEnabled && targetTime > 0 && prev < targetTime && newTime >= targetTime) {
                        // 목표 달성 알림
                        if (soundEnabled) {
                            try {
                                const audioContext = getAudioContext()
                                // 성공 사운드 (상승하는 멜로디)
                                ;[523, 659, 784, 1047].forEach((freq, index) => {
                                    const oscillator = audioContext.createOscillator()
                                    const gainNode = audioContext.createGain()
                                    
                                    oscillator.connect(gainNode)
                                    gainNode.connect(audioContext.destination)
                                    
                                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15)
                                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + index * 0.15)
                                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.2)
                                    
                                    oscillator.start(audioContext.currentTime + index * 0.15)
                                    oscillator.stop(audioContext.currentTime + index * 0.15 + 0.2)
                                })
                            } catch (error) {
                                console.log('목표 달성 사운드 재생 실패:', error)
                            }
                        }
                        
                        showToast({ 
                            type: 'success', 
                            title: '목표 달성!', 
                            message: '🎯 목표 시간에 도달했습니다! 축하합니다!' 
                        })
                        
                        // 진동 (모바일)
                        if (navigator.vibrate) {
                            navigator.vibrate([200, 100, 200, 100, 200])
                        }
                        
                        // 브라우저 알림
                        if (Notification.permission === 'granted') {
                            new Notification('목표 달성!', {
                                body: `목표 시간 ${Math.floor(targetTime / 60000)}:${String(Math.floor((targetTime % 60000) / 1000)).padStart(2, '0')}에 도달했습니다!`,
                                icon: '/favicon.ico'
                            })
                        }
                    }
                    
                    return newTime
                })
            }, 10)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [stopwatchState, intervalEnabled, intervalTime, targetEnabled, targetTime, soundEnabled, getAudioContext])

    const formatTime = useCallback((totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60
        return {
            hours: h.toString().padStart(2, "0"),
            minutes: m.toString().padStart(2, "0"),
            seconds: s.toString().padStart(2, "0"),
        }
    }, [])

    const formatStopwatchTime = useCallback((milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000)
        const ms = Math.floor((milliseconds % 1000) / 10)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return {
            minutes: minutes.toString().padStart(2, "0"),
            seconds: seconds.toString().padStart(2, "0"),
            milliseconds: ms.toString().padStart(2, "0"),
        }
    }, [])

    const formatCurrentTime = useCallback((date: Date) => {
        return {
            time: date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }),
            period: date.getHours() >= 12 ? "PM" : "AM",
            timezone: "Korean Standard Time",
        }
    }, [])

    // Timer functions
    const startTimer = useCallback(() => {
        if (timerState === "idle") {
            const totalSeconds = hours * 3600 + minutes * 60 + seconds
            if (totalSeconds > 0) {
                setTimeLeft(totalSeconds)
                setTimerState("running")
            }
        } else if (timerState === "paused") {
            setTimerState("running")
        }
    }, [hours, minutes, seconds, timerState])

    const pauseTimer = useCallback(() => {
        setTimerState("paused")
    }, [])

    const resetTimer = useCallback(() => {
        setTimerState("idle")
        setTimeLeft(0)
    }, [])

    const adjustTime = useCallback(
        (type: "hours" | "minutes" | "seconds", increment: boolean) => {
            if (timerState !== "idle") return

            const setValue = type === "hours" ? setHours : type === "minutes" ? setMinutes : setSeconds
            const maxValue = type === "hours" ? 23 : 59

            setValue((prev) => {
                if (increment) {
                    return prev >= maxValue ? 0 : prev + 1
                } else {
                    return prev <= 0 ? maxValue : prev - 1
                }
            })
        },
        [timerState],
    )

    // Stopwatch functions
    const startStopwatch = useCallback(() => {
        setStopwatchState("running")
    }, [])

    const pauseStopwatch = useCallback(() => {
        setStopwatchState("paused")
    }, [])

    const resetStopwatch = useCallback(() => {
        setStopwatchState("idle")
        setStopwatchTime(0)
        setLapTimes([])
        setLapCounter(0)
    }, [])

    const addLap = useCallback(() => {
        if (stopwatchState === "running") {
            const newLap: LapTime = {
                id: Date.now().toString(),
                time: stopwatchTime, // 절대 시간 저장 (누적 시간)
                lapNumber: lapCounter + 1,
            }
            setLapTimes((prev) => [newLap, ...prev])
            setLapCounter((prev) => prev + 1)
        }
    }, [stopwatchState, stopwatchTime, lapCounter])

    // Alarm functions
    const toggleAlarm = useCallback((id: string) => {
        setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)))
    }, [])

    const addAlarm = useCallback(() => {
        if (newAlarmTime && newAlarmLabel) {
            const newAlarm: AlarmItem = {
                id: Date.now().toString(),
                time: newAlarmTime,
                label: newAlarmLabel,
                enabled: true,
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            }
            setAlarms((prev) => [...prev, newAlarm])
            setNewAlarmTime("12:00")
            setNewAlarmLabel("")
            setShowAddAlarm(false)
        }
    }, [newAlarmTime, newAlarmLabel])

    const deleteAlarm = useCallback((id: string) => {
        setAlarms((prev) => prev.filter((alarm) => alarm.id !== id))
    }, [])

    // 메모이제이션으로 성능 최적화
    const currentTimeDisplay = useMemo(() => formatCurrentTime(currentTime), [currentTime])
    
    const timerDisplay = useMemo(() => 
        formatTime(timeLeft > 0 ? timeLeft : hours * 3600 + minutes * 60 + seconds), 
        [timeLeft, hours, minutes, seconds]
    )
    
    const stopwatchDisplay = useMemo(() => formatStopwatchTime(stopwatchTime), [stopwatchTime])
    
    const progress = useMemo(() => {
        const totalTime = hours * 3600 + minutes * 60 + seconds
        return timeLeft > 0 ? (timeLeft / totalTime) * 100 : 100
    }, [timeLeft, hours, minutes, seconds])

    // 랩 타임 통계 메모이제이션
    const lapStats = useMemo(() => {
        if (lapTimes.length === 0) return null
        
        // 분할 시간 계산
        const splitTimes = lapTimes.map((lap, index) => {
            const prevTime = index < lapTimes.length - 1 ? lapTimes[index + 1].time : 0
            return lap.time - prevTime
        })
        
        return {
            fastest: Math.min(...splitTimes),
            slowest: Math.max(...splitTimes),
            splitTimes
        }
    }, [lapTimes])

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-gray-900 md:flex">
            <ToastContainer />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className={`flex-1 transition-all duration-500 ease-out ${sidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
                {/* 헤더 with 툴바 - 개선된 레이아웃 */}
                <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="w-10 md:hidden"></div>
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                            >
                                {activeTab === "alarm" && <Alarm className="h-5 w-5 text-white" />}
                                {activeTab === "stopwatch" && <Clock className="h-5 w-5 text-white" />}
                                {activeTab === "timer" && <TimerIcon className="h-5 w-5 text-white" />}
                            </motion.div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 capitalize">
                                    {activeTab === "alarm" && "알람"}
                                    {activeTab === "stopwatch" && "스톱워치"}
                                    {activeTab === "timer" && "타이머"}
                                </h1>
                                <p className="text-xs text-gray-500">시간 관리 도구</p>
                            </div>
                        </div>
                        <div className="w-9"></div>
                    </div>

                                        {/* 툴바 - 세그먼트 컨트롤 스타일 */}
                    <div className="px-4 pb-4 flex justify-center">
                        <div className="inline-flex bg-gray-100/80 backdrop-blur-sm rounded-full p-1.5 shadow-inner">
                            {[
                                { icon: Alarm, label: "알람", tab: "alarm" as ActiveTab },
                                { icon: Clock, label: "스톱워치", tab: "stopwatch" as ActiveTab },
                                { icon: TimerIcon, label: "타이머", tab: "timer" as ActiveTab },
                            ].map(({ icon: Icon, label, tab }) => (
                                <motion.button
                                    key={tab}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                                        activeTab === tab 
                                            ? "bg-gray-800 text-white shadow-lg shadow-gray-800/25" 
                                            : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                    
                                    {/* 선택된 탭의 배경 애니메이션 */}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gray-800 rounded-full -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* 메인 컨텐츠 */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
                    {/* Background decoration elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-600/5 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "alarm" && (
                            <motion.div
                                key="alarm"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-md"
                            >
                                {/* 알람 탭 내용 - 기존 renderAlarmTab() 내용 */}
                                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-6">
                                    {/* Current Time Display - Material Design 3 */}
                                    <motion.div variants={itemVariants} className="text-center mb-8 w-full">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[28px] p-6 md:p-8 border border-blue-100/50 shadow-lg shadow-blue-500/10 max-w-full overflow-hidden">
                                            <motion.div
                                                key={currentTimeDisplay.time}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-3 tracking-tight font-mono"
                                                style={{ 
                                                    fontFeatureSettings: '"tnum"',
                                                    letterSpacing: '-0.01em',
                                                    lineHeight: '1.1'
                                                }}
                                            >
                                                <div className="break-all">{currentTimeDisplay.time}</div>
                                                <div className="text-xl md:text-2xl lg:text-3xl text-blue-600 font-sans mt-1">{currentTimeDisplay.period}</div>
                                            </motion.div>
                                            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm font-medium text-gray-700">{currentTimeDisplay.timezone}</span>
                                                </div>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                <span className="text-sm text-gray-500">실시간</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Alarms List */}
                                    <motion.div variants={itemVariants} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-gray-900 font-semibold text-lg">알람</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowAddAlarm(true)}
                                                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </motion.button>
                                        </div>

                                        <div className="space-y-3">
                                            {alarms.map((alarm) => (
                                                <motion.div
                                                    key={alarm.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-md shadow-gray-900/5"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-2xl font-mono text-gray-900" style={{ fontFeatureSettings: '"tnum"' }}>
                                                                {alarm.time}
                                                            </div>
                                                            <div className="text-sm text-gray-600">{alarm.label}</div>
                                                            <div className="text-xs text-gray-400 mt-1">{alarm.days.join(", ")}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => toggleAlarm(alarm.id)}
                                                                className={`w-12 h-6 rounded-full transition-all ${alarm.enabled ? "bg-green-500" : "bg-gray-300"}`}
                                                            >
                                                                <div
                                                                    className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${
                                                                        alarm.enabled ? "translate-x-6" : "translate-x-0.5"
                                                                    }`}
                                                                />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => deleteAlarm(alarm.id)}
                                                                className="text-red-500 hover:text-red-400 text-sm"
                                                            >
                                                                ✕
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Add Alarm Form */}
                                        <AnimatePresence>
                                            {showAddAlarm && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg"
                                                >
                                                    <div className="space-y-4">
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                value={newAlarmTime}
                                                                onChange={(e) => setNewAlarmTime(e.target.value)}
                                                                className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 rounded-xl px-4 py-3 border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono text-lg tracking-wider transition-all"
                                                                style={{ fontFeatureSettings: '"tnum"' }}
                                                            />
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                                                <Clock className="h-5 w-5" />
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="알람 레이블"
                                                            value={newAlarmLabel}
                                                            onChange={(e) => setNewAlarmLabel(e.target.value)}
                                                            className="w-full bg-gray-50 text-gray-900 rounded-lg px-3 py-2 border border-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                                        />
                                                        <div className="flex gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={addAlarm}
                                                                className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg"
                                                            >
                                                                추가
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => setShowAddAlarm(false)}
                                                                className="flex-1 py-2 bg-gray-500 text-white rounded-lg font-medium shadow-lg"
                                                            >
                                                                취소
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                        
                        {activeTab === "stopwatch" && (
                            <motion.div
                                key="stopwatch"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="w-full min-h-full"
                            >
                                {/* 배경 그라데이션 확장 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 -z-10"></div>
                                
                                {/* 스톱워치 탭 내용 */}
                                <motion.div 
                                    variants={containerVariants} 
                                    initial="hidden" 
                                    animate="visible" 
                                    className="w-full max-w-md mx-auto space-y-8 pb-8"
                                >
                                    {/* Stopwatch Display */}
                                    <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
                                        <div className="text-center mb-8">
                                            {/* 상태 표시 */}
                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    stopwatchState === "running" ? "bg-green-500 animate-pulse" :
                                                    stopwatchState === "paused" ? "bg-yellow-500" :
                                                    "bg-gray-400"
                                                }`}></div>
                                                <span className="text-sm font-medium text-gray-600">
                                                    {stopwatchState === "running" ? "측정 중" :
                                                     stopwatchState === "paused" ? "일시정지" :
                                                     "대기 중"}
                                                </span>
                                                {soundEnabled && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                                        className="ml-auto text-gray-500 hover:text-blue-600"
                                                    >
                                                        🔊
                                                    </motion.button>
                                                )}
                                            </div>

                                            {/* 메인 시간 디스플레이 */}
                                            <motion.div
                                                key={`${stopwatchDisplay.minutes}:${stopwatchDisplay.seconds}:${stopwatchDisplay.milliseconds}`}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className={`text-5xl sm:text-6xl font-mono mb-4 tracking-wider transition-colors ${
                                                    targetEnabled && stopwatchTime >= targetTime ? "text-green-600" : "text-gray-900"
                                                }`}
                                                style={{ fontFeatureSettings: '"tnum"' }}
                                            >
                                                {stopwatchDisplay.minutes}:{stopwatchDisplay.seconds}
                                                <span className="text-3xl text-gray-500">.{stopwatchDisplay.milliseconds}</span>
                                            </motion.div>

                                            {/* 목표 시간 진행률 */}
                                            {targetEnabled && targetTime > 0 && (
                                                <div className="mb-4">
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        목표: {Math.floor(targetTime / 60000)}:{String(Math.floor((targetTime % 60000) / 1000)).padStart(2, '0')}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                stopwatchTime >= targetTime ? "bg-green-500" : "bg-blue-500"
                                                            }`}
                                                            style={{ width: `${Math.min(100, (stopwatchTime / targetTime) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {Math.round((stopwatchTime / targetTime) * 100)}% 달성
                                                    </div>
                                                </div>
                                            )}

                                            {/* 인터벌 알림 */}
                                            {intervalEnabled && intervalTime > 0 && (
                                                <div className="text-sm text-gray-600 mb-4">
                                                    다음 인터벌: {Math.floor((intervalTime - (stopwatchTime % intervalTime)) / 1000)}초 후
                                                </div>
                                            )}
                                        </div>

                                        {/* Control Buttons - 모바일 최적화 */}
                                        <div className="space-y-4">
                                            {stopwatchState === "idle" && (
                                                <div className="flex justify-center">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={startStopwatch}
                                                        className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[16px] font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                                                    >
                                                        <Play className="h-5 w-5" />
                                                        <span>시작</span>
                                                    </motion.button>
                                                </div>
                                            )}

                                            {stopwatchState === "running" && (
                                                <div className="space-y-3">
                                                    <div className="flex justify-center">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={pauseStopwatch}
                                                            className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-[16px] font-semibold shadow-lg shadow-amber-500/25 transition-all"
                                                        >
                                                            <Pause className="h-5 w-5" />
                                                            <span>일시정지</span>
                                                        </motion.button>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={addLap}
                                                            className="flex items-center justify-center gap-3 w-full max-w-[200px] h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[16px] font-medium shadow-md shadow-indigo-500/20 transition-all"
                                                        >
                                                            <Flag className="h-4 w-4" />
                                                            <span>랩 기록</span>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}

                                            {stopwatchState === "paused" && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={startStopwatch}
                                                            className="flex items-center justify-center gap-2 flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[16px] font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                                                        >
                                                            <Play className="h-5 w-5" />
                                                            <span>재개</span>
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={resetStopwatch}
                                                            className="flex items-center justify-center gap-2 flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-[16px] font-semibold shadow-lg shadow-rose-500/25 transition-all"
                                                        >
                                                            <RotateCcw className="h-5 w-5" />
                                                            <span>초기화</span>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* 스톱워치 설정 패널 */}
                                    <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">고급 설정</h3>
                                        
                                        <div className="space-y-6">
                                            {/* 목표 시간 설정 */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-gray-700">목표 시간</label>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setTargetEnabled(!targetEnabled)}
                                                        className={`w-10 h-6 rounded-full transition-all ${targetEnabled ? "bg-blue-500" : "bg-gray-300"}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${
                                                            targetEnabled ? "translate-x-5" : "translate-x-0.5"
                                                        }`} />
                                                    </motion.button>
                                                </div>
                                                {targetEnabled && (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={Math.floor(targetTime / 60000)}
                                                            onChange={(e) => setTargetTime(parseInt(e.target.value || "0") * 60000 + (targetTime % 60000))}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                                            placeholder="분"
                                                        />
                                                        <span className="self-center text-gray-500">:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={Math.floor((targetTime % 60000) / 1000)}
                                                            onChange={(e) => setTargetTime(Math.floor(targetTime / 60000) * 60000 + parseInt(e.target.value || "0") * 1000)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                                            placeholder="초"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 인터벌 알림 설정 */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-gray-700">인터벌 알림</label>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setIntervalEnabled(!intervalEnabled)}
                                                        className={`w-10 h-6 rounded-full transition-all ${intervalEnabled ? "bg-green-500" : "bg-gray-300"}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${
                                                            intervalEnabled ? "translate-x-5" : "translate-x-0.5"
                                                        }`} />
                                                    </motion.button>
                                                </div>
                                                {intervalEnabled && (
                                                    <div className="flex gap-2 flex-wrap">
                                                        {[30, 60, 120, 300].map((seconds) => (
                                                            <motion.button
                                                                key={seconds}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setIntervalTime(seconds * 1000)}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                                    intervalTime === seconds * 1000 
                                                                        ? "bg-green-500 text-white" 
                                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                }`}
                                                            >
                                                                {seconds < 60 ? `${seconds}초` : `${seconds / 60}분`}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 빠른 액션 버튼들 */}
                                            <div className="flex gap-2 flex-wrap">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setTargetTime(300000) // 5분
                                                        setTargetEnabled(true)
                                                    }}
                                                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all"
                                                >
                                                    🎯 5분 목표
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setIntervalTime(60000) // 1분
                                                        setIntervalEnabled(true)
                                                    }}
                                                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all"
                                                >
                                                    ⏰ 1분 알림
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setTargetEnabled(false)
                                                        setIntervalEnabled(false)
                                                    }}
                                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                                                >
                                                    🚫 모두 끄기
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Lap Times - Enhanced */}
                                    {lapTimes.length > 0 && (
                                        <motion.div variants={itemVariants} className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                                                    <Flag className="h-5 w-5 text-blue-600" />
                                                    랩 타임 ({lapTimes.length})
                                                </h3>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => {
                                                            setLapTimes([])
                                                            setLapCounter(0)
                                                        }}
                                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full transition-colors"
                                                    >
                                                        🗑️ 전체 삭제
                                                    </motion.button>
                                                </div>
                                            </div>
                                            
                                            {/* 통계 정보 - 확장 */}
                                            {lapTimes.length > 1 && (
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600 block">🏆 최고 기록</span>
                                                            <div className="font-mono text-green-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const fastestDisplay = formatStopwatchTime(lapStats.fastest)
                                                                    return `${fastestDisplay.minutes}:${fastestDisplay.seconds}.${fastestDisplay.milliseconds}`
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 block">🐌 최저 기록</span>
                                                            <div className="font-mono text-red-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const slowestDisplay = formatStopwatchTime(lapStats.slowest)
                                                                    return `${slowestDisplay.minutes}:${slowestDisplay.seconds}.${slowestDisplay.milliseconds}`
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 block">📊 평균 시간</span>
                                                            <div className="font-mono text-blue-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const avgTime = lapStats.splitTimes.reduce((a, b) => a + b, 0) / lapStats.splitTimes.length
                                                                    const avgDisplay = formatStopwatchTime(avgTime)
                                                                    return `${avgDisplay.minutes}:${avgDisplay.seconds}.${avgDisplay.milliseconds}`
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 block">🎯 일관성</span>
                                                            <div className="font-mono text-purple-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const variance = lapStats.splitTimes.reduce((sum, time) => {
                                                                        const avg = lapStats.splitTimes.reduce((a, b) => a + b, 0) / lapStats.splitTimes.length
                                                                        return sum + Math.pow(time - avg, 2)
                                                                    }, 0) / lapStats.splitTimes.length
                                                                    const consistency = Math.max(0, 100 - Math.sqrt(variance) / 1000)
                                                                    return `${Math.round(consistency)}%`
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="max-h-64 overflow-y-auto space-y-2">
                                                {lapTimes.slice().reverse().map((lap, index) => {
                                                    const originalIndex = lapTimes.length - 1 - index
                                                    const splitTime = lapStats?.splitTimes[originalIndex] || 0
                                                    const lapDisplay = formatStopwatchTime(splitTime)
                                                    const isLatest = index === 0
                                                    const isFastest = lapStats && splitTime === lapStats.fastest && lapTimes.length > 1
                                                    const isSlowest = lapStats && splitTime === lapStats.slowest && lapTimes.length > 1
                                                    
                                                    return (
                                                        <motion.div
                                                            key={lap.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`rounded-xl p-4 border shadow-sm transition-all ${
                                                                isLatest 
                                                                    ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100" 
                                                                    : isFastest
                                                                    ? "bg-green-50 border-green-200"
                                                                    : isSlowest  
                                                                    ? "bg-red-50 border-red-200"
                                                                    : "bg-white border-gray-200"
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`text-sm font-medium ${
                                                                        isLatest ? "text-blue-700" : "text-gray-600"
                                                                    }`}>
                                                                        랩 {lap.lapNumber}
                                                                    </span>
                                                                    {isFastest && (
                                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                                            🏆 최고
                                                                        </span>
                                                                    )}
                                                                    {isSlowest && (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                                                            🐌 최저
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`font-mono text-lg font-semibold ${
                                                                        isLatest ? "text-blue-900" : "text-gray-900"
                                                                    }`} style={{ fontFeatureSettings: '"tnum"' }}>
                                                                        {lapDisplay.minutes}:{lapDisplay.seconds}.{lapDisplay.milliseconds}
                                                                    </span>
                                                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                                                        총 {(() => {
                                                                            const totalDisplay = formatStopwatchTime(lap.time)
                                                                            return `${totalDisplay.minutes}:${totalDisplay.seconds}.${totalDisplay.milliseconds}`
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                        
                        {activeTab === "timer" && (
                            <motion.div
                                key="timer"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-md"
                            >
                                {/* 타이머 탭 내용 */}
                                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8">
                                    {/* Current Time Display - Material Design 3 */}
                                    <motion.div variants={itemVariants} className="text-center mb-8 w-full">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[28px] p-6 md:p-8 border border-blue-100/50 shadow-lg shadow-blue-500/10 max-w-full overflow-hidden">
                                            <motion.div
                                                key={currentTimeDisplay.time}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-3 tracking-tight font-mono"
                                                style={{ 
                                                    fontFeatureSettings: '"tnum"',
                                                    letterSpacing: '-0.01em',
                                                    lineHeight: '1.1'
                                                }}
                                            >
                                                <div className="break-all">{currentTimeDisplay.time}</div>
                                                <div className="text-xl md:text-2xl lg:text-3xl text-blue-600 font-sans mt-1">{currentTimeDisplay.period}</div>
                                            </motion.div>
                                            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm font-medium text-gray-700">{currentTimeDisplay.timezone}</span>
                                                </div>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                <span className="text-sm text-gray-500">실시간</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Timer Display */}
                                    <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
                                        <div className="text-center mb-8">
                                            <motion.div
                                                key={`${timerDisplay.hours}:${timerDisplay.minutes}:${timerDisplay.seconds}`}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className="text-4xl sm:text-5xl font-mono text-gray-900 mb-4 tracking-wider"
                                                style={{ fontFeatureSettings: '"tnum"' }}
                                            >
                                                {timerDisplay.hours}:{timerDisplay.minutes}:{timerDisplay.seconds}
                                            </motion.div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                                                <motion.div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                                    initial={{ width: "100%" }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Quick Preset Buttons */}
                                        {timerState === "idle" && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-6"
                                            >
                                                <p className="text-gray-500 text-sm font-medium mb-3 text-center">빠른 설정</p>
                                                <div className="grid grid-cols-4 gap-2 mb-6">
                                                    {[
                                                        { label: "5분", minutes: 5 },
                                                        { label: "10분", minutes: 10 },
                                                        { label: "15분", minutes: 15 },
                                                        { label: "25분", minutes: 25 },
                                                        { label: "30분", minutes: 30 },
                                                        { label: "45분", minutes: 45 },
                                                        { label: "1시간", minutes: 60 },
                                                        { label: "2시간", minutes: 120 }
                                                    ].map(({ label, minutes: presetMinutes }) => (
                                                        <motion.button
                                                            key={label}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                const totalMinutes = presetMinutes
                                                                setHours(Math.floor(totalMinutes / 60))
                                                                setMinutes(totalMinutes % 60)
                                                                setSeconds(0)
                                                            }}
                                                            className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all shadow-sm hover:shadow-md"
                                                        >
                                                            {label}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Time Adjustment Controls - 개선된 접근성 */}
                                        {timerState === "idle" && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid grid-cols-3 gap-6 mb-8"
                                            >
                                                {[
                                                    { label: "시간", value: hours, type: "hours" as const },
                                                    { label: "분", value: minutes, type: "minutes" as const },
                                                    { label: "초", value: seconds, type: "seconds" as const },
                                                ].map(({ label, value, type }) => (
                                                    <div key={type} className="text-center">
                                                        <p className="text-gray-500 text-sm font-medium mb-3">{label}</p>
                                                        <div className="flex flex-col items-center gap-3">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => adjustTime(type, true)}
                                                                className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center text-gray-700 transition-all"
                                                                aria-label={`${label} 증가`}
                                                            >
                                                                <Plus className="h-5 w-5" />
                                                            </motion.button>
                                                            <div className="bg-gray-50 rounded-xl px-4 py-2 min-w-[60px] relative">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={type === "hours" ? 23 : 59}
                                                                    value={value}
                                                                    onChange={(e) => {
                                                                        const newValue = parseInt(e.target.value) || 0
                                                                        const maxValue = type === "hours" ? 23 : 59
                                                                        const clampedValue = Math.min(Math.max(0, newValue), maxValue)
                                                                        
                                                                        if (type === "hours") setHours(clampedValue)
                                                                        else if (type === "minutes") setMinutes(clampedValue)
                                                                        else setSeconds(clampedValue)
                                                                    }}
                                                                    className="w-full text-3xl font-mono text-gray-900 text-center bg-transparent border-none outline-none appearance-none"
                                                                    style={{ 
                                                                        fontFeatureSettings: '"tnum"',
                                                                        MozAppearance: 'textfield' // Firefox에서 스피너 제거
                                                                    }}
                                                                />
                                                                {/* 웹킷 브라우저에서 스피너 제거 */}
                                                                <style jsx>{`
                                                                    input::-webkit-outer-spin-button,
                                                                    input::-webkit-inner-spin-button {
                                                                        -webkit-appearance: none;
                                                                        margin: 0;
                                                                    }
                                                                `}</style>
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => adjustTime(type, false)}
                                                                className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center text-gray-700 transition-all"
                                                                aria-label={`${label} 감소`}
                                                            >
                                                                <Minus className="h-5 w-5" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Control Buttons - 모바일 최적화 */}
                                        <div className="space-y-4">
                                            {timerState === "idle" && (
                                                <div className="flex justify-center">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={startTimer}
                                                        disabled={hours === 0 && minutes === 0 && seconds === 0}
                                                        className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-white rounded-[16px] font-semibold shadow-lg shadow-violet-500/25 disabled:shadow-gray-400/25 transition-all disabled:cursor-not-allowed"
                                                    >
                                                        <Play className="h-5 w-5" />
                                                        <span>시작</span>
                                                    </motion.button>
                                                </div>
                                            )}

                                            {timerState === "running" && (
                                                <div className="flex justify-center">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={pauseTimer}
                                                        className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-[16px] font-semibold shadow-lg shadow-orange-500/25 transition-all"
                                                    >
                                                        <Pause className="h-5 w-5" />
                                                        <span>일시정지</span>
                                                    </motion.button>
                                                </div>
                                            )}

                                            {timerState === "paused" && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={startTimer}
                                                            className="flex items-center justify-center gap-2 flex-1 h-14 bg-violet-500 hover:bg-violet-600 text-white rounded-[16px] font-semibold shadow-lg shadow-violet-500/25 transition-all"
                                                        >
                                                            <Play className="h-5 w-5" />
                                                            <span>재개</span>
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={resetTimer}
                                                            className="flex items-center justify-center gap-2 flex-1 h-14 bg-slate-500 hover:bg-slate-600 text-white rounded-[16px] font-semibold shadow-lg shadow-slate-500/25 transition-all"
                                                        >
                                                            <RotateCcw className="h-5 w-5" />
                                                            <span>초기화</span>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
