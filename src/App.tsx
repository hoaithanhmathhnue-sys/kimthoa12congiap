import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Wheel } from './components/Wheel';
import { ZodiacGrid } from './components/ZodiacGrid';
import { QuizModal } from './components/QuizModal';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useAppStore } from './hooks/useAppStore';
import { Zodiac, ZODIACS, SessionData, UserProgress } from './types';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'motion/react';

// Sound Assets
const TET_MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chinese-new-year-126466.mp3';
const SPIN_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';
const WIN_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';

const SESSION_KEY = 'zodiac_game_session';

function App() {
  const { settings, setSettings, progress, setProgress } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedZodiac, setSelectedZodiac] = useState<Zodiac | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Session Persistence states
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [pendingSession, setPendingSession] = useState<SessionData | null>(null);

  // Audio Refs
  const bgMusicRef = useRef<Howl | null>(null);
  const spinSoundRef = useRef<Howl | null>(null);
  const winSoundRef = useRef<Howl | null>(null);

  // Initialize Audio
  useEffect(() => {
    bgMusicRef.current = new Howl({
      src: [TET_MUSIC_URL],
      loop: true,
      volume: 0.3,
      html5: true,
    });

    spinSoundRef.current = new Howl({
      src: [SPIN_SOUND_URL],
      volume: 0.5,
    });

    winSoundRef.current = new Howl({
      src: [WIN_SOUND_URL],
      volume: 0.6,
    });

    return () => {
      bgMusicRef.current?.unload();
      spinSoundRef.current?.unload();
      winSoundRef.current?.unload();
    };
  }, []);

  // Handle Music Toggle
  useEffect(() => {
    if (settings.musicEnabled) {
      bgMusicRef.current?.play();
    } else {
      bgMusicRef.current?.pause();
    }
  }, [settings.musicEnabled]);

  // === SESSION PERSISTENCE ===

  // Kiểm tra phiên đã lưu khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const data: SessionData = JSON.parse(saved);
        if (data.progress && data.progress.totalScore > 0) {
          setPendingSession(data);
          setShowRestoreModal(true);
        }
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Auto-save phiên mỗi 5 giây khi có thay đổi
  const saveSession = useCallback(() => {
    if (progress.totalScore <= 0 && progress.completedQuestions <= 0) return;

    try {
      const sessionData: SessionData = {
        progress: { ...progress },
        selectedZodiacId: selectedZodiac?.id || null,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('⚠️ Không thể lưu phiên:', e);
    }
  }, [progress, selectedZodiac]);

  useEffect(() => {
    const timer = setTimeout(() => saveSession(), 5000);
    return () => clearTimeout(timer);
  }, [progress, selectedZodiac, saveSession]);

  // Khôi phục phiên
  const restoreSession = (data: SessionData) => {
    setProgress(data.progress);
    if (data.selectedZodiacId) {
      const zodiac = ZODIACS.find(z => z.id === data.selectedZodiacId);
      if (zodiac) setSelectedZodiac(zodiac);
    }
  };

  // Xóa phiên
  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  // === HANDLERS ===

  const handleApiKeySave = (key: string) => {
    setSettings({ ...settings, apiKey: key });
  };

  const handleSpinStart = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedZodiac(null);
    if (settings.soundEnabled) {
      spinSoundRef.current?.play();
    }
  };

  const handleSpinEnd = (zodiac: Zodiac) => {
    setIsSpinning(false);
    setSelectedZodiac(zodiac);
    setShowResult(true);
    if (settings.soundEnabled) {
      spinSoundRef.current?.stop();
      winSoundRef.current?.play();
    }

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ffd700', '#ffffff']
    });
  };

  const handleZodiacClick = (zodiac: Zodiac) => {
    if (selectedZodiac?.id === zodiac.id) {
      setIsQuizOpen(true);
    }
  };

  const handleQuestionAnswered = () => {
    setProgress({
      ...progress,
      completedQuestions: progress.completedQuestions + 1,
    });
  };

  const handleCorrectAnswer = () => {
    setIsQuizOpen(false);
    const newScore = progress.totalScore + 10;
    setProgress({
      ...progress,
      totalScore: newScore,
      correctAnswers: progress.correctAnswers + 1,
      completedQuestions: progress.completedQuestions, // already updated via handleQuestionAnswered
      streak: progress.streak + 1,
      history: [...progress.history, { date: new Date().toISOString(), zodiacId: selectedZodiac?.id || '', score: 10 }]
    });

    // Fireworks animation
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#ffd700']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#ffd700']
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div className="min-h-screen tet-gradient pb-20">
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
        onToggleMusic={() => setSettings({ ...settings, musicEnabled: !settings.musicEnabled })}
      />

      <main className="container mx-auto px-4 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-8 text-white">
          <h2 className="text-3xl md:text-5xl font-display mb-2 drop-shadow-md">
            Vui Xuân Đón Tết
          </h2>
          <p className="text-lg opacity-90 font-light">
            Quay vòng quay, nhận lì xì và thử tài kiến thức!
          </p>
        </div>

        {/* Wheel Section */}
        <div className="relative mb-12">
          <Wheel onSpinEnd={handleSpinEnd} isSpinning={isSpinning} />

          <button
            onClick={handleSpinStart}
            disabled={isSpinning}
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-48
              px-8 py-3 rounded-full font-bold text-lg shadow-xl transition-all transform
              ${isSpinning
                ? 'bg-gray-400 cursor-not-allowed scale-95'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-110 hover:shadow-2xl text-red-900 border-4 border-white'
              }
            `}
          >
            {isSpinning ? 'Đang quay...' : 'QUAY NGAY!'}
          </button>
        </div>

        {/* Stats Bar */}
        <div className="w-full max-w-5xl mb-6 flex gap-3 px-4">
          <div className="flex-1 bg-white/90 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-red-600">{progress.totalScore}</div>
            <div className="text-xs text-gray-500">Tổng điểm</div>
          </div>
          <div className="flex-1 bg-white/90 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{progress.completedQuestions}</div>
            <div className="text-xs text-gray-500">Đã chơi</div>
          </div>
          <div className="flex-1 bg-white/90 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{progress.correctAnswers}</div>
            <div className="text-xs text-gray-500">Trả lời đúng</div>
          </div>
          <div className="flex-1 bg-white/90 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{progress.streak}</div>
            <div className="text-xs text-gray-500">Chuỗi đúng</div>
          </div>
        </div>

        {/* Zodiac Grid */}
        <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2 mb-2">
                <span className="text-2xl">🦁</span> 12 Con Giáp
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-red-50/50 p-2 rounded-xl border border-red-100">
                <img src="/avatar.jpg" alt="Avatar GV" className="w-12 h-12 rounded-full object-cover border-2 border-red-200 shadow-sm" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-red-600">Giáo viên: Trần Thị Kim Thoa</span>
                  <span className="font-medium text-gray-800">Trường THPT Hoàng Diệu</span>
                  <span className="text-gray-500 text-xs mt-0.5">Số 1 Mạc Đĩnh Chi, phường Phú Lợi, thành phố Cần Thơ</span>
                </div>
                <img src="/logo.jpg" alt="Logo Trường" className="w-12 h-12 object-contain ml-2" />
              </div>
            </div>
            <div className="bg-red-100 text-red-600 px-4 py-1 rounded-full font-bold text-sm shrink-0">
              Điểm: {progress.totalScore}
            </div>
          </div>

          <ZodiacGrid
            selectedZodiac={selectedZodiac}
            onZodiacClick={handleZodiacClick}
          />
        </div>

        {/* Result Modal - Hiển thị ảnh con giáp khi quay xong */}
        <AnimatePresence>
          {showResult && selectedZodiac && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowResult(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-red-500/20 to-orange-400/30 rounded-3xl blur-xl scale-110" />

                <div className="relative bg-gradient-to-b from-red-50 via-white to-yellow-50 rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400">
                  {/* Header decoration */}
                  <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-3 px-4 text-center">
                    <p className="text-yellow-200 text-sm font-medium">🎊 Chúc mừng! Bạn quay được 🎊</p>
                  </div>

                  {/* Zodiac Image */}
                  <div className="flex flex-col items-center px-6 pt-6 pb-4">
                    <motion.div
                      initial={{ rotate: -10 }}
                      animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                      className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)] mb-4"
                    >
                      <img
                        src={selectedZodiac.image}
                        alt={selectedZodiac.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    {/* Name & Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center"
                    >
                      <h3 className="text-3xl font-display font-bold text-red-700 mb-1">
                        {selectedZodiac.emoji} {selectedZodiac.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1">{selectedZodiac.description}</p>
                      <p className="text-xs text-gray-400">Số may mắn: {selectedZodiac.luckyNumber}</p>
                    </motion.div>
                  </div>

                  {/* Action buttons */}
                  <div className="px-6 pb-6 flex gap-3">
                    <button
                      onClick={() => setShowResult(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => {
                        setShowResult(false);
                        setIsQuizOpen(true);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
                    >
                      🧧 Mở Lì Xì
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>



      {/* Restore Session Modal */}
      <AnimatePresence>
        {showRestoreModal && pendingSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-sky-500 p-6 text-white text-center">
                <div className="text-4xl mb-2">💾</div>
                <h3 className="text-lg font-bold">Khôi phục phiên chơi</h3>
                <p className="text-sm text-blue-100">Bạn có phiên chơi chưa hoàn thành</p>
              </div>
              <div className="p-6">
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-4 space-y-1">
                  <p className="text-sm text-gray-700">
                    📊 Điểm: <strong className="text-red-600">{pendingSession.progress.totalScore}</strong>
                  </p>
                  <p className="text-sm text-gray-700">
                    ✅ Trả lời đúng: <strong>{pendingSession.progress.correctAnswers}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    🕐 Lưu lúc: {new Date(pendingSession.savedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRestoreModal(false);
                      clearSession();
                      setPendingSession(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    ✖ Chơi mới
                  </button>
                  <button
                    onClick={() => {
                      restoreSession(pendingSession);
                      setShowRestoreModal(false);
                      setPendingSession(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    ✔ Tiếp tục chơi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      {/* Quiz Modal */}
      <AnimatePresence>
        {isQuizOpen && (
          <QuizModal
            isOpen={isQuizOpen}
            onClose={() => setIsQuizOpen(false)}
            zodiac={selectedZodiac}
            onCorrectAnswer={handleCorrectAnswer}
            onQuestionAnswered={handleQuestionAnswered}
          />
        )}
      </AnimatePresence>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full pointer-events-none">
        <img
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Firecracker.png"
          className="absolute bottom-4 left-4 w-16 h-16 animate-bounce"
          alt="firecracker"
        />
        <img
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png"
          className="absolute bottom-10 right-10 w-12 h-12 animate-pulse"
          alt="sparkles"
        />
      </div>
    </div>
  );
}

export default App;
