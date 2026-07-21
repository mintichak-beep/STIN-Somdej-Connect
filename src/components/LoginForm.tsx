import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PasswordInput } from './PasswordInput';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { GoogleLoginButton } from './GoogleLoginButton';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('กรุณากรอกรูปแบบอีเมลให้ถูกต้อง')
    .refine((email) => email.endsWith('@stin.ac.th'), 'อีเมลต้องเป็นบัญชี @stin.ac.th เท่านั้น'),
  password: z.string()
    .min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
    .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่หนึ่งตัว')
    .regex(/[a-z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กหนึ่งตัว')
    .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขหนึ่งตัว')
    .regex(/[^A-Za-z0-9]/, 'รหัสผ่านต้องมีอักขระพิเศษหนึ่งตัว'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, googleLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });


  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(data.email, data.password, data.rememberMe);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setErrorMessage(null);
    try {
      await googleLogin();
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-500" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Email Address / อีเมลสถาบัน
          </label>
          <div className="relative rounded-[20px] shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Mail className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
            </div>
            <input
              {...register('email')}
              type="text"
              placeholder="e.g. admin@stin.ac.th"
              className={`block w-full rounded-[20px] border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#D32F2F] focus:ring-4 focus:ring-[#D32F2F]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/10 ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500' : ''
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <PasswordInput
          {...register('password')}
          label="Password / รหัสผ่าน"
          placeholder="••••••••"
          error={errors.password?.message}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs">
          <RememberMeCheckbox {...register('rememberMe')} />
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-[#D32F2F] transition-colors hover:text-[#B71C1C] dark:text-red-400 dark:hover:text-red-300"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Large Red Login Button */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleSubmitting}
          className="flex w-full items-center justify-center rounded-[20px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#C62828] hover:to-[#9A0007] px-6 py-4 text-base font-black text-white shadow-lg shadow-red-600/25 transition-all duration-200 hover:shadow-red-600/35 active:scale-[0.99] disabled:opacity-55 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            'Sign In / เข้าสู่ระบบ'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
        <span className="mx-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Or login with
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
      </div>

      {/* Google Login Button */}
      <GoogleLoginButton onClick={handleGoogleSignIn} isLoading={isGoogleSubmitting} className="rounded-[20px] py-3 font-bold" />

      {/* Account helper card */}
      <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <h4 className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300">
          Demo Accounts Available / บัญชีทดสอบระบบ:
        </h4>
        <div className="space-y-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Admin: <strong className="text-slate-800 dark:text-zinc-200">admin@stin.ac.th</strong></span>
            <span>Pass: <strong className="text-slate-800 dark:text-zinc-200">AdminPassword123!</strong></span>
          </div>
          <div className="flex justify-between">
            <span>Teacher: <strong className="text-slate-800 dark:text-zinc-200">teacher@stin.ac.th</strong></span>
            <span>Pass: <strong className="text-slate-800 dark:text-zinc-200">TeacherPassword123!</strong></span>
          </div>
          <div className="flex justify-between">
            <span>Student: <strong className="text-slate-800 dark:text-zinc-200">student@stin.ac.th</strong></span>
            <span>Pass: <strong className="text-slate-800 dark:text-zinc-200">StudentPassword123!</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
