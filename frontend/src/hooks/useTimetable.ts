import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { showToast } from '@/app/components/toast'

import type { Subject } from './useSubjects'

export interface TimetableSlot {
  dayofweek: string
  starttime: string
  endtime: string
  subject: Subject
}

export const useTimetable = (userId: string | null) => {
  // 현재 사용자 시간표 슬롯 목록
  const [timetable, setTimetable] = useState<TimetableSlot[]>([])
  // 로딩 및 저장 상태
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * 시간표 슬롯 불러오기
   */
  const loadTimetable = useCallback(async (uid: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('timetable_slots')
        .select(`id, dayofweek, starttime, endtime, subject:subjects ( id, name, dayofweek, starttime, endtime, required, user_id )`)
        .eq('user_id', uid)
        .order('starttime')

      if (error) throw error

      const formatted: TimetableSlot[] = (data || []).map((row: any) => ({
        dayofweek: row.dayofweek,
        starttime: row.starttime,
        endtime: row.endtime,
        subject: row.subject as Subject,
      }))

      setTimetable(formatted)
    } catch (err) {
      console.error('📥 시간표 로드 실패:', err)
      showToast({
        type: 'error',
        title: '시간표 로드 실패',
        message: '시간표를 불러오는 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 시간표 저장 (기존 슬롯 전부 삭제 후 새로 삽입)
   */
  const saveTimetable = useCallback(
    async (timetableSlots: TimetableSlot[]) => {
      if (!userId) {
        throw new Error('로그인이 필요합니다.')
      }
      try {
        setIsSaving(true)
        // 1. 기존 시간표 삭제
        const { error: deleteError } = await supabase
          .from('timetable_slots')
          .delete()
          .eq('user_id', userId)
        if (deleteError) throw deleteError

        // 2. 새 시간표 삽입
        const { error: insertError } = await supabase.from('timetable_slots').insert(
          timetableSlots.map((slot) => ({
            user_id: userId,
            subject_id: slot.subject.id,
            dayofweek: slot.dayofweek,
            starttime: slot.starttime,
            endtime: slot.endtime,
          })),
        )
        if (insertError) throw insertError

        showToast({
          type: 'success',
          title: '시간표 저장 완료',
          message: `${timetableSlots.length}개 과목으로 시간표가 저장되었습니다.`,
        })

        // 저장 후 최신 데이터 다시 불러오기
        await loadTimetable(userId)
      } catch (err) {
        console.error('⛔ 시간표 저장 오류:', err)
        showToast({
          type: 'error',
          title: '시간표 저장 실패',
          message: '저장 중 오류가 발생했습니다.',
        })
        throw err // 상위에서 필요 시 핸들링할 수 있도록 재throw
      } finally {
        setIsSaving(false)
      }
    },
    [userId, loadTimetable],
  )

  // userId 변경 시 자동 로드
  useEffect(() => {
    if (userId) {
      loadTimetable(userId)
    } else {
      // 로그아웃 시 초기화
      setTimetable([])
    }
  }, [userId, loadTimetable])

  return {
    timetable,
    isLoading,
    isSaving,
    loadTimetable,
    saveTimetable,
  }
} 