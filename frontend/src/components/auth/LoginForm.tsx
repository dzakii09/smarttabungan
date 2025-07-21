import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface LoginFormProps {
  onShowRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      });
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(
        err.response?.data?.message || 'Login gagal. Silakan cek email dan password Anda.'
      );
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
      {/* Ilustrasi/Hero */}
      <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-200 px-10 py-12">
        <h3 className="text-xl font-bold text-primary-700 mb-2">Selamat Datang Kembali!</h3>
        <p className="text-primary-500 text-center max-w-xs">Akses SmartWealth dan kelola keuangan Anda dengan mudah, aman, dan cerdas.</p>
      </div>
      {/* Form Login */}
      <div className="w-full max-w-md p-8 md:p-12 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl tracking-wider">SW</span>
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-800 font-inter mb-1 animate-fade-in">Masuk ke SmartWealth</h2>
          <p className="text-neutral-500 mt-1 animate-fade-in delay-100">Kelola keuangan Anda dengan lebih pintar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up delay-200">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all placeholder-neutral-300 hover:shadow-md"
                placeholder="masukkan@email.com"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Kata Sandi</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all placeholder-neutral-300 hover:shadow-md"
                placeholder="Masukkan kata sandi"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-primary-500 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center select-none">
              <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-400" />
              <span className="ml-2 text-sm text-neutral-600">Ingat saya</span>
            </label>
            <button type="button" className="text-sm text-primary-500 hover:text-primary-700 font-semibold transition-colors">Lupa kata sandi?</button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center animate-shake">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-100 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2"><span className="loader loader-sm"></span> Memproses...</span>
            ) : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 text-center animate-fade-in-up delay-300">
          <p className="text-neutral-600">
            Belum memiliki akun?{' '}
            <button className="text-primary-500 hover:text-primary-700 font-bold underline underline-offset-2 transition-colors" onClick={onShowRegister}>
              Daftar sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;