import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { useAuthStore } from '../store/useAuthStore';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError, isLoading } = useAuthStore();

  const [email, setEmail] = useState('demo@yogasense.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setValidationError('Password must be at least 4 characters.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative z-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-sage-glow mb-4">
          <span className="font-display font-extrabold text-bg-darkest text-3xl">Y</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-text-primary tracking-tight">
          Welcome to <span className="text-accent-emerald">YogaSense AI</span>
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Your personal real-time computer vision yoga posture assistant
        </p>
      </div>

      <GlassCard variant="focal" className="w-full p-6 sm:p-8 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/12 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/12 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {(validationError || error) && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {validationError || error}
            </div>
          )}

          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            Sign In to Practice
          </GlassButton>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-text-secondary">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-accent-emerald hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </GlassCard>

      <div className="mt-6 flex items-center gap-2 text-xs text-text-tertiary bg-white/[0.03] border border-white/[0.06] px-4 py-2 rounded-full backdrop-blur-md">
        <Sparkles className="w-4 h-4 text-accent-emerald" />
        <span>100% Client-Side Computer Vision & Privacy</span>
      </div>
    </div>
  );
};
