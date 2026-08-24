import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../store/useAuthStore';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/home');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await login('demo@yogasense.ai', 'password123');
    setLoading(false);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col justify-center px-4 max-w-md mx-auto relative z-10 py-10 space-y-6">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#34D399] border border-[#34D399]/40 text-[#0A0E14] flex items-center justify-center font-display font-extrabold text-3xl mx-auto shadow-lg shadow-[#22C55E]/30">
          Y
        </div>
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[#F5F7FA]">
            YogaSense <span className="text-[#34D399]">AI</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Real-time AI posture feedback & guided yoga assistant
          </p>
        </div>
      </div>

      <GlassCard variant="focal" glowColor="emerald" className="p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yogi@yogasense.ai"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/12 text-[#F5F7FA] placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/12 text-[#F5F7FA] placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#EF4444] font-medium text-center">{error}</p>}

          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Sign In
          </GlassButton>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#0A0E14] text-[10px] font-bold text-[#64748B] uppercase">
            Quick Guest Access
          </span>
        </div>

        <GlassButton
          onClick={handleDemoLogin}
          variant="warm"
          size="md"
          fullWidth
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Explore Demo Mode
        </GlassButton>
      </GlassCard>

      <p className="text-center text-xs text-[#94A3B8]">
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/register')}
          className="text-[#34D399] font-bold hover:underline"
        >
          Create one now
        </button>
      </p>
    </div>
  );
};
