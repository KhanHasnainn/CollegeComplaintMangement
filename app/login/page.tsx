'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Mail, Lock, ArrowRight, ShieldCheck, GraduationCap, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPortal = searchParams.get('portal') === 'admin' || searchParams.get('type') === 'admin' ? 'admin' : 'student';

  const [portalType, setPortalType] = useState<'student' | 'admin'>(initialPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // If user logged in through Admin portal but is a student
      const role = data.user?.role;
      if (portalType === 'admin' && role === 'STUDENT') {
        // Still allow or redirect, but let them know they are in student dashboard
        router.push('/dashboard/student');
      } else if (role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (role === 'STAFF') {
        router.push('/dashboard/staff');
      } else {
        router.push('/dashboard/student');
      }

      router.refresh();
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isAdmin = portalType === 'admin';

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 transition-all duration-300">
        
        {/* Portal Switcher Tabs */}
        <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setPortalType('student');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              !isAdmin
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalType('admin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              isAdmin
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${isAdmin ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Admin & Staff</span>
          </button>
        </div>

        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo variant="icon" size="xl" priority />
          </div>
          
          {isAdmin ? (
            <>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Restricted Administrative Access</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Admin & Staff Console
              </h2>
              <p className="text-xs text-slate-500">
                Sign in with authorized administrator or staff credentials
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome to Complain<span className="text-blue-600">Track</span>
              </h2>
              <p className="text-xs text-slate-500">
                Sign in to submit, track, and manage your campus complaints
              </p>
            </>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {isAdmin ? 'Admin / Staff Email' : 'Student Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdmin ? 'admin@college.local' : 'name@college.local'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-slate-500" />
                ) : (
                  <Eye className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50 ${
              isAdmin
                ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {isAdmin ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Authenticating Admin...' : 'Sign In to Admin Portal'}</span>
              </>
            ) : (
              <>
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / Help Notice */}
        {isAdmin ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-[11px] text-slate-500 text-center space-y-1">
            <p className="font-semibold text-slate-700">Protected Administrative Area</p>
            <p>All sign-in attempts and administrative operations are recorded in the system audit trail.</p>
          </div>
        ) : null}

        {/* Bottom Switch Links */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-2">
          {!isAdmin ? (
            <>
              <div className="text-xs text-slate-500">
                New student?{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:underline">
                  Register here
                </Link>
              </div>
              <div className="text-xs text-slate-400">
                Administrator or staff?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setPortalType('admin');
                    setError('');
                  }}
                  className="font-semibold text-slate-700 hover:text-blue-600 underline"
                >
                  Admin & Staff Sign In
                </button>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">
              Not an administrator?{' '}
              <button
                type="button"
                onClick={() => {
                  setPortalType('student');
                  setError('');
                }}
                className="font-semibold text-blue-600 hover:underline"
              >
                Switch to Student Portal
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-slate-400 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </DashboardLayout>
  );
}
