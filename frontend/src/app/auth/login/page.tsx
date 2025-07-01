'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';
import { LoginCredentials } from '@/types/user';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, CheckCircle2, ShieldCheckIcon } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const formId = useId(); // 접근성 향상을 위한 고유 ID
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [animateForm, setAnimateForm] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<number>(0);

    // 페이지 로드 시 애니메이션 효과
    useEffect(() => {
        const timer = setTimeout(() => setAnimateForm(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 메모리 누수 방지를 위한 clean-up 함수
    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시 진행 중인 작업 취소
            if (isLoading) {
                setIsLoading(false);
            }
        };
    }, [isLoading]);

    // 입력 핸들러 최적화
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));

        // 비밀번호 강도 체크
        if (name === 'password') {
            // 간단한 비밀번호 강도 체크
            const hasLetter = /[a-zA-Z]/.test(value);
            const hasNumber = /[0-9]/.test(value);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            const length = value.length;

            let strength = 0;
            if (length > 0) strength += 1;
            if (length >= 8) strength += 1;
            if (hasLetter) strength += 1;
            if (hasNumber) strength += 1;
            if (hasSpecial) strength += 1;

            setPasswordStrength(strength);
        }

        // 오류 메시지 입력 시 초기화
        if (error) setError(null);
    }, [error]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await loginUser(credentials);
            setIsSuccess(true);

            // 로그인 정보 저장 (rememberMe 활용)
            if (rememberMe) {
                try {
                    localStorage.setItem('rememberedEmail', credentials.email);
                } catch (storageError) {
                    console.warn('로컬 스토리지 접근 오류:', storageError);
                }
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // 성공 애니메이션 후 리디렉션
            setTimeout(() => {
                router.push('/');
            }, 800);
        } catch (error: any) {
            console.error('로그인 오류:', error);
            setError(
                error.response?.data?.message ||
                '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
            );
            setIsLoading(false);
        }
    };

    // 저장된 이메일이 있으면 불러오기
    useEffect(() => {
        try {
            const savedEmail = localStorage.getItem('rememberedEmail');
            if (savedEmail) {
                setCredentials(prev => ({ ...prev, email: savedEmail }));
                setRememberMe(true);
            }
        } catch (error) {
            console.warn('로컬 스토리지 접근 오류:', error);
        }
    }, []);

    // 암호 강도 표시 색상
    const getStrengthColor = (strength: number) => {
        if (strength <= 1) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <>
            <style jsx>{`
                .login-background {
                    background-image: url(/Login_wallpaper.png);
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                }
                
                @media (max-width: 640px) {
                    .login-background {
                        background-position: 30% center; /* 모바일: 인물 중심 */
                    }
                }
                
                @media (min-width: 641px) and (max-width: 1024px) {
                    .login-background {
                        background-position: 40% center; /* 태블릿: 균형 */
                    }
                }
                
                @media (min-width: 1025px) {
                    .login-background {
                        background-position: 25% center; /* 데스크톱: 바다 풍경 강조 */
                    }
                }
            `}</style>
            
            <div className="min-h-screen relative overflow-hidden login-background">
                {/* 그라데이션 오버레이 (가독성 향상) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>

                {/* 메인 콘텐츠 */}
                <div className="relative z-10 min-h-screen flex items-center justify-end py-12 px-4 sm:px-6 lg:px-8">
                    {/* 로그인 폼 컨테이너 */}
                    <div
                        className={`max-w-md w-full sm:w-[90%] md:w-[440px] lg:mr-20 xl:mr-32 space-y-8 bg-white/25 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl transition-all duration-500 relative ${animateForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        }}
                        aria-labelledby={`${formId}-heading`}
                    >
                        <div className="text-center relative">
                            <h1 id={`${formId}-heading`} className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg">학사메이트</h1>
                            <h2 className="mt-6 text-2xl font-semibold text-white drop-shadow-md">
                                로그인
                            </h2>
                            {/* 아날로그 요소 - 밑줄 */}
                            <div className="h-1 w-20 bg-gradient-to-r from-white/80 to-purple-200/80 mx-auto mt-2 rounded-full drop-shadow-sm" aria-hidden="true"></div>
                        </div>

                        {error && (
                            <div
                                className="bg-red-100/80 backdrop-blur-sm text-red-800 p-4 rounded-md text-sm border-l-4 border-red-400 flex items-start"
                                role="alert"
                                aria-live="assertive"
                            >
                                <span className="mt-0.5" aria-hidden="true">❗</span>
                                <span className="ml-2">{error}</span>
                            </div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit} id={formId}>
                            <div className="rounded-md space-y-6">
                                <div className="group">
                                    <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-white drop-shadow-sm">
                                        이메일
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300" aria-hidden="true">
                                            <MailIcon size={18} />
                                        </div>
                                        <input
                                            id={`${formId}-email`}
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={credentials.email}
                                            onChange={handleChange}
                                            className="pl-10 block w-full px-3 py-3 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                                            placeholder="이메일 주소"
                                            disabled={isLoading || isSuccess}
                                            aria-invalid={error ? "true" : "false"}
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label htmlFor={`${formId}-password`} className="block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-white drop-shadow-sm">
                                        비밀번호
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300" aria-hidden="true">
                                            <LockIcon size={18} />
                                        </div>
                                        <input
                                            id={`${formId}-password`}
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={credentials.password}
                                            onChange={handleChange}
                                            className="pl-10 block w-full px-3 py-3 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                                            placeholder="비밀번호"
                                            disabled={isLoading || isSuccess}
                                            aria-invalid={error ? "true" : "false"}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                                            tabIndex={-1}
                                            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                            disabled={isLoading || isSuccess}
                                        >
                                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        </button>
                                    </div>

                                    {/* 비밀번호 강도 표시 */}
                                    {credentials.password && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex gap-1 h-1">
                                                {[1, 2, 3, 4, 5].map((segment) => (
                                                    <div
                                                        key={segment}
                                                        className={`h-full flex-1 rounded-full transition-all ${
                                                            passwordStrength >= segment ? getStrengthColor(passwordStrength) : 'bg-white/30'
                                                        }`}
                                                        aria-hidden="true"
                                                    ></div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-white/80 flex items-center drop-shadow-sm">
                                                <ShieldCheckIcon size={12} className="mr-1" />
                                                {passwordStrength <= 1 && "매우 약한 비밀번호"}
                                                {passwordStrength === 2 && "약한 비밀번호"}
                                                {passwordStrength === 3 && "보통 비밀번호"}
                                                {passwordStrength === 4 && "강한 비밀번호"}
                                                {passwordStrength >= 5 && "매우 강한 비밀번호"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between flex-wrap gap-y-2">
                                <div className="flex items-center">
                                    <input
                                        id={`${formId}-remember-me`}
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(prev => !prev)}
                                        className="h-4 w-4 text-white focus:ring-white/50 border-white/30 rounded transition-all bg-white/20"
                                        disabled={isLoading || isSuccess}
                                    />
                                    <label htmlFor={`${formId}-remember-me`} className="ml-2 block text-sm text-white/90 drop-shadow-sm">
                                        로그인 상태 유지
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link
                                        href="/auth/forgot-password"
                                        className="font-medium text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 rounded drop-shadow-sm"
                                        aria-label="비밀번호 재설정 페이지로 이동"
                                    >
                                        비밀번호를 잊으셨나요?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || isSuccess}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-white/30 text-sm font-medium rounded-lg text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-70 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    aria-busy={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            로그인 중...
                                        </>
                                    ) : '로그인'}
                                </button>
                            </div>
                        </form>

                        <div className="text-center mt-4">
                            <p className="text-sm text-white/80 drop-shadow-sm">
                                계정이 없으신가요?{' '}
                                <Link
                                    href="/auth/register"
                                    className="group font-medium text-white/90 hover:text-white inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 rounded"
                                >
                                    회원가입
                                    <svg className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M6.5 12.5L11 8L6.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </Link>
                            </p>
                        </div>



                        {/* 성공 애니메이션 오버레이 */}
                        {isSuccess && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl z-10 animate-fade-in"
                                aria-live="assertive"
                                role="status"
                            >
                                <div className="text-green-600 animate-scale-up flex flex-col items-center">
                                    <CheckCircle2 className="h-16 w-16 animate-pulse" aria-hidden="true" />
                                    <p className="mt-2 text-lg font-medium drop-shadow-md">로그인 성공!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}