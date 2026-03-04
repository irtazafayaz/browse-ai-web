'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/lib/AuthContext';

/* ── Google icon SVG ── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ── Or divider ── */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: 'rgba(212,196,168,0.6)' }} />
      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#AAAAAA]">or</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(212,196,168,0.6)' }} />
    </div>
  );
}

type Tab = 'login' | 'register';

interface Props {
  open: boolean;
  onClose: () => void;
}

/* ── Small input ── */
function Field({
  label, type = 'text', value, onChange, placeholder, error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black tracking-[0.18em] uppercase text-[#6B6B6B]">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-sm text-[#1A1A1A] outline-none transition-all duration-200"
          style={{
            background: '#F2EDE4',
            border: error ? '1.5px solid #E57373' : '1.5px solid #D4C4A8',
            borderRadius: 0,
          }}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'; }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = error ? '#E57373' : '#D4C4A8'; }}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
          >
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-[#E57373] font-medium">{error}</p>}
    </div>
  );
}

/* ── Main modal ── */
export default function AuthModal({ open, onClose }: Props) {
  const { user, login, register, logout, googleAuth } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regFirst, setRegFirst] = useState('');
  const [regLast, setRegLast] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');

  // Reset error when switching tabs
  useEffect(() => setError(''), [tab]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /* ── Google OAuth ── */
  const triggerGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        await googleAuth(tokenResponse.access_token);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google sign-in was cancelled or failed.');
      setGoogleLoading(false);
    },
    flow: 'implicit',
    scope: 'email profile',
  });

  /* ── Reusable dots spinner ── */
  const Dots = ({ dark = false }: { dark?: boolean }) => (
    <span className="flex gap-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-[#1A1A1A]' : 'bg-white'}`}
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );

  /* ── Google button ── */
  const GoogleButton = () => (
    <button
      type="button"
      disabled={googleLoading || loading}
      onClick={() => { setError(''); triggerGoogle(); }}
      className="w-full py-3 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#1A1A1A] transition-all duration-200 hover:bg-[#ECEAE5] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: '#FAFAF8', border: '1.5px solid #D4C4A8', borderRadius: 0 }}
    >
      {googleLoading ? <Dots dark /> : <><GoogleIcon />Continue with Google</>}
    </button>
  );

  if (!open) return null;

  /* ── Logged-in state ── */
  if (user) {
    const initials = [user.first_name, user.last_name].filter(Boolean).map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();
    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      >
        <div
          className="w-full max-w-sm animate-fade-slide-up my-auto"
          style={{ background: '#F2EDE4', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(212,196,168,0.5)' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                <span className="text-white text-[7px] font-black">B</span>
              </div>
              <span className="font-black text-[#1A1A1A] text-sm" style={{ letterSpacing: '-0.02em' }}>Browse AI</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-[#E8E0D4] transition-colors rounded-full">
              <X size={14} className="text-[#6B6B6B]" />
            </button>
          </div>

          {/* Profile */}
          <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white"
              style={{ background: '#1A1A1A' }}
            >
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                : initials
              }
            </div>
            <div>
              {(user.first_name || user.last_name) && (
                <p className="font-black text-[#1A1A1A] text-lg" style={{ letterSpacing: '-0.02em' }}>
                  {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                </p>
              )}
              <p className="text-sm text-[#6B6B6B] font-medium mt-0.5">{user.email}</p>
            </div>

            <div
              className="w-full flex items-center gap-2.5 p-3.5 mt-2"
              style={{ background: '#EDE9E1', border: '1px solid rgba(196,168,130,0.3)' }}
            >
              <Sparkles size={12} style={{ color: '#C4A882' }} className="shrink-0" />
              <p className="text-[11px] text-[#6B6B6B] font-medium text-left leading-snug">
                Your searches and bookmarks are synced across devices.
              </p>
            </div>
          </div>

          {/* Sign out */}
          <div className="px-6 pb-6 flex flex-col gap-2">
            {error && <p className="text-[11px] text-[#E57373] font-semibold text-center">{error}</p>}
            <button
              disabled={logoutLoading}
              onClick={async () => {
                setLogoutLoading(true);
                setError('');
                try {
                  await logout();
                  onClose();
                } catch {
                  setError('Sign out failed. Please try again.');
                } finally {
                  setLogoutLoading(false);
                }
              }}
              className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-[#1A1A1A] transition-all hover:bg-[#E8E0D4] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: '1.5px solid #D0CCC4' }}
            >
              {logoutLoading
                ? <span className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#1A1A1A] rounded-full animate-bounce" style={{animationDelay:`${i*120}ms`}}/>)}</span>
                : <><LogOut size={13} />Sign out</>
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Auth forms ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regPassword2) { setError('Please fill in all required fields.'); return; }
    if (regPassword !== regPassword2) { setError('Passwords do not match.'); return; }
    if (regPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      await register(regEmail, regPassword, regPassword2, regFirst, regLast);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-sm animate-fade-slide-up my-auto"
        style={{ background: '#F2EDE4', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(212,196,168,0.5)' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#1A1A1A' }}>
              <span className="text-white text-[7px] font-black">B</span>
            </div>
            <span className="font-black text-[#1A1A1A] text-sm" style={{ letterSpacing: '-0.02em' }}>Browse AI</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-[#E8E0D4] transition-colors rounded-full">
            <X size={14} className="text-[#6B6B6B]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(212,196,168,0.5)' }}>
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-[11px] font-black tracking-[0.12em] uppercase transition-all duration-200"
              style={{
                color: tab === t ? '#1A1A1A' : '#9B9B9B',
                borderBottom: tab === t ? '2px solid #1A1A1A' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {tab === 'login' ? (
            <div className="flex flex-col gap-4">
              <GoogleButton />
              <OrDivider />
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Field label="Email" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" />
                <Field label="Password" type="password" value={loginPassword} onChange={setLoginPassword} placeholder="••••••••" />
                {error && <p className="text-[11px] text-[#E57373] font-semibold -mt-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 font-black text-sm text-white tracking-wide transition-all duration-200 active:scale-[0.98] mt-1"
                  style={{ background: loading ? '#555' : '#1A1A1A', letterSpacing: '0.06em' }}
                >
                  {loading ? <Dots /> : <><Mail size={13} /> Sign in</>}
                </button>
                <p className="text-center text-[11px] text-[#9B9B9B]">
                  No account?{' '}
                  <button type="button" onClick={() => setTab('register')} className="text-[#1A1A1A] font-bold underline underline-offset-2">
                    Create one
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <GoogleButton />
              <OrDivider />
              <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" value={regFirst} onChange={setRegFirst} placeholder="Alex" />
                  <Field label="Last name" value={regLast} onChange={setRegLast} placeholder="Kim" />
                </div>
                <Field label="Email *" type="email" value={regEmail} onChange={setRegEmail} placeholder="you@example.com" />
                <Field label="Password *" type="password" value={regPassword} onChange={setRegPassword} placeholder="Min. 8 characters" />
                <Field label="Confirm password *" type="password" value={regPassword2} onChange={setRegPassword2} placeholder="••••••••" />
                {error && <p className="text-[11px] text-[#E57373] font-semibold -mt-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 font-black text-sm text-white tracking-wide transition-all duration-200 active:scale-[0.98] mt-1"
                  style={{ background: loading ? '#555' : '#1A1A1A', letterSpacing: '0.06em' }}
                >
                  {loading ? <Dots /> : <><User size={13} /> Create account <ArrowRight size={13} /></>}
                </button>
                <p className="text-center text-[11px] text-[#9B9B9B]">
                  Already have one?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-[#1A1A1A] font-bold underline underline-offset-2">
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 pb-5">
          <p className="text-center text-[10px] text-[#AAAAAA] leading-relaxed">
            Optional — Browse AI works great without an account too.
          </p>
        </div>
      </div>
    </div>
  );
}
