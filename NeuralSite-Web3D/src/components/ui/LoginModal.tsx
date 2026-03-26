// LoginModal - Authentication modal for JWT login
import { useState } from 'react';
import { GlassCard, GradientButton } from './ModernUI';
import { apiService } from '../../core/api';
import { setToken } from '../../core/api';

interface LoginModalProps {
  onSuccess: () => void;
  onRegister?: () => void;
}

export function LoginModal({ onSuccess, onRegister }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await apiService.login(username, password);
      setToken(result.access_token);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-sm p-6 lg:p-8" glow="blue">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">NeuralSite</h1>
          <p className="text-gray-400 text-sm">工程管理系统</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <GradientButton
            type="submit"
            variant="blue"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </GradientButton>

          <div className="text-center text-sm">
            <span className="text-gray-400">默认账号: </span>
            <span className="text-gray-300">admin / admin123</span>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
