import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../store/useAuthStore';

export const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await register(name, email, password);
    setLoading(false);

    if (success) {
      navigate('/home');
    } else {
      setError('An account with this email already exists');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col justify-center px-4 max-w-md mx-auto relative z-10 py-10 space-y-6">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#34D399] border border-[#34D399]/40 text-[#0A0E14] flex items-center justify-center font-display font-extrabold text-3xl mx-auto shadow-lg shadow-[#22C55E]/30">
          Y
        </div>
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[#F5F7FA]">
            Create Account
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Start tracking your posture alignment in seconds
          </p>
        </div>
      </div>

      <GlassCard variant="focal" glowColor="emerald" className="p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest block">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aria Patel"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/12 text-[#F5F7FA] placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

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
                placeholder="aria@yogasense.ai"
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
            Create Free Account
          </GlassButton>
        </form>
      </GlassCard>

      <p className="text-center text-xs text-[#94A3B8]">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-[#34D399] font-bold hover:underline"
        >
          Sign in instead
        </button>
      </p>
    </div>
  );
};
