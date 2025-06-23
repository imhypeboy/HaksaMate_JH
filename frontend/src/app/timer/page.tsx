"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Plus, Minus, Clock, TimerIcon, AlarmClockIcon as Alarm, Flag } from "lucide-react"

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
            type: "spring",
            stiffness: 300,
            damping: 25,
        },
    },
}

export default function TimerApp() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("timer")
    const [currentTime, setCurrentTime] = useState(new Date())

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

    // Timer countdown logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (timerState === "running" && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setTimerState("idle")
                        // Timer finished notification
                        alert("Timer finished!")
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

    // Stopwatch logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (stopwatchState === "running") {
            interval = setInterval(() => {
                setStopwatchTime((prev) => prev + 10)
            }, 10)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [stopwatchState])

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
                time: stopwatchTime,
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

    const currentTimeDisplay = formatCurrentTime(currentTime)
    const timerDisplay = formatTime(timeLeft > 0 ? timeLeft : hours * 3600 + minutes * 60 + seconds)
    const stopwatchDisplay = formatStopwatchTime(stopwatchTime)
    const progress = timeLeft > 0 ? (timeLeft / (hours * 3600 + minutes * 60 + seconds)) * 100 : 100

    const renderAlarmTab = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-6">
            {/* Current Time Display */}
            <motion.div variants={itemVariants} className="text-center mb-8">
                <motion.div
                    key={currentTimeDisplay.time}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-6xl sm:text-7xl font-light text-gray-900 mb-2 tracking-wider"
                >
                    {currentTimeDisplay.time}
                    <span className="text-2xl sm:text-3xl text-gray-500 ml-2">{currentTimeDisplay.period}</span>
                </motion.div>
                <p className="text-gray-500 text-sm">{currentTimeDisplay.timezone}</p>
            </motion.div>

            {/* Alarms List */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-semibold text-lg">Alarms</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddAlarm(true)}
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                    </motion.button>
                </div>

                <div className="space-y-3">
                    {alarms.map((alarm) => (
                        <motion.div
                            key={alarm.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-2xl font-mono text-gray-900">{alarm.time}</div>
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
                                <input
                                    type="time"
                                    value={newAlarmTime}
                                    onChange={(e) => setNewAlarmTime(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-900 rounded-lg px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Alarm label"
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
                                        Add
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowAddAlarm(false)}
                                        className="flex-1 py-2 bg-gray-500 text-white rounded-lg font-medium shadow-lg"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )

    const renderStopwatchTab = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8">
            {/* Stopwatch Display */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
                <div className="text-center mb-8">
                    <motion.div
                        key={`${stopwatchDisplay.minutes}:${stopwatchDisplay.seconds}:${stopwatchDisplay.milliseconds}`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-5xl sm:text-6xl font-mono text-gray-900 mb-4 tracking-wider"
                    >
                        {stopwatchDisplay.minutes}:{stopwatchDisplay.seconds}
                        <span className="text-3xl text-gray-500">.{stopwatchDisplay.milliseconds}</span>
                    </motion.div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                    {stopwatchState === "idle" && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startStopwatch}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                        >
                            <Play className="h-5 w-5" />
                            Start
                        </motion.button>
                    )}

                    {stopwatchState === "running" && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addLap}
                                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <Flag className="h-5 w-5" />
                                Lap
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={pauseStopwatch}
                                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <Pause className="h-5 w-5" />
                                Pause
                            </motion.button>
                        </>
                    )}

                    {stopwatchState === "paused" && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startStopwatch}
                                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <Play className="h-5 w-5" />
                                Resume
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetStopwatch}
                                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Reset
                            </motion.button>
                        </>
                    )}

                    {stopwatchState !== "idle" && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetStopwatch}
                            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Lap Times */}
            {lapTimes.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-3">
                    <h3 className="text-gray-900 font-semibold text-lg">Lap Times</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {lapTimes.map((lap) => {
                            const lapDisplay = formatStopwatchTime(lap.time)
                            return (
                                <motion.div
                                    key={lap.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-xl p-3 border border-gray-200 shadow-lg flex justify-between items-center"
                                >
                                    <span className="text-gray-600">Lap {lap.lapNumber}</span>
                                    <span className="text-gray-900 font-mono">
                    {lapDisplay.minutes}:{lapDisplay.seconds}.{lapDisplay.milliseconds}
                  </span>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )

    const renderTimerTab = () => (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8">
            {/* Current Time Display */}
            <motion.div variants={itemVariants} className="text-center mb-12">
                <motion.div
                    key={currentTimeDisplay.time}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-6xl sm:text-7xl font-light text-gray-900 mb-2 tracking-wider"
                >
                    {currentTimeDisplay.time}
                    <span className="text-2xl sm:text-3xl text-gray-500 ml-2">{currentTimeDisplay.period}</span>
                </motion.div>
                <p className="text-gray-500 text-sm">{currentTimeDisplay.timezone}</p>
            </motion.div>

            {/* Timer Display */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
                <div className="text-center mb-8">
                    <motion.div
                        key={`${timerDisplay.hours}:${timerDisplay.minutes}:${timerDisplay.seconds}`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-4xl sm:text-5xl font-mono text-gray-900 mb-4 tracking-wider"
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

                {/* Time Adjustment Controls */}
                {timerState === "idle" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-3 gap-4 mb-8"
                    >
                        {[
                            { label: "Hours", value: hours, type: "hours" as const },
                            { label: "Minutes", value: minutes, type: "minutes" as const },
                            { label: "Seconds", value: seconds, type: "seconds" as const },
                        ].map(({ label, value, type }) => (
                            <div key={type} className="text-center">
                                <p className="text-gray-500 text-xs mb-2">{label}</p>
                                <div className="flex flex-col items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => adjustTime(type, true)}
                                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all border border-gray-200"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </motion.button>
                                    <div className="text-2xl font-mono text-gray-900 w-12 text-center">
                                        {value.toString().padStart(2, "0")}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => adjustTime(type, false)}
                                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all border border-gray-200"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                    {timerState === "idle" && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startTimer}
                            disabled={hours === 0 && minutes === 0 && seconds === 0}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
                        >
                            <Play className="h-5 w-5" />
                            Start
                        </motion.button>
                    )}

                    {timerState === "running" && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={pauseTimer}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                        >
                            <Pause className="h-5 w-5" />
                            Pause
                        </motion.button>
                    )}

                    {timerState === "paused" && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startTimer}
                                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <Play className="h-5 w-5" />
                                Resume
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetTimer}
                                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Reset
                            </motion.button>
                        </>
                    )}

                    {(timerState === "running" || timerState === "paused") && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetTimer}
                            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-bold shadow-lg transition-all"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden"
        >
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

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200"
                >
                    <div className="flex items-center justify-center px-6 py-4">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mr-3"
                        >
                            {activeTab === "alarm" && <Alarm className="h-4 w-4 text-white" />}
                            {activeTab === "stopwatch" && <Clock className="h-4 w-4 text-white" />}
                            {activeTab === "timer" && <TimerIcon className="h-4 w-4 text-white" />}
                        </motion.div>
                        <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                    </div>
                </motion.header>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                    <AnimatePresence mode="wait">
                        {activeTab === "alarm" && (
                            <motion.div
                                key="alarm"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderAlarmTab()}
                            </motion.div>
                        )}
                        {activeTab === "stopwatch" && (
                            <motion.div
                                key="stopwatch"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStopwatchTab()}
                            </motion.div>
                        )}
                        {activeTab === "timer" && (
                            <motion.div
                                key="timer"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderTimerTab()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Navigation */}
                <motion.nav
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="bg-white/80 backdrop-blur-xl border-t border-gray-200 px-6 py-4"
                >
                    <div className="flex justify-around items-center max-w-md mx-auto">
                        {[
                            { icon: Alarm, label: "Alarm", tab: "alarm" as ActiveTab },
                            { icon: Clock, label: "Stopwatch", tab: "stopwatch" as ActiveTab },
                            { icon: TimerIcon, label: "Timer", tab: "timer" as ActiveTab },
                        ].map(({ icon: Icon, label, tab }) => (
                            <motion.button
                                key={tab}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setActiveTab(tab)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                    activeTab === tab ? "text-blue-600" : "text-gray-400"
                                }`}
                            >
                                <Icon className="h-6 w-6" />
                                <span className="text-xs">{label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.nav>
            </div>
        </motion.div>
    )
}
