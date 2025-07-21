import React, { useState } from 'react';
import { ArrowRight, Shield, Smartphone, TrendingUp, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const Home: React.FC = () => {
  console.log('🔍 Debug: Home component rendering...');
  const [showRegister, setShowRegister] = useState(false);

  const features = [
    {
      icon: TrendingUp,
      title: 'Analisis Keuangan Pintar',
      description: 'Dapatkan wawasan mendalam tentang pola pengeluaran dan pemasukan Anda dengan dashboard yang intuitif.'
    },
    {
      icon: Shield,
      title: 'Keamanan Terjamin',
      description: 'Data keuangan Anda dilindungi dengan enkripsi tingkat bank dan sistem keamanan berlapis.'
    },
    {
      icon: Smartphone,
      title: 'Akses Dimana Saja',
      description: 'Kelola keuangan Anda dari mana saja dengan antarmuka yang responsif dan mudah digunakan.'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 p-4">
      <div className="w-full max-w-md">
        {showRegister ? (
          <RegisterForm onShowLogin={() => setShowRegister(false)} />
        ) : (
          <LoginForm onShowRegister={() => setShowRegister(true)} />
        )}
      </div>
    </div>
  );
};

export default Home;