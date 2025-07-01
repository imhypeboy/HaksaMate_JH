'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';
import { MailIcon, LockIcon, UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthContainer, authStyles } from '../components/AuthContainer';
import { FormInput, FormError, PasswordStrength } from '../components/FormInput';
import { useAuthAnimation } from '../hooks/useAuthAnimation';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterPage() {
    const router = useRouter();

    const { isVisible, isLoading, setLoading, triggerSuccess, isSuccess } = useAuthAnimation();

    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    /* ---------------- utils ---------------- */
    const calculatePasswordStrength = (password: string) => {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const length = password.length;
        let strength = 0;
        if (length >= 1) strength += 1;
        if (length >= 8) strength += 1;
        if (hasLetter) strength += 1;
        if (hasNumber) strength += 1;
        if (hasSpecial) strength += 1;
        if (hasUpper) strength += 1;
        return Math.min(strength, 5);
    };

    const validateField = (name: string, value: string, data: RegisterFormData): string => {
        switch (name) {
            case 'username':
                if (!value.trim()) return '사용자 이름을 입력해주세요.';
                if (value.length < 2) return '최소 2자 이상 입력해주세요.';
                if (value.length > 20) return '최대 20자까지 가능합니다.';
                if (!/^[가-힣a-zA-Z0-9_]+$/.test(value)) return '한글, 영문, 숫자, _ 만 사용';
                return '';
            case 'email':
                if (!value.trim()) return '이메일을 입력해주세요.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '유효한 이메일 주소가 아닙니다.';
                return '';
            case 'password':
                if (!value) return '비밀번호를 입력해주세요.';
                if (value.length < 8) return '최소 8자 이상 입력해주세요.';
                if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) return '영문과 숫자를 포함해야 합니다.';
                return '';
            case 'confirmPassword':
                if (value !== data.password) return '비밀번호가 일치하지 않습니다.';
                return '';
            default:
                return '';
        }
    };

    /* -------------- handlers --------------- */
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            const newData = { ...formData, [name]: value };
            setFormData(newData);

            if (name === 'password') setPasswordStrength(calculatePasswordStrength(value));

            const fieldError = validateField(name, value, newData);
            setErrors(prev => ({ ...prev, [name]: fieldError }));
            if (generalError) setGeneralError(null);
        },
        [formData, generalError]
    );

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        Object.keys(formData).forEach(key => {
            const err = validateField(key, formData[key as keyof RegisterFormData], formData);
            if (err) newErrors[key] = err;
        });
        if (!termsAccepted) newErrors.terms = '이용약관에 동의해주세요.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            triggerSuccess(1500);
            setTimeout(() => router.push('/auth/login?message=회원가입이 완료되었습니다.'), 1500);
        } catch (err: any) {
            setGeneralError(err.response?.data?.message || '회원가입에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    /* ----------------- UI ------------------ */
    return (
        <AuthContainer title="회원가입" isVisible={isVisible} bgImage="/Register_wallpaper.png">
            {generalError && <FormError message={generalError} />}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <FormInput
                        id="reg-username"
                        name="username"
                        type="text"
                        label="사용자 이름"
                        placeholder="사용자 이름"
                        value={formData.username}
                        onChange={handleChange}
                        icon={UserIcon}
                        required
                        disabled={isLoading || isSuccess}
                        error={errors.username}
                    />
                    <FormInput
                        id="reg-email"
                        name="email"
                        type="email"
                        label="이메일"
                        placeholder="이메일 주소"
                        value={formData.email}
                        onChange={handleChange}
                        icon={MailIcon}
                        required
                        disabled={isLoading || isSuccess}
                        error={errors.email}
                    />
                    <FormInput
                        id="reg-password"
                        name="password"
                        type="password"
                        label="비밀번호"
                        placeholder="비밀번호 (8자 이상)"
                        value={formData.password}
                        onChange={handleChange}
                        icon={LockIcon}
                        required
                        disabled={isLoading || isSuccess}
                        showPasswordToggle
                        error={errors.password}
                    />
                    <PasswordStrength password={formData.password} strength={passwordStrength} />
                    <FormInput
                        id="reg-confirm"
                        name="confirmPassword"
                        type="password"
                        label="비밀번호 확인"
                        placeholder="비밀번호 확인"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={LockIcon}
                        required
                        disabled={isLoading || isSuccess}
                        showPasswordToggle
                        error={errors.confirmPassword}
                    />
                    {/* 이용약관 */}
                    <div className="flex items-start">
                        <input
                            id="terms"
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={() => setTermsAccepted(prev => !prev)}
                            className="h-4 w-4 mt-0.5 text-white focus:ring-white/50 border-white/30 rounded bg-white/20"
                            disabled={isLoading || isSuccess}
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-white/90 drop-shadow-sm">
                            <Link href="/terms" className="underline">이용약관</Link> 및 <Link href="/privacy" className="underline">개인정보처리방침</Link>에 동의합니다
                        </label>
                    </div>
                    {errors.terms && <p className="text-sm text-red-200 flex items-center"><AlertCircle size={14} className="mr-1" />{errors.terms}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className={authStyles.button}
                >
                    {isLoading ? '회원가입 중...' : '회원가입'}
                </button>
            </form>
            {/* 하단 링크 */}
            <div className="text-center mt-4">
                <p className="text-sm text-white/80 drop-shadow-sm">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/auth/login" className="underline font-medium">로그인</Link>
                </p>
            </div>
            {/* 성공 오버레이 */}
            {isSuccess && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl z-10 animate-fade-in">
                    <div className="text-green-600 animate-scale-up flex flex-col items-center">
                        <CheckCircle2 className="h-16 w-16 animate-pulse" />
                        <p className="mt-2 text-lg font-medium drop-shadow-md">회원가입 완료!</p>
                        <p className="text-sm text-gray-600">로그인 페이지로 이동합니다...</p>
                    </div>
                </div>
            )}
        </AuthContainer>
    );
} 