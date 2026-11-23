import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, X } from 'lucide-react';
import { BRAND_LOGO_URL } from '../data/catalog';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signInWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const formatAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/operation-not-allowed')) {
      return 'Email/Password sign-in is not yet enabled in Firebase Console -> Authentication -> Sign-in method. Please use Google Sign-In below or enable Email/Password in Firebase Console.';
    }
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
      return 'Invalid email or password.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists. Please sign in.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password must be at least 6 characters.';
    }
    return msg;
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        await registerWithEmail(name, email, password);
        onClose();
      } else {
        await resetPassword(email);
        setInfo('Password reset link sent to your email.');
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <img src={BRAND_LOGO_URL} alt="Samsara Choice Ltd" className="h-8 w-auto rounded" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              {mode === 'login'
                ? 'Customer Sign In'
                : mode === 'register'
                ? 'Create Samsara Account'
                : 'Reset Password'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close auth modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-5 space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogle}
            className="w-full py-3 px-4 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5"
          >
            <span className="w-4 h-4 rounded-full bg-[#0B2D71] text-white text-[10px] font-bold flex items-center justify-center">
              G
            </span>
            <span>Continue with Google (Instant Verified Access)</span>
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200" />
            <span className="px-3 text-xs text-slate-400">or with email</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#D61A1E]">
              {error}
            </div>
          )}
          {info && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-[#0B2D71]">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 6 characters)"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#0B2D71] hover:bg-[#082257] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : 'Send Password Reset Link'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2 text-slate-600">
            {mode === 'login' ? (
              <>
                <button type="button" onClick={() => setMode('register')} className="hover:text-[#D61A1E] font-medium">
                  New customer? Register
                </button>
                <button type="button" onClick={() => setMode('reset')} className="hover:text-[#0B2D71]">
                  Forgot password?
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setMode('login')} className="hover:text-[#0B2D71] font-medium">
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
