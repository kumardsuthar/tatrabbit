import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/common/SEO';
import logoImg from '../assets/logo.jpeg';

export const Login = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as customer, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      if (redirect === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/orders');
      }
    }
  }, [isAuthenticated, redirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password, 'user');

      // Strict role check: Admin accounts cannot log in via Customer Login
      if (data.user?.role === 'admin') {
        logout('user');
        setError('Admin accounts cannot log in through the customer panel.');
        return;
      }

      if (redirect === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/orders');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to sign in. Please verify your credentials.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6 font-sans">
      <SEO title="Customer & Artist Sign In - TatRabbit" description="Sign in to your TatRabbit customer account" />

      {/* Header */}
      <div className="text-center space-y-3">

        <div className="space-y-1">
          <h1 className="font-heading font-semibold text-2xl text-slate-900">Customer & Artist Sign In</h1>
          <p className="text-xs text-slate-500 font-medium">Sign in to view order history, save wishlist & manage studio orders</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold space-y-2 shadow-xs">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Customer Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="artist@studio.com"
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 pl-4 pr-11 py-2.5 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-right mt-1.5">
            <Link to="/forgot-password" className="text-xs text-blue-600 font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
        >
          <LogIn className="w-4 h-4" /> {loading ? 'Signing In...' : 'Sign In to Customer Account'}
        </button>
      </form>

      {/* Account Registration Link */}
      <div className="text-center text-xs text-slate-500 font-medium">
        New tattoo studio or independent artist?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};


