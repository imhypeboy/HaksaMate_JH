'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';
import { LoginCredentials } from '@/types/user';
import { MailIcon, LockIcon, CheckCircle2 } from 'lucide-react';
import { AuthContainer, authStyles } from '../components/AuthContainer';
import { FormInput, FormError, PasswordStrength } from '../components/FormInput';
import { useAuthAnimation } from '../hooks/useAuthAnimation';

export default function LoginPage() {
    const router = useRouter();
    const formId = useId();
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<number>(0);

    // 애니메이션 상태 관리
    const { isVisible, isLoading, setLoading, triggerSuccess } = useAuthAnimation();

    // 페이지 로드 시 애니메이션 효과
    useEffect(() => {
        // isVisible은 자동으로 useAuthAnimation에서 처리
    }, []);

    // 입력 핸들러 최적화
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
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
        if (error) setError(null);
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await loginUser(credentials);
            setIsSuccess(true);
            triggerSuccess(800);
            if (rememberMe) {
                try {
                    localStorage.setItem('rememberedEmail', credentials.email);
                } catch (storageError) {
                    console.warn('로컬 스토리지 접근 오류:', storageError);
                }
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            setTimeout(() => {
                router.push('/');
            }, 800);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
            );
            setLoading(false);
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

    return (
        <AuthContainer title="로그인" isVisible={isVisible}>
            {error && <FormError message={error} />}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} id={formId}>
                <div className="rounded-md space-y-6">
                    <FormInput
                        id={`${formId}-email`}
                        name="email"
                        type="email"
                        label="이메일"
                        placeholder="이메일 주소"
                        value={credentials.email}
                        onChange={handleChange}
                        icon={MailIcon}
                        autoComplete="email"
                        required
                        disabled={isLoading || isSuccess}
                    />
                    <FormInput
                        id={`${formId}-password`}
                        name="password"
                        type="password"
                        label="비밀번호"
                        placeholder="비밀번호"
                        value={credentials.password}
                        onChange={handleChange}
                        icon={LockIcon}
                        autoComplete="current-password"
                        required
                        disabled={isLoading || isSuccess}
                        showPasswordToggle
                    />
                    {/* 비밀번호 강도 표시 */}
                    <PasswordStrength password={credentials.password} strength={passwordStrength} />
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
                        className={authStyles.button}
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
        </AuthContainer>
    );
}