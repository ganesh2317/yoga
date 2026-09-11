import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
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
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-center px-4 max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-500 text-background flex items-center justify-center font-display font-bold text-2xl mx-auto shadow-lg shadow-primary-500/25">
          YS
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary">
            YogaSense <span className="text-primary-400">v2</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            In-browser AI posture tracking & guided yoga journey
          </p>
        </div>
      </div>

      <Surface variant="raised" className="p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yogi@example.com"
                className="w-full bg-surface-2 border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-2 border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-danger-500 bg-danger-500/10 p-2.5 rounded-lg border border-danger-500/20">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-lg shadow-primary-500/20"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-surface-border"></div>
          <span className="flex-shrink mx-3 text-[11px] text-text-muted uppercase">or</span>
          <div className="flex-grow border-t border-surface-border"></div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          <Sparkles className="w-4 h-4 mr-1.5 text-primary-400" />
          Try Guest Demo Account
        </Button>
      </Surface>

      <div className="text-center text-xs text-text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-400 hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};
