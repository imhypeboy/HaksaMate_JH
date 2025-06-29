"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Plus, BookOpen } from "lucide-react"
import { SubjectCard } from "./subject-card"
import { SubjectCardSkeleton } from "./loading-skeleton"
import type { Subject } from "@/hooks/useSubjects"

interface SubjectManagementProps {
  subjects: Subject[]
  isLoading: boolean
  days: Array<{ label: string; value: string; ko: string }>
  onEdit: (subject: Subject) => void
  onDelete: (id?: number) => void
  onAddClick: () => void
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

export function SubjectManagement({ subjects, isLoading, days, onEdit, onDelete, onAddClick }: SubjectManagementProps) {
  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="xl:w-[45%] space-y-4 sm:space-y-6"
    >
      <div className="backdrop-blur-xl bg-white/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/30 hover:bg-white/50 transition-all duration-500">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap"
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <BookOpen className="h-4 w-4 text-white" />
            </motion.div>
            <span className="whitespace-nowrap">등록된 과목</span>
            <span className="text-base sm:text-lg font-normal text-gray-500 bg-gray-100/80 px-3 py-1 rounded-full">
              {subjects.length}개
            </span>
          </motion.h2>

          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddClick}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50 backdrop-blur-sm border border-white/20 flex items-center justify-center"
            disabled={isLoading}
            aria-label="과목 추가"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>
        </div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <SubjectCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="text-8xl mb-6"
            >
              📚
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">아직 등록된 과목이 없어요</h3>
            <p className="text-gray-500 mb-6">과목을 추가해서 나만의 시간표를 만들어보세요</p>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg cursor-pointer"
              onClick={onAddClick}
            >
              <Plus className="h-4 w-4" />첫 번째 과목 추가하기
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  dayLabel={days.find((d) => d.value === subject.dayofweek)?.ko || ""}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
