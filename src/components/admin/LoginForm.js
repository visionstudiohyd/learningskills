'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { loginSchema } from '@/lib/validation';
import { zodResolver } from '@/lib/form';
import { cx } from '@/lib/utils';

export default function LoginForm({ nextPath = '/admin' }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values) {
    setServerError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data.error || 'Sign-in failed. Please try again.');
        return;
      }

      // Only ever redirect to an internal path — a `next` value from the query
      // string must not be able to bounce the admin to another origin.
      const target = nextPath.startsWith('/admin') ? nextPath : '/admin';
      router.replace(target);
      router.refresh();
    } catch {
      setServerError('Could not reach the server. Is the application running?');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-white/70">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="you@institute.com"
          aria-invalid={Boolean(errors.email)}
          className={cx(
            'w-full rounded-xl border bg-white/5 px-4 py-3 text-[0.9375rem] text-white placeholder:text-white/35 transition-all focus:outline-none',
            errors.email ? 'border-rose-400/60 focus:border-rose-300' : 'border-white/15 focus:border-brand-300 focus:bg-white/10'
          )}
          {...register('email')}
        />
        {errors.email && (
          <p role="alert" className="mt-1.5 text-xs text-rose-300">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-white/70">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            className={cx(
              'w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-[0.9375rem] text-white placeholder:text-white/35 transition-all focus:outline-none',
              errors.password ? 'border-rose-400/60 focus:border-rose-300' : 'border-white/15 focus:border-brand-300 focus:bg-white/10'
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p role="alert" className="mt-1.5 text-xs text-rose-300">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {serverError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="h-4.5 w-4.5" strokeWidth={2.3} />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
