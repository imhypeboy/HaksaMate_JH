'use client';

import { useState, useEffect, useCallback, useId, useRef } from 'react';
import Link from 'next/link';
import { MailIcon, ArrowLeftIcon, CheckCircle2, RefreshCcwIcon, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
    const formId = useId();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [animateForm, setAnimateForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendCount, setResendCount] = useState(0);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [springTrigger, setSpringTrigger] = useState(false);
    const [checkmarkAnimate, setCheckmarkAnimate] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);
    
    // 타이머 참조들을 추적하기 위한 ref
    const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
    
    // 컴포넌트 마운트 상태 추적
    const isMountedRef = useRef<boolean>(true);
    
    // 안전한 타이머 설정 함수 (언마운트된 컴포넌트에서 state 업데이트 방지)
    const setSafeTimer = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
        const timer = setTimeout(() => {
            timersRef.current.delete(timer);
            // 컴포넌트가 여전히 마운트되어 있을 때만 콜백 실행
            if (isMountedRef.current) {
                callback();
            }
        }, delay);
        timersRef.current.add(timer);
        return timer;
    }, []);
    
    // 특정 타이머 정리 함수
    const clearSafeTimer = useCallback((timer: NodeJS.Timeout) => {
        clearTimeout(timer);
        timersRef.current.delete(timer);
    }, []);
    
    // 모든 타이머 정리 함수
    const clearAllTimers = useCallback(() => {
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current.clear();
    }, []);

    // 컴포넌트 언마운트 시 모든 타이머 정리 및 마운트 상태 업데이트
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            clearAllTimers();
        };
    }, [clearAllTimers]);

    // 페이지 로드 시 애니메이션 효과
    useEffect(() => {
        const timer = setSafeTimer(() => setAnimateForm(true), 100);
        return () => clearSafeTimer(timer);
    }, [setSafeTimer, clearSafeTimer]);

    // 체크마크 애니메이션 트리거
    useEffect(() => {
        if (submitted) {
            const timer = setSafeTimer(() => setCheckmarkAnimate(true), 200);
            return () => clearSafeTimer(timer);
        }
    }, [submitted, setSafeTimer, clearSafeTimer]);

    // 재전송 쿨다운 타이머
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setSafeTimer(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
            return () => clearSafeTimer(timer);
        }
    }, [resendCooldown, setSafeTimer, clearSafeTimer]);

    // 재전송 성공 피드백 자동 숨김
    useEffect(() => {
        if (resendSuccess) {
            const timer = setSafeTimer(() => setResendSuccess(false), 2000);
            return () => clearSafeTimer(timer);
        }
    }, [resendSuccess, setSafeTimer, clearSafeTimer]);

    // ESC 키로 뒤로가기 (키보드 접근성)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading && !isResending) {
                window.history.back();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isLoading, isResending]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(null);
    }, [error]);

    const sendResetEmail = async () => {
        try {
            // 실제로는 비밀번호 재설정 이메일 발송 API 호출
            await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션
            return true;
        } catch (error) {
            throw new Error('이메일 전송에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await sendResetEmail();
            setSubmitted(true);
            setResendCount(1);
        } catch (error: any) {
            console.error('비밀번호 재설정 오류:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        // 더블탭 방지: 500ms 내 연속 클릭 차단
        const now = Date.now();
        if (now - lastClickTime < 500) {
            return;
        }
        setLastClickTime(now);

        if (resendCooldown > 0 || resendCount >= 3) return;

        setError(null);
        setIsResending(true);

        try {
            await sendResetEmail();
            setResendCount(prev => prev + 1);
            setResendCooldown(60); // 60초 쿨다운
            setResendSuccess(true); // 성공 피드백 표시
        } catch (error: any) {
            console.error('재전송 오류:', error);
            setError(error.message);
        } finally {
            setIsResending(false);
        }
    };

    const handleButtonPress = (pressed: boolean) => {
        setButtonPressed(pressed);
    };

    const triggerSpringAnimation = useCallback(() => {
        setSpringTrigger(true);
        setSafeTimer(() => setSpringTrigger(false), 300);
    }, [setSafeTimer]);

    const canResend = resendCooldown === 0 && resendCount < 3;

    // 원형 진행바 계산
    const progressPercentage = resendCooldown > 0 ? ((60 - resendCooldown) / 60) * 100 : 100;
    const circumference = 2 * Math.PI * 16; // 반지름 16px
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <>
            <style jsx>{`
                .forgot-password-background {
                    background-image: url(/Login_wallpaper.png);
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                }
                
                /* 머터리얼 디자인 3 스프링 애니메이션 */
                .spring-button {
                    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                    transform-origin: center;
                }
                
                .spring-button:hover {
                    transform: scale(1.02);
                }
                
                .spring-button:active {
                    transform: scale(0.98);
                    transition: all 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .spring-button.pressed {
                    transform: scale(0.95);
                    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                /* 아래에서 위로 튀어오르는 스프링 애니메이션 */
                .spring-bounce {
                    animation: springBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                @keyframes springBounce {
                    0% {
                        transform: translateY(20px) scale(0.9);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translateY(-8px) scale(1.05);
                        opacity: 0.9;
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
                
                /* 체크마크 그려지는 애니메이션 */
                .checkmark-draw {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                    animation: drawCheckmark 0.8s ease-out forwards;
                }
                
                @keyframes drawCheckmark {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
                
                /* 재전송 성공 피드백 애니메이션 */
                .resend-success {
                    animation: resendSuccessPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                @keyframes resendSuccessPop {
                    0% {
                        opacity: 0;
                        transform: scale(0) translateY(10px);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2) translateY(-5px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                /* 개선된 어두운 글래스모피즘 버튼 */
                .dark-glass-button {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.35);
                    backdrop-filter: blur(20px) saturate(180%);
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.3),
                        0 4px 16px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.25);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                }
                
                .dark-glass-button:hover {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%);
                    border-color: rgba(255, 255, 255, 0.45);
                    box-shadow: 
                        0 12px 40px rgba(0, 0, 0, 0.4),
                        0 6px 20px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.35);
                    transform: scale(1.02) translateY(-1px);
                }
                
                .dark-glass-button:active {
                    transform: scale(0.98) translateY(1px);
                    box-shadow: 
                        0 4px 16px rgba(0, 0, 0, 0.3),
                        0 2px 8px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }
                
                .dark-glass-button:disabled {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.5);
                    box-shadow: 
                        0 4px 16px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }
                
                /* 포커스 상태 개선 */
                .focus-enhanced:focus {
                    outline: none;
                    ring: 2px solid rgba(255, 255, 255, 0.5);
                    ring-offset: 2px;
                    ring-offset-color: transparent;
                }
                
                /* 모바일 최적화 */
                @media (max-width: 640px) {
                    .forgot-password-background {
                        background-position: 30% center;
                    }
                    
                    .mobile-container {
                        padding: 1rem !important;
                        margin: 0.5rem !important;
                        min-height: calc(100vh - 1rem) !important;
                    }
                    
                    .mobile-form {
                        padding: 1.5rem !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                    }
                }
                
                /* 갤럭시 S20 울트라 (412px width) */
                @media (max-width: 428px) and (min-width: 360px) {
                    .mobile-touch-target {
                        min-height: 48px !important; /* 안드로이드 권장 터치 영역 */
                        padding: 0.875rem 1rem !important;
                    }
                    
                    .mobile-text-input {
                        font-size: 16px !important; /* iOS 줌 방지 */
                        padding: 1rem 1rem 1rem 2.5rem !important;
                    }
                }
                
                /* 갤럭시 S25 등 최신 기기 (더 큰 화면) */
                @media (min-width: 641px) and (max-width: 1024px) {
                    .forgot-password-background {
                        background-position: 40% center;
                    }
                }
                
                @media (min-width: 1025px) {
                    .forgot-password-background {
                        background-position: 25% center;
                    }
                }
                
                /* 가로 모드 대응 */
                @media (max-height: 600px) and (orientation: landscape) {
                    .landscape-container {
                        padding-top: 1rem !important;
                        padding-bottom: 1rem !important;
                    }
                    
                    .landscape-form {
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                }
                
                /* 프리퍼드 모션 감소 지원 */
                @media (prefers-reduced-motion: reduce) {
                    .spring-button, .spring-bounce, .checkmark-draw, .resend-success {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
            
            <div className="min-h-screen relative overflow-hidden forgot-password-background">
                {/* 조정된 오버레이 - 배경 이미지 가시성 개선 */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>

                {/* 메인 콘텐츠 */}
                <div className="mobile-container landscape-container relative z-10 min-h-screen flex items-center justify-center md:justify-end py-4 md:py-12 px-4 sm:px-6 lg:px-8">
                    {/* 개선된 어두운 글래스모피즘 폼 컨테이너 */}
                    <div
                        className={`mobile-form landscape-form max-w-md w-full sm:w-[90%] md:w-[440px] lg:mr-20 xl:mr-32 space-y-6 md:space-y-8 bg-black/45 backdrop-blur-xl border border-white/25 p-6 md:p-8 rounded-2xl shadow-2xl transition-all duration-500 relative ${animateForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                        }}
                        aria-labelledby={`${formId}-heading`}
                    >
                        <div className="text-center relative">
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg">학사메이트</h1>
                            <h2 id={`${formId}-heading`} className="mt-4 md:mt-6 text-xl md:text-2xl font-semibold text-white drop-shadow-md">
                                비밀번호 재설정
                            </h2>
                            {/* 아날로그 요소 - 밑줄 */}
                            <div className="h-1 w-16 md:w-20 bg-gradient-to-r from-white/80 to-purple-200/80 mx-auto mt-2 rounded-full drop-shadow-sm" aria-hidden="true"></div>
                            <p className="mt-3 md:mt-4 text-sm md:text-base text-white/95 drop-shadow-sm leading-relaxed">
                                가입한 이메일로<br />
                                비밀번호 재설정 링크를 보내드려요.
                            </p>
                        </div>

                        {error && (
                            <div
                                className="bg-red-500/25 backdrop-blur-sm text-red-100 p-3 md:p-4 rounded-lg text-sm border border-red-500/40 flex items-start animate-pulse"
                                role="alert"
                                aria-live="assertive"
                            >
                                <span className="mt-0.5" aria-hidden="true">❗</span>
                                <span className="ml-2">{error}</span>
                            </div>
                        )}

                        {submitted ? (
                            <div className="text-center space-y-6">
                                <div className="flex flex-col items-center text-white bg-white/15 backdrop-blur-sm p-6 rounded-xl border border-white/25">
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/25 to-pink-400/25 rounded-full blur-lg"></div>
                                        <div className="relative">
                                            <svg
                                                className="h-16 w-16 text-white drop-shadow-lg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    fill="none"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12l2 2 4-4"
                                                    className={checkmarkAnimate ? 'checkmark-draw' : ''}
                                                    fill="none"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-white drop-shadow-md">이메일이 전송되었습니다!</h3>
                                    <p className="text-sm text-white/95 mb-6 drop-shadow-sm">메일함을 확인해 주세요.</p>
                                    
                                    {/* 재전송 섹션 */}
                                    <div className="w-full space-y-4">
                                        <p className="text-sm text-white/95 drop-shadow-sm">이메일을 받지 못하셨나요?</p>
                                        
                                        {/* 재전송 성공 피드백 */}
                                        {resendSuccess && (
                                            <div className="resend-success flex items-center justify-center space-x-2 text-green-300 drop-shadow-lg">
                                                <Check size={16} />
                                                <span className="text-sm font-medium">재전송 완료!</span>
                                            </div>
                                        )}
                                        
                                        {resendCount >= 3 ? (
                                            <p className="text-xs text-white/75 drop-shadow-sm">재전송 한도에 도달했습니다. 잠시 후 다시 시도해주세요.</p>
                                        ) : (
                                            <div className="relative">
                                                <button
                                                    onClick={() => {
                                                        triggerSpringAnimation();
                                                        handleResend();
                                                    }}
                                                    onMouseDown={() => handleButtonPress(true)}
                                                    onMouseUp={() => handleButtonPress(false)}
                                                    onMouseLeave={() => handleButtonPress(false)}
                                                    disabled={!canResend || isResending}
                                                    className={`dark-glass-button focus-enhanced mobile-touch-target inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white rounded-xl disabled:cursor-not-allowed transition-all duration-200 ${springTrigger ? 'spring-bounce' : ''} ${buttonPressed ? 'pressed' : ''}`}
                                                    aria-label={`재전송 버튼 (${resendCount}/3회 사용)`}
                                                >
                                                    {isResending ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            전송 중...
                                                        </>
                                                    ) : resendCooldown > 0 ? (
                                                        <>
                                                            <div className="relative mr-2">
                                                                <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 36 36">
                                                                    <path
                                                                        className="text-white/40"
                                                                        d="M18 2.0845
                                                                           a 15.9155 15.9155 0 0 1 0 31.831
                                                                           a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                    />
                                                                    <path
                                                                        className="text-white"
                                                                        strokeDasharray={`${circumference} ${circumference}`}
                                                                        strokeDashoffset={strokeDashoffset}
                                                                        d="M18 2.0845
                                                                           a 15.9155 15.9155 0 0 1 0 31.831
                                                                           a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        style={{
                                                                            transition: 'stroke-dashoffset 1s ease-in-out',
                                                                        }}
                                                                    />
                                                                </svg>
                                                            </div>
                                                            재전송 ({resendCooldown}초)
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RefreshCcwIcon size={16} className="mr-2" />
                                                            재전송 ({resendCount}/3)
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* 성공 화면 바깥으로 이동된 로그인으로 돌아가기 버튼 */}
                                <div className="mt-6">
                                    <Link
                                        href="/auth/login"
                                        className="spring-button focus-enhanced mobile-touch-target group inline-flex items-center justify-center w-full py-3 px-4 border border-white/35 text-sm font-medium rounded-xl text-white bg-white/15 backdrop-blur-md hover:bg-white/25 shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        <ArrowLeftIcon size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                                        로그인으로 돌아가기
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSubmit} className="mt-6 md:mt-8 space-y-4 md:space-y-6" id={formId}>
                                    <div className="group">
                                        <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-white/95 mb-2 transition-colors group-focus-within:text-white drop-shadow-sm">
                                            이메일 주소
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/70" aria-hidden="true">
                                                <MailIcon size={18} />
                                            </div>
                                            <input
                                                id={`${formId}-email`}
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={email}
                                                onChange={handleChange}
                                                className="focus-enhanced mobile-text-input block w-full px-3 py-3 pl-10 border border-white/35 rounded-lg bg-white/15 backdrop-blur-sm text-white placeholder-white/70 transition-all"
                                                placeholder="your@email.com"
                                                disabled={isLoading}
                                                aria-invalid={error ? "true" : "false"}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="spring-button focus-enhanced mobile-touch-target group relative w-full flex justify-center py-3 md:py-3 px-4 border border-white/35 text-sm font-medium rounded-lg text-white bg-white/15 backdrop-blur-sm hover:bg-white/25 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                                        aria-busy={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                전송 중...
                                            </>
                                        ) : '비밀번호 재설정 링크 받기'}
                                    </button>
                                </form>

                                {/* 폼 영역의 로그인으로 돌아가기 링크 */}
                                <div className="text-center mt-4 md:mt-6">
                                    <Link
                                        href="/auth/login"
                                        className="focus-enhanced group font-medium text-white/85 hover:text-white inline-flex items-center transition-colors rounded drop-shadow-sm text-sm"
                                    >
                                        <ArrowLeftIcon size={14} className="mr-1 transition-transform group-hover:-translate-x-1" />
                                        로그인으로 돌아가기
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
