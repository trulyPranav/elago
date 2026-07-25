'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import ElagoLogo from '../components/ElagoLogo';
import { api, ApiError } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to intended target or map view
  useEffect(() => {
    const token = localStorage.getItem('elago_token');
    if (token) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.login(email, password);
      
      // Success: redirect to target or default home
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Login failed. Please check credentials.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden font-body">
      {/* Background ambient lighting effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00405c] opacity-35 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#f15a29] opacity-25 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Card Container */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 card-shadow-lg animate-fadein">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/40">
              <ElagoLogo size="lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                Partner Console
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-body">
                Enter your credentials to manage properties and analytics.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-red-400 text-xs animate-fadein-fast">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@elago.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/60 transition-all font-body"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/60 transition-all font-body"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-slate-400 hover:text-brand-orange underline transition-colors"
          >
            Back to Map View
          </button>
        </div>
      </div>
    </div>
  );
}
