export interface Subject {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  description: string;
}

export interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Zodiac {
  id: string;
  name: string;
  emoji: string;
  image: string;
  examPages: number;
  color: string;
  luckyNumber: number;
  description: string;
}

export interface UserProgress {
  totalScore: number;
  completedQuestions: number;
  correctAnswers: number;
  streak: number;
  history: {
    date: string;
    zodiacId: string;
    score: number;
  }[];
}

export interface AppSettings {
  apiKey: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: 'light' | 'dark';
  selectedModel: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface SessionData {
  progress: UserProgress;
  selectedZodiacId: string | null;
  savedAt: string;
}

export const ZODIACS: Zodiac[] = [
  { id: 'rat', name: 'Tý', emoji: '🐭', image: '/1.png', examPages: 4, color: 'bg-amber-100 text-amber-600', luckyNumber: 1, description: 'Thông minh, nhanh nhẹn' },
  { id: 'ox', name: 'Sửu', emoji: '🐮', image: '/2.png', examPages: 4, color: 'bg-stone-100 text-stone-600', luckyNumber: 2, description: 'Cần cù, chịu khó' },
  { id: 'tiger', name: 'Dần', emoji: '🐯', image: '/3.png', examPages: 4, color: 'bg-orange-100 text-orange-600', luckyNumber: 3, description: 'Mạnh mẽ, quyết đoán' },
  { id: 'cat', name: 'Mão', emoji: '🐱', image: '/4.png', examPages: 4, color: 'bg-emerald-100 text-emerald-600', luckyNumber: 4, description: 'Tinh tế, nhẹ nhàng' },
  { id: 'dragon', name: 'Thìn', emoji: '🐲', image: '/5.png', examPages: 4, color: 'bg-red-100 text-red-600', luckyNumber: 5, description: 'Uy quyền, may mắn' },
  { id: 'snake', name: 'Tỵ', emoji: '🐍', image: '/6.png', examPages: 4, color: 'bg-green-100 text-green-600', luckyNumber: 6, description: 'Khôn ngoan, bí ẩn' },
  { id: 'horse', name: 'Ngọ', emoji: '🐴', image: '/7.png', examPages: 4, color: 'bg-yellow-100 text-yellow-600', luckyNumber: 7, description: 'Tự do, phóng khoáng' },
  { id: 'goat', name: 'Mùi', emoji: '🐐', image: '/8.png', examPages: 4, color: 'bg-rose-100 text-rose-600', luckyNumber: 8, description: 'Ôn hòa, điềm tĩnh' },
  { id: 'monkey', name: 'Thân', emoji: '🐵', image: '/9.png', examPages: 4, color: 'bg-purple-100 text-purple-600', luckyNumber: 9, description: 'Lanh lợi, hoạt bát' },
  { id: 'rooster', name: 'Dậu', emoji: '🐔', image: '/10.png', examPages: 4, color: 'bg-orange-100 text-orange-700', luckyNumber: 10, description: 'Chăm chỉ, đúng giờ' },
  { id: 'dog', name: 'Tuất', emoji: '🐶', image: '/11.png', examPages: 4, color: 'bg-stone-100 text-stone-700', luckyNumber: 11, description: 'Trung thành, tin cậy' },
  { id: 'pig', name: 'Hợi', emoji: '🐷', image: '/12.png', examPages: 4, color: 'bg-pink-100 text-pink-600', luckyNumber: 12, description: 'Sung túc, an nhàn' },
];

export const SUBJECTS: Subject[] = [
  { id: 'tet_trivia', name: 'Đố Vui Tết', icon: '🎉', description: 'Kiến thức về ngày Tết cổ truyền' },
  { id: 'math', name: 'Toán Học', icon: '📐', description: 'Thử thách tư duy logic' },
  { id: 'literature', name: 'Văn Học', icon: '📚', description: 'Ca dao, tục ngữ, thơ văn' },
  { id: 'history', name: 'Lịch Sử', icon: '🏛️', description: 'Lịch sử Việt Nam hào hùng' },
  { id: 'science', name: 'Khoa Học', icon: '🔬', description: 'Khám phá thế giới tự nhiên' },
  { id: 'english', name: 'Tiếng Anh', icon: '🔤', description: 'Từ vựng và ngữ pháp' },
];
