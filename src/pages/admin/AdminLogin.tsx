import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate }) => {
  const { loginWithGoogle, loginDemoAdmin, isAdmin, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
      onNavigate('admin-dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Unable to authenticate with Google. You can also use the Authorized Admin Session button below.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoAdmin = () => {
    loginDemoAdmin();
    onNavigate('admin-dashboard');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#333333] text-[#F5A623] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-[#333333]">BORICART Admin Portal</h1>
          <p className="text-xs text-gray-500">
            Authorized management backend for products, categories, orders, and store settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 pt-2">
          {/* Sign in with Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-3.5 px-4 border border-gray-300 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-50"
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
            <span>Sign In with Authorized Google Account</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">
              Or Administrator Quick Access
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Quick Access for Admin */}
          <button
            onClick={handleDemoAdmin}
            className="w-full bg-[#F5A623] hover:bg-[#D98200] text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Boricart Admin Dashboard</span>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Designated Admin: <strong>boricartmarketplace@gmail.com</strong>
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-gray-500 hover:text-[#F5A623] mt-2 block mx-auto"
          >
            ← Return to Public Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
