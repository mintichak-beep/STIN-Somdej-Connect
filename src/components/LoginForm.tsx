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
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine((email) => email.endsWith('@stin.ac.th'), 'Email must be a valid @stin.ac.th account'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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
      setErrorMessage(err.message || 'An error occurred during login. Please try again.');
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
      setErrorMessage(err.message || 'An error occurred during Google sign-in.');
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
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
            </div>
            <input
              {...register('email')}
              type="text"
              placeholder="e.g. admin@stin.ac.th"
              className={`block w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 outline-hidden transition-all duration-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/10 ${
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
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <RememberMeCheckbox {...register('rememberMe')} />
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/10 active:bg-red-800 disabled:opacity-55 cursor-pointer dark:bg-red-600 dark:hover:bg-red-700"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            'Sign In to STIN-Somdej connect'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
        <span className="mx-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
          Or login with
        </span>
        <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
      </div>

      {/* Google Login Button */}
      <GoogleLoginButton onClick={handleGoogleSignIn} isLoading={isGoogleSubmitting} />

      {/* Account helper card */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          Demo Accounts Available:
        </h4>
        <div className="space-y-2 text-xs font-medium text-gray-500 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Admin: <strong className="text-gray-700 dark:text-zinc-200">admin@stin.ac.th</strong></span>
            <span>Pass: <strong className="text-gray-700 dark:text-zinc-200">AdminPassword123!</strong></span>
          </div>
          <div className="flex justify-between">
            <span>Teacher: <strong className="text-gray-700 dark:text-zinc-200">teacher@stin.ac.th</strong></span>
            <span>Pass: <strong className="text-gray-700 dark:text-zinc-200">TeacherPassword123!</strong></span>
          </div>
          <div className="flex justify-between">
            <span>Student: <strong className="text-gray-700 dark:text-zinc-200">student@stin.ac.th</strong></span>
            <span>Pass: <strong className="text-gray-700 dark:text-zinc-200">StudentPassword123!</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
