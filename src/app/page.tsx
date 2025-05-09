'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Sidebar as ProSidebar } from 'react-pro-sidebar';
import Sidebar from './components/Sidebar';

import {
  Calendar,
  MessageSquare,
  Settings,
  Menu as MenuIcon, 
  X,
  Save,
  Trash2,
  Edit,
  PlusCircle
} from 'lucide-react';

// 과목 타입 정의
interface Subject {
  id: string;
  name: string;
  time: string;
  priority: number;
  color: string;
  professor?: string;
  location?: string;
}

// 시간표에 표시될 시간대 정의
const HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 9시부터 20시까지
const DAYS = ['월', '화', '수', '목', '금'];

// 색상 팔레트
const COLORS = [
  '#4f46e5', '#0284c7', '#0891b2', '#0d9488', '#10b981',
  '#84cc16', '#ca8a04', '#d97706', '#dc2626', '#7c3aed'
];

export default function Home() {
  // 상태 관리
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activePage, setActivePage] = useState<'timetable' | 'community' | 'settings'>('timetable');

  // React Hook Form 사용
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Subject>({
    defaultValues: {
      name: '',
      time: '',
      priority: 1,
      color: COLORS[0],
      professor: '',
      location: ''
    }
  });

  // 로컬 스토리지에서 과목 불러오기
  useEffect(() => {
    const savedSubjects = localStorage.getItem('timeTableSubjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  // 과목 저장 시 로컬 스토리지에 업데이트
  useEffect(() => {
    localStorage.setItem('timeTableSubjects', JSON.stringify(subjects));
  }, [subjects]);

  // 과목 추가/수정 처리
  const onSubmit = (data: Partial<Subject>) => {
    if (isEditing && currentSubject) {
      setSubjects(subjects.map(subject =>
        subject.id === currentSubject.id ? { ...subject, ...data } : subject
      ));
    } else {
      const newSubject: Subject = {
        ...data as Subject,
        id: Date.now().toString(),
        color: data.color || COLORS[Math.floor(Math.random() * COLORS.length)]
      };
      setSubjects([...subjects, newSubject]);
    }
    reset();
    setShowForm(false);
    setIsEditing(false);
    setCurrentSubject(null);
  };

  // 과목 편집 시작
  const handleEditSubject = (subject: Subject) => {
    setCurrentSubject(subject);
    setIsEditing(true);
    setShowForm(true);
    Object.entries(subject).forEach(([key, value]) => {
      setValue(key as keyof Subject, value);
    });
  };

  // 과목 삭제
  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
  };

  // 시간표에 과목 표시를 위한 파싱 함수
  const parseTimeSlot = (timeString: string) => {
    const result: { day: string; hours: number[] }[] = [];
    const slots = timeString.split(',').map(s => s.trim());
    slots.forEach(slot => {
      if (!slot) return;
      const day = slot.charAt(0);
      const timeRange = slot.substring(1);
      const [start, end] = timeRange.split('~').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        const hours = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        result.push({ day, hours });
      }
    });
    return result;
  };

  // 특정 요일, 시간에 해당하는 과목 찾기
  const getSubjectAtTime = (day: string, hour: number) => {
    return subjects.find(subject => {
      const timeSlots = parseTimeSlot(subject.time);
      return timeSlots.some(slot =>
        slot.day === day && slot.hours.includes(hour)
      );
    });
  };

  // 스타일 클래스 (라이트 테마 고정)
  const bgClass = 'bg-gray-100';
  const textClass = 'text-gray-800';
  const sidebarBgClass = 'bg-[#f4f6fa] border-r border-gray-200';
  const formBgClass = 'bg-white';
  const inputBgClass = 'bg-gray-50';

  return (
    <div className={`flex h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      {/* 사이드바 */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />


      {/* 메인 */}
      <div className="flex-1 relative p-6 px-12 md:px-24 xl:px-48 max-w-7xl mx-auto">
        {/* 사이드바 열기 버튼 */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 text-sm flex items-center hover:text-blue-400"
          >
            <MenuIcon size={18} className="mr-1" /> 메뉴
          </button>
        )}

        {/* 페이지별 본문 */}
        {activePage === 'timetable' && (
          <>
            {/* + 버튼 */}
            <div className="absolute top-4 right-6 z-10">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (!showForm) {
                    setIsEditing(false);
                    reset();
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <PlusCircle size={16} className="mr-2" /> 과목 추가
              </button>
            </div>
            {/* 시간표 제목 */}
            <h1 className="text-2xl font-bold mb-8 text-center mt-12">내 학기 시간표</h1>
            {/* 시간표 영역 */}
            <div className="border rounded-lg overflow-hidden border-gray-300 bg-white">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-6 border-b">
                <div className="p-2 text-center font-semibold bg-gray-200">시간</div>
                {DAYS.map(day => (
                  <div key={day} className="p-2 text-center font-medium bg-gray-200">
                    {day}요일
                  </div>
                ))}
              </div>
              {/* 시간표 그리드 */}
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-6 border-b last:border-b-0">
                  <div className="p-2 text-center bg-gray-100 text-gray-800">
                    {hour}:00
                  </div>
                  {DAYS.map(day => {
                    const subject = getSubjectAtTime(day, hour);
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="p-2 min-h-[60px] hover:bg-gray-100"
                        style={{
                          backgroundColor: subject ? `${subject.color}30` : '',
                          borderLeft: subject ? `4px solid ${subject.color}` : '',
                        }}
                        onClick={() => subject && handleEditSubject(subject)}
                      >
                        {subject && (
                          <div className="text-xs">
                            <p className="font-medium">{subject.name}</p>
                            {subject.professor && <p>{subject.professor}</p>}
                            {subject.location && <p>{subject.location}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* 과목 리스트 */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">내 과목 목록</h2>
              {subjects.length === 0 ? (
                <p className="text-center py-4 text-gray-500">
                  등록된 과목이 없습니다. 과목을 추가해보세요!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map(subject => (
                    <div
                      key={subject.id}
                      className={`${formBgClass} p-3 rounded-lg border border-gray-300`}
                      style={{ borderLeft: `4px solid ${subject.color}` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-gray-600">
                            {subject.time}
                          </p>
                          {subject.professor && (
                            <p className="text-sm text-gray-600">
                              교수: {subject.professor}
                            </p>
                          )}
                          {subject.location && (
                            <p className="text-sm text-gray-600">
                              장소: {subject.location}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="p-1 hover:text-blue-400"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-1 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 과목 입력 폼 */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`${formBgClass} p-6 rounded-lg shadow-lg max-w-md w-full`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      {isEditing ? '과목 수정하기' : '새 과목 추가하기'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        reset();
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">과목명 *</label>
                      <input
                        {...register('name', { required: '과목명을 입력해주세요' })}
                        placeholder="예: 데이터베이스개론"
                        className={`w-full p-2 border rounded ${inputBgClass} border-gray-300`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">시간 *</label>
                      <input
                        {...register('time', {
                          required: '시간을 입력해주세요',
                          pattern: {
                            value: /^[월화수목금]([\d]~[\d])?(,\s*[월화수목금][\d]~[\d])*$/,
                            message: '올바른 형식으로 입력해주세요 (예: 월1~3, 수4~6)'
                          }
                        })}
                        placeholder="예: 월1~3, 수4~6"
                        className={`w-full p-2 border rounded ${inputBgClass} border-gray-300`}
                      />
                      {errors.time && (
                        <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">우선순위</label>
                        <input
                          type="number"
                          {...register('priority', { min: 1, max: 10 })}
                          min="1"
                          max="10"
                          className={`w-full p-2 border rounded ${inputBgClass} border-gray-300`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">색상</label>
                        <select
                          {...register('color')}
                          className={`w-full p-2 border rounded ${inputBgClass} border-gray-300`}
                        >
                          {COLORS.map((color, idx) => (
                            <option key={color} value={color} style={{ backgroundColor: color }}>
                              색상 {idx + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">교수명</label>
                      <input
                        {...register('professor')}
                        placeholder="예: 홍길동"
                        className={`w-full p-2 border rounded ${inputBgClass} border-gray-300`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">강의실</label>
                      <input
                        {...register('location')}
                        placeholder="예: 공학관 302호"
                        className={`w-full p-2 border rounded ${inputBgClass} border-gray-300`}
                      />
                    </div>
                    <div className="flex space-x-3 pt-3">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
                      >
                        <Save size={16} className="mr-2" />
                        {isEditing ? '수정하기' : '저장하기'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          reset();
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {activePage === 'community' && (
          <div className="pt-24 text-center">
            <h1 className="text-2xl font-bold mb-4">커뮤니티</h1>
            <p className="text-lg text-gray-500">여기에 커뮤니티 기능이 들어갈 예정입니다.</p>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="pt-24 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">설정</h1>
            {/* 다크모드 토글 제거됨 */}
            <div className="flex items-center justify-center bg-white p-4 rounded shadow">
              <span className="font-medium text-gray-700">설정 항목을 추가하세요.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
