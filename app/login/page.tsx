'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Building2 } from 'lucide-react';
import ElagoLogo from '../components/ElagoLogo';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'Sales Agent' });

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('elago_user')) {
      router.replace('/');
    }
  }, []);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError('Please fill in all required fields.'); return; }
    if (mode === 'signup' && !form.name) { setError('Please enter your name.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    setTimeout(() => {
      const user = {
        name:   mode === 'signup' ? form.name : (form.email.split('@')[0]),
        email:  form.email,
        phone:  form.phone || '',
        role:   form.role,
        avatar: (mode === 'signup' ? form.name : form.email.split('@')[0])[0].toUpperCase(),
        joined: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      };
      localStorage.setItem('elago_user', JSON.stringify(user));
      setLoading(false);
      router.replace('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-4" style={{ overflowY: 'auto', height: '100vh' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-orange/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-navy/5" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo + headline */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ElagoLogo size="lg" />
          </div>
          <p className="text-brand-muted font-body text-sm">Premium Real Estate Discovery Platform</p>
        </div>

        <div className="bg-white rounded-2xl card-shadow-lg overflow-hidden border border-brand-border">
          {/* Mode tabs */}
          <div className="flex border-b border-brand-border">
            {(['login', 'signup'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setForm({ name:'',email:'',phone:'',password:'',role:'Sales Agent' }); }}
                className={`flex-1 py-3.5 text-sm font-body font-medium transition-colors ${mode === m
                  ? 'text-brand-orange border-b-2 border-brand-orange bg-orange-50/50'
                  : 'text-brand-muted hover:text-brand-text'}`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-body font-medium text-brand-muted uppercase tracking-wider mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input type="text" placeholder="Abcd Efg" value={form.name} onChange={e => set('name', e.target.value)}
                    className="w-full bg-brand-light border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all font-body" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-body font-medium text-brand-muted uppercase tracking-wider mb-1.5 block">Email Address *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full bg-brand-light border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all font-body" />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-xs font-body font-medium text-brand-muted uppercase tracking-wider mb-1.5 block">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)}
                      className="w-full bg-brand-light border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all font-body" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-body font-medium text-brand-muted uppercase tracking-wider mb-1.5 block">Role</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <select value={form.role} onChange={e => set('role', e.target.value)}
                      className="w-full bg-brand-light border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all font-body appearance-none">
                      <option>Sales Agent</option>
                      <option>Admin</option>
                      <option>BD Manager</option>
                      <option>Buyer</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-body font-medium text-brand-muted uppercase tracking-wider">Password *</label>
                {mode === 'login' && <button className="text-xs text-brand-orange hover:underline font-body">Forgot password?</button>}
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-brand-light border border-brand-border rounded-xl pl-9 pr-10 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all font-body" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <span className="text-xs text-red-600 font-body">{error}</span>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-orange text-white font-body text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-60 mt-1">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={14} /></>}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-brand-border" />
              <span className="text-xs text-brand-muted font-body">or</span>
              <div className="flex-1 h-px bg-brand-border" />
            </div>

            <button className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm font-body hover:bg-brand-hover hover:text-brand-text transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-brand-muted font-body mt-5">
          By continuing, you agree to elaGO's Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
