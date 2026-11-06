import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, UserPlus, LogIn, Mail, Key, User, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminRole } from '../../types';

interface AdminLoginProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const { loginWithGoogle, loginWithEmailPassword, registerWithEmailPassword, loginDemoAdmin } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('overall_admin');

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onNavigate('admin-dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to authenticate with Google. You can use Email/Password or Instant Access below.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email/Password Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter your email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long');

        await registerWithEmailPassword(name, email, password, selectedRole);
        setSuccessMsg('Account registered and role privileges activated!');
        setTimeout(() => {
          onNavigate('admin-dashboard');
        }, 600);
      } else {
        if (!email.trim() || !password) throw new Error('Please provide both email and password');
        await loginWithEmailPassword(email, password);
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify your credentials or register.';
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant demo access
  const handleQuickAccess = (role: AdminRole = 'overall_admin') => {
    loginDemoAdmin(role);
    onNavigate('admin-dashboard');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm inline-flex items-center">
              <img
                src="/assets/aistudio/boricart_logo.png"
                alt="BORICART"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-xl font-black text-[#333333]">
            {mode === 'register' ? 'Register Admin Staff' : 'Administrator Portal'}
          </h1>
          <p className="text-xs text-gray-500">
            {mode === 'register'
              ? 'Create a secure staff account with role-based access privileges.'
              : 'Authorized management backend for products, orders, delivery, and store content.'}
          </p>
        </div>

        {/* Security & Firebase Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-emerald-950 block">Firebase Auth & Database Active</span>
            <span className="text-[11px] text-emerald-700">Role-Based Access Control Enabled</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </div>

        {/* Mode Toggle Tabs (Login vs Register) */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Admin</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email & Password Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adebayo Olumide"
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@boricart.com"
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
              <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {mode === 'register' && (
              <span className="text-[10px] text-gray-400 mt-1 block">Minimum 6 characters</span>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Access Privilege & Role
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623] font-semibold text-gray-800"
                >
                  <option value="overall_admin">👑 Overall Admin (Full Access: CMS, Staff, Catalog, Orders)</option>
                  <option value="store_keeper">📦 Store Keeper (Catalog, Stock Levels, Pricing)</option>
                  <option value="order_dispatcher">🚚 Order Dispatcher (Order Fulfillment, Delivery)</option>
                </select>
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F5A623] hover:bg-[#D98200] text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Admin Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In with Email</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-[11px] font-semibold text-gray-400 uppercase">
            Or Choose Authentication Method
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Social / Direct Options */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 border border-gray-300 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 text-xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAccess('overall_admin')}
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold py-2.5 px-4 rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Instant Access: Overall Admin (boricartmarketplace@gmail.com)</span>
          </button>
        </div>

        <div className="pt-3 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Designated Overall Admin: <strong className="text-gray-700">boricartmarketplace@gmail.com</strong>
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-gray-500 hover:text-[#F5A623] mt-2 block mx-auto cursor-pointer"
          >
            ← Return to Public Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
