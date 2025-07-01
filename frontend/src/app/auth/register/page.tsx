'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon, CheckCircle2, ShieldCheckIcon, AlertCircle } from 'lucide-react';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const formId = useId(); // 접근성 향상을 위한 고유 ID
    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [animateForm, setAnimateForm] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<number>(0);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // 페이지 로드 시 애니메이션 효과
    useEffect(() => {
        const timer = setTimeout(() => setAnimateForm(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 메모리 누수 방지를 위한 clean-up 함수
    useEffect(() => {
        return () => {
            if (isLoading) {
                setIsLoading(false);
            }
        };
    }, [isLoading]);

    // 비밀번호 강도 계산
    const calculatePasswordStrength = useCallback((password: string): number => {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const length = password.length;

        let strength = 0;
        if (length > 0) strength += 1;
        if (length >= 8) strength += 1;
        if (hasLetter) strength += 1;
        if (hasNumber) strength += 1;
        if (hasSpecial) strength += 1;
        if (hasUpperCase) strength += 1;

        return Math.min(strength, 5);
    }, []);

    // 실시간 유효성 검사
    const validateField = useCallback((name: string, value: string, formData: RegisterFormData): string => {
        switch (name) {
            case 'username':
                if (!value.trim()) return '사용자 이름을 입력해주세요.';
                if (value.length < 2) return '사용자 이름은 최소 2자 이상이어야 합니다.';
                if (value.length > 20) return '사용자 이름은 최대 20자까지 가능합니다.';
                if (!/^[가-힣a-zA-Z0-9_]+$/.test(value)) return '한글, 영문, 숫자, 언더스코어만 사용 가능합니다.';
                return '';
            
            case 'email':
                if (!value.trim()) return '이메일을 입력해주세요.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '유효한 이메일 주소를 입력해주세요.';
                // 이메일 도메인 블랙리스트 체크
                const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
                const domain = value.split('@')[1]?.toLowerCase();
                if (domain && blockedDomains.includes(domain)) {
                    return '임시 이메일 주소는 사용할 수 없습니다.';
                }
                return '';
            
            case 'password':
                if (!value) return '비밀번호를 입력해주세요.';
                if (value.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
                if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) return '영문과 숫자를 포함해야 합니다.';
                return '';
            
            case 'confirmPassword':
                if (!value) return '비밀번호 확인을 입력해주세요.';
                if (value !== formData.password) return '비밀번호가 일치하지 않습니다.';
                return '';
            
            default:
                return '';
        }
    }, []);

    // 입력 핸들러 최적화
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // 비밀번호 강도 체크
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }

        // 실시간 유효성 검사
        const fieldError = validateField(name, value, newFormData);
        setErrors(prev => ({ ...prev, [name]: fieldError }));

        // 확인 비밀번호 재검증
        if (name === 'password' && newFormData.confirmPassword) {
            const confirmError = validateField('confirmPassword', newFormData.confirmPassword, newFormData);
            setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }

        // 일반 오류 메시지 초기화
        if (generalError) setGeneralError(null);
    }, [formData, calculatePasswordStrength, validateField, generalError]);

    const togglePasswordVisibility = useCallback((field: 'password' | 'confirmPassword') => {
        if (field === 'password') {
            setShowPassword(prev => !prev);
        } else {
            setShowConfirmPassword(prev => !prev);
        }
    }, []);

    // 폼 전체 유효성 검사
    const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof RegisterFormData], formData);
            if (error) newErrors[key] = error;
        });

        if (!termsAccepted) {
            newErrors.terms = '이용약관에 동의해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, validateField, termsAccepted]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            
            setIsSuccess(true);

            // 성공 애니메이션 후 리디렉션
            setTimeout(() => {
                router.push('/auth/login?message=회원가입이 완료되었습니다. 로그인해주세요.');
            }, 1500);
        } catch (error: any) {
            console.error('회원가입 오류:', error);
            setGeneralError(
                error.response?.data?.message ||
                error.message ||
                '회원가입에 실패했습니다. 다시 시도해주세요.'
            );
        } finally {
            if (!isSuccess) {
                setIsLoading(false);
            }
        }
    };

    // 비밀번호 강도 표시 색상
    const getStrengthColor = (strength: number) => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = (strength: number) => {
        if (strength <= 1) return "매우 약한 비밀번호";
        if (strength === 2) return "약한 비밀번호";
        if (strength === 3) return "보통 비밀번호";
        if (strength === 4) return "강한 비밀번호";
        return "매우 강한 비밀번호";
    };

    return (
        <>
            <style jsx>{`
                .register-background {
                    background-image: url('/Register_wallpaper.png');
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                }
                
                @media (max-width: 640px) {
                    .register-background {
                        background-position: 30% center; /* 모바일: 인물 중심 */
                    }
                }
                
                @media (min-width: 641px) and (max-width: 1024px) {
                    .register-background {
                        background-position: 40% center; /* 태블릿: 균형 */
                    }
                }
                
                @media (min-width: 1025px) {
                    .register-background {
                        background-position: 25% center; /* 데스크톱: 여유 공간 활용 */
                    }
                }
            `}</style>
            
            <div className="min-h-screen relative overflow-hidden register-background">
                {/* 그라데이션 오버레이 (가독성 향상) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>

                {/* 메인 콘텐츠 */}
                <div className="relative z-10 min-h-screen flex items-center justify-end py-12 px-4 sm:px-6 lg:px-8">
                    {/* 회원가입 폼 컨테이너 */}
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
                                회원가입
                            </h2>
                            {/* 아날로그 요소 - 밑줄 */}
                            <div className="h-1 w-20 bg-gradient-to-r from-white/80 to-purple-200/80 mx-auto mt-2 rounded-full drop-shadow-sm" aria-hidden="true"></div>
                        </div>

                        {generalError && (
                            <div
                                className="bg-red-100/80 backdrop-blur-sm text-red-800 p-4 rounded-md text-sm border-l-4 border-red-400 flex items-start"
                                role="alert"
                                aria-live="assertive"
                            >
                                <AlertCircle size={16} className="mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
                                <span>{generalError}</span>
                            </div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit} id={formId}>
                            <div className="space-y-6">
                                {/* 사용자 이름 */}
                                <div className="group">
                                    <label htmlFor={`${formId}-username`} className="block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-white drop-shadow-sm">
                                        사용자 이름
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300" aria-hidden="true">
                                            <UserIcon size={18} />
                                        </div>
                                        <input
                                            id={`${formId}-username`}
                                            name="username"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="pl-10 block w-full px-3 py-3 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                                            placeholder="사용자 이름"
                                            disabled={isLoading || isSuccess}
                                            aria-invalid={errors.username ? "true" : "false"}
                                            aria-describedby={errors.username ? `${formId}-username-error` : undefined}
                                        />
                                    </div>
                                    {errors.username && (
                                        <p id={`${formId}-username-error`} className="mt-2 text-sm text-red-200 flex items-center">
                                            <AlertCircle size={14} className="mr-1" />
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                {/* 이메일 */}
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
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 block w-full px-3 py-3 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                                            placeholder="이메일 주소"
                                            disabled={isLoading || isSuccess}
                                            aria-invalid={errors.email ? "true" : "false"}
                                            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p id={`${formId}-email-error`} className="mt-2 text-sm text-red-200 flex items-center">
                                            <AlertCircle size={14} className="mr-1" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* 비밀번호 */}
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
                                            autoComplete="new-password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 block w-full px-3 py-3 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                                            placeholder="비밀번호 (8자 이상)"
                                            disabled={isLoading || isSuccess}
                                            aria-invalid={errors.password ? "true" : "false"}
                                            aria-describedby={errors.password ? `${formId}-password-error` : `${formId}-password-strength`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('password')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                                            tabIndex={-1}
                                            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                            disabled={isLoading || isSuccess}
                                        >
                                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        </button>
                                    </div>

                                    {/* 비밀번호 강도 표시 */}
                                    {formData.password && (
                                        <div className="mt-2 space-y-1" id={`${formId}-password-strength`}>
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
                                                {getStrengthText(passwordStrength)}
                                            </p>
                                        </div>
                                    )}

                                    {errors.password && (
                                        <p id={`${formId}-password-error`} className="mt-2 text-sm text-red-200 flex items-center">
                                            <AlertCircle size={14} className="mr-1" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* 비밀번호 확인 */}
                                <div className="group">
                                    <label htmlFor={`${formId}-confirmPassword`} className="block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-white drop-shadow-sm">
                                        비밀번호 확인
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300" aria-hidden="true">
                                            <LockIcon size={18} />
                                        </div>
                                        <input
                                            id={`${formId}-confirmPassword`}
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 block w-full px-3 py-3 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                                            placeholder="비밀번호 확인"
                                            disabled={isLoading || isSuccess}
                                            aria-invalid={errors.confirmPassword ? "true" : "false"}
                                            aria-describedby={errors.confirmPassword ? `${formId}-confirmPassword-error` : undefined}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors"
                                            tabIndex={-1}
                                            aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                                            disabled={isLoading || isSuccess}
                                        >
                                            {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p id={`${formId}-confirmPassword-error`} className="mt-2 text-sm text-red-200 flex items-center">
                                            <AlertCircle size={14} className="mr-1" />
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 이용약관 동의 */}
                            <div className="flex items-start">
                                <input
                                    id={`${formId}-terms`}
                                    name="terms"
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={() => setTermsAccepted(prev => !prev)}
                                    className="h-4 w-4 mt-0.5 text-white focus:ring-white/50 border-white/30 rounded transition-all bg-white/20"
                                    disabled={isLoading || isSuccess}
                                    aria-describedby={errors.terms ? `${formId}-terms-error` : undefined}
                                />
                                <label htmlFor={`${formId}-terms`} className="ml-2 block text-sm text-white/90 drop-shadow-sm">
                                    <Link 
                                        href="/terms" 
                                        className="text-white/90 hover:text-white underline transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        이용약관
                                    </Link>
                                    {' '}및{' '}
                                    <Link 
                                        href="/privacy" 
                                        className="text-white/90 hover:text-white underline transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        개인정보처리방침
                                    </Link>
                                    에 동의합니다
                                </label>
                            </div>
                            {errors.terms && (
                                <p id={`${formId}-terms-error`} className="text-sm text-red-200 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.terms}
                                </p>
                            )}

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
                                            회원가입 중...
                                        </>
                                    ) : '회원가입'}
                                </button>
                            </div>
                        </form>

                        <div className="text-center mt-4">
                            <p className="text-sm text-white/80 drop-shadow-sm">
                                이미 계정이 있으신가요?{' '}
                                <Link
                                    href="/auth/login"
                                    className="group font-medium text-white/90 hover:text-white inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 rounded"
                                >
                                    로그인
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
                                    <p className="mt-2 text-lg font-medium drop-shadow-md">회원가입 완료!</p>
                                    <p className="text-sm text-gray-600">로그인 페이지로 이동합니다...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}