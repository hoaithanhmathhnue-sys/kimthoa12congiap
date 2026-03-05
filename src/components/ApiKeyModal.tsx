import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, ExternalLink, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Vui lòng nhập API Key');
      return;
    }
    if (!trimmed.startsWith('AIza')) {
      setError('API Key không hợp lệ. Key phải bắt đầu bằng "AIza..."');
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-6 text-white text-center">
          <div className="text-5xl mb-3">🧧</div>
          <h2 className="text-2xl font-bold font-display">Vòng Quay 12 Con Giáp</h2>
          <p className="text-sm text-white/90 mt-1">Chào mừng bạn đến với trò chơi Tết!</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              Bạn cần API Key để bắt đầu
            </h3>
            <p className="text-sm text-amber-700">
              App sử dụng Gemini AI để tạo câu hỏi trí tuệ. Hãy lấy API key miễn phí từ Google AI Studio.
            </p>
          </div>

          <a
            href="https://aistudio.google.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors font-medium text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Lấy API Key tại Google AI Studio
          </a>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Nhập Gemini API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="AIza..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-lg"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <p className="text-xs text-gray-500">
              API Key được lưu an toàn trong trình duyệt, không gửi đến server nào khác.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!key.trim()}
            className={`
              w-full px-6 py-3 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2
              ${key.trim()
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            🎉 Bắt Đầu Chơi!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
