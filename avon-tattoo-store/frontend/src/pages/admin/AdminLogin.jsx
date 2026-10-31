import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/common/SEO';
import logoImg from '../../assets/logo.jpeg';

export const AdminLogin = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password, 'admin');
      
      // Strict Admin Role Verification
      if (data.user?.role !== 'admin') {
        logout();
        setError('Access Denied: Customer accounts cannot log in to the Studio Admin Portal.');
        return;
      }
      
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid administrator credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <SEO title="Studio Admin Login - TatRabbit Control Center" description="Administrator Portal for TatRabbit Management" />
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Top Header Logo & Title */}
        <div className="text-center space-y-3">
          <img src={logoImg} alt="TatRabbit Logo" className="h-16 sm:h-20 w-auto object-contain mx-auto drop-shadow-xl" />
          <div className="space-y-1">
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
              Restricted Portal
            </span>
            <h1 className="font-heading font-semibold text-base sm:text-lg text-white tracking-tight pt-1">
              Studio Admin Login
            </h1>
            <p className="text-xs text-slate-400 font-normal">
              TatRabbit Management Desk
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form Box */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800/90 rounded-[2rem] p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tatrabbit.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Admin Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Authenticating Admin...' : 'Authenticate & Open Control Panel'}
          </button>
        </form>

        {/* Bottom Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2 px-2">
          <Link to="/" className="hover:text-blue-400 font-semibold flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
          <Link to="/login" className="hover:text-white font-semibold transition-colors">
            Customer Login →
          </Link>
        </div>

      </div>
    </div>
  );
};
