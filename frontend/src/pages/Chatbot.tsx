import React from 'react';
import { MessageCircle, Sparkles, Shield, Clock } from 'lucide-react';
import ChatInterface from '../components/chatbot/ChatInterface';

const Chatbot: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles size={32} />
          <h1 className="text-2xl font-bold font-inter">
            Asisten Keuangan AI
          </h1>
        </div>
        <p className="text-primary-100">
          Tanyakan apa saja tentang keuangan pribadi, budgeting, investasi, dan perencanaan keuangan. 
          AI kami siap membantu dengan saran yang personal dan praktis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center">
              <MessageCircle size={20} className="mr-2 text-primary-500" />
              Yang Bisa Saya Bantu
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>• Perencanaan anggaran bulanan</li>
              <li>• Strategi menabung efektif</li>
              <li>• Tips investasi untuk pemula</li>
              <li>• Analisis pengeluaran</li>
              <li>• Perencanaan dana darurat</li>
              <li>• Manajemen utang</li>
              <li>• Tujuan keuangan jangka panjang</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-secondary-500" />
              Keamanan & Privasi
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              Percakapan Anda aman dan tidak disimpan permanen. AI kami hanya fokus pada topik keuangan.
            </p>
            <div className="text-xs text-neutral-500">
              <p>✓ Data tidak dibagikan</p>
              <p>✓ Enkripsi end-to-end</p>
              <p>✓ Fokus keuangan saja</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center">
              <Clock size={20} className="mr-2 text-accent-500" />
              Tips Penggunaan
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>• Jelaskan situasi keuangan Anda dengan detail</li>
              <li>• Tanyakan pertanyaan spesifik</li>
              <li>• Gunakan angka untuk analisis yang lebih baik</li>
              <li>• Tanya follow-up untuk klarifikasi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;