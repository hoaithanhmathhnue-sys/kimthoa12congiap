import React from 'react';
import { Settings, Volume2, VolumeX, Music, Music4 } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onOpenSettings, onToggleSound, onToggleMusic }) => {
  return (
    <header className="sticky top-0 z-50 glass-panel px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            🧧
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-yellow-500 font-display">
            Vòng Quay 12 Con Giáp
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMusic}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title={settings.musicEnabled ? "Tắt nhạc" : "Bật nhạc"}
          >
            {settings.musicEnabled ? <Music className="w-5 h-5 text-red-500" /> : <Music4 className="w-5 h-5" />}
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title={settings.soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-blue-500" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {!settings.apiKey && (
            <span className="text-xs text-red-500 font-bold animate-pulse hidden sm:inline">
              Lấy API key để sử dụng app →
            </span>
          )}

          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-medium ${!settings.apiKey
              ? 'bg-red-50 border-2 border-red-300 text-red-600 animate-pulse'
              : 'bg-white border border-gray-200 text-gray-700'
              }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{settings.apiKey ? 'Cài đặt' : 'API Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
