import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zodiac } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, BookOpen, Award } from 'lucide-react';

// Types cho đề thi JSON
interface McQuestion {
  number: number;
  text: string;
  options: Record<string, string>;
  answer: string; // A, B, C, D
}

interface TfQuestion {
  number: number;
  text: string;
  items: Record<string, string>;
  answers: Record<string, boolean>;
}

interface ExamData {
  id: number;
  title: string;
  mcQuestions: McQuestion[];
  tfQuestions: TfQuestion[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  zodiac: Zodiac | null;
  onCorrectAnswer: () => void;
  onQuestionAnswered: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, zodiac, onCorrectAnswer, onQuestionAnswered }) => {
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MC state
  const [currentMcIndex, setCurrentMcIndex] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<Record<number, string>>({});
  const [mcSubmitted, setMcSubmitted] = useState(false);

  // TF state
  const [tfAnswers, setTfAnswers] = useState<Record<number, Record<string, boolean>>>({});
  const [tfSubmitted, setTfSubmitted] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'mc' | 'tf'>('mc');

  // Score state
  const [showScore, setShowScore] = useState(false);

  // Load exam khi mở modal
  useEffect(() => {
    if (isOpen && zodiac) {
      loadExam(zodiac.luckyNumber);
    }
  }, [isOpen, zodiac]);

  // Reset khi đóng
  useEffect(() => {
    if (!isOpen) {
      setExam(null);
      setCurrentMcIndex(0);
      setMcAnswers({});
      setMcSubmitted(false);
      setTfAnswers({});
      setTfSubmitted(false);
      setActiveTab('mc');
      setShowScore(false);
      setError(null);
    }
  }, [isOpen]);

  const loadExam = async (examNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/de_thi/${examNumber}.json`);
      if (!res.ok) throw new Error(`Không tìm thấy đề ${examNumber}`);
      const data: ExamData = await res.json();
      setExam(data);
    } catch (e: any) {
      setError(e.message || 'Không thể tải đề thi');
    } finally {
      setLoading(false);
    }
  };

  const handleMcAnswer = (qNumber: number, answer: string) => {
    if (mcSubmitted) return;
    setMcAnswers(prev => ({ ...prev, [qNumber]: answer }));
  };

  const handleTfAnswer = (qNumber: number, item: string, value: boolean) => {
    if (tfSubmitted) return;
    setTfAnswers(prev => ({
      ...prev,
      [qNumber]: { ...(prev[qNumber] || {}), [item]: value }
    }));
  };

  const calculateMcScore = () => {
    if (!exam) return { correct: 0, total: 0 };
    let correct = 0;
    const total = exam.mcQuestions.filter(q => q.answer).length;
    for (const q of exam.mcQuestions) {
      if (q.answer && mcAnswers[q.number] === q.answer) correct++;
    }
    return { correct, total };
  };

  const calculateTfScore = () => {
    if (!exam) return { correct: 0, total: 0 };
    let correct = 0;
    let total = 0;
    for (const q of exam.tfQuestions) {
      if (!q.answers || Object.keys(q.answers).length === 0) continue;
      for (const [item, correctAns] of Object.entries(q.answers)) {
        total++;
        if (tfAnswers[q.number]?.[item] === correctAns) correct++;
      }
    }
    return { correct, total };
  };

  const handleSubmitMc = () => {
    setMcSubmitted(true);
    onQuestionAnswered();
    const { correct } = calculateMcScore();
    if (correct > 0) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#ef4444', '#eab308', '#22c55e'] });
    }
  };

  const handleSubmitTf = () => {
    setTfSubmitted(true);
    onQuestionAnswered();
    const { correct } = calculateTfScore();
    if (correct > 0) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleShowResults = () => {
    setShowScore(true);
    const mc = calculateMcScore();
    const tf = calculateTfScore();
    const totalCorrect = mc.correct + tf.correct;
    if (totalCorrect > 0) {
      onCorrectAnswer();
    }
  };

  if (!isOpen) return null;

  const currentMc = exam?.mcQuestions?.[currentMcIndex];
  const totalMc = exam?.mcQuestions?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {zodiac?.emoji} {exam?.title || 'Đang tải...'} - {zodiac?.name}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
              <p className="text-gray-500">Đang tải đề thi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-6 text-red-500">
              <p className="text-lg font-bold mb-2">⚠️ Lỗi</p>
              <p>{error}</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Đóng</button>
            </div>
          ) : showScore ? (
            /* Score Screen */
            <div className="p-6 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Kết quả</h3>

              {(() => {
                const mc = calculateMcScore();
                const tf = calculateTfScore();
                const mcPoint = mc.total > 0 ? (mc.correct / mc.total * 6).toFixed(2) : '0';
                const tfPoint = tf.total > 0 ? (tf.correct / tf.total * 4).toFixed(2) : '0';
                const totalPoint = (parseFloat(mcPoint) + parseFloat(tfPoint)).toFixed(2);
                return (
                  <div className="space-y-4 max-w-sm mx-auto">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Phần I - Trắc nghiệm</p>
                      <p className="text-xl font-bold text-blue-600">{mc.correct}/{mc.total} câu đúng ({mcPoint} điểm)</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Phần II - Đúng/Sai</p>
                      <p className="text-xl font-bold text-green-600">{tf.correct}/{tf.total} ý đúng ({tfPoint} điểm)</p>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-xl text-white">
                      <p className="text-sm opacity-90">Tổng điểm</p>
                      <p className="text-3xl font-bold">{totalPoint}/10</p>
                    </div>
                  </div>
                );
              })()}

              <button onClick={onClose} className="mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                Đóng
              </button>
            </div>
          ) : exam ? (
            <div className="p-4">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('mc')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'mc' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  📝 Trắc nghiệm ({totalMc} câu)
                </button>
                <button
                  onClick={() => setActiveTab('tf')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'tf' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  ✅ Đúng/Sai ({exam.tfQuestions.length} câu)
                </button>
              </div>

              {activeTab === 'mc' ? (
                /* MC Questions */
                <div>
                  {currentMc ? (
                    <div className="space-y-4">
                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setCurrentMcIndex(Math.max(0, currentMcIndex - 1))}
                          disabled={currentMcIndex === 0}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-500">
                          Câu {currentMcIndex + 1}/{totalMc}
                        </span>
                        <button
                          onClick={() => setCurrentMcIndex(Math.min(totalMc - 1, currentMcIndex + 1))}
                          disabled={currentMcIndex === totalMc - 1}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Question */}
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="font-bold text-gray-800 mb-1">Câu {currentMc.number}:</p>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{currentMc.text}</p>
                      </div>

                      {/* Options */}
                      {Object.keys(currentMc.options).length > 0 ? (
                        <div className="grid gap-2">
                          {['A', 'B', 'C', 'D'].map(letter => {
                            const optText = currentMc.options[letter];
                            if (!optText) return null;
                            const isSelected = mcAnswers[currentMc.number] === letter;
                            const isCorrect = mcSubmitted && letter === currentMc.answer;
                            const isWrong = mcSubmitted && isSelected && letter !== currentMc.answer;

                            let cls = 'p-3 rounded-xl border-2 text-left text-sm transition-all flex items-center gap-2 ';
                            if (isCorrect) cls += 'border-green-500 bg-green-50 text-green-700 font-medium';
                            else if (isWrong) cls += 'border-red-500 bg-red-50 text-red-700';
                            else if (isSelected) cls += 'border-blue-500 bg-blue-50 text-blue-700';
                            else if (mcSubmitted) cls += 'border-gray-100 opacity-50';
                            else cls += 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer';

                            return (
                              <button key={letter} onClick={() => handleMcAnswer(currentMc.number, letter)}
                                disabled={mcSubmitted} className={cls}>
                                <span className="font-bold w-6 shrink-0">{letter}.</span>
                                <span>{optText}</span>
                                {isCorrect && <CheckCircle className="w-4 h-4 ml-auto text-green-600 shrink-0" />}
                                {isWrong && <XCircle className="w-4 h-4 ml-auto text-red-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">Chưa có phương án cho câu này</p>
                      )}

                      {/* Quick nav buttons */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {exam.mcQuestions.map((q, idx) => {
                          const answered = !!mcAnswers[q.number];
                          const isCorrectAns = mcSubmitted && mcAnswers[q.number] === q.answer;
                          const isWrongAns = mcSubmitted && answered && mcAnswers[q.number] !== q.answer;
                          let bgCls = 'w-8 h-8 rounded-lg text-xs font-medium transition-all ';
                          if (idx === currentMcIndex) bgCls += 'bg-blue-500 text-white ring-2 ring-blue-300';
                          else if (isCorrectAns) bgCls += 'bg-green-500 text-white';
                          else if (isWrongAns) bgCls += 'bg-red-500 text-white';
                          else if (answered) bgCls += 'bg-blue-100 text-blue-700';
                          else bgCls += 'bg-gray-100 text-gray-500 hover:bg-gray-200';
                          return (
                            <button key={q.number} onClick={() => setCurrentMcIndex(idx)} className={bgCls}>
                              {q.number}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">Không có câu hỏi trắc nghiệm</p>
                  )}

                  {/* Submit MC */}
                  {!mcSubmitted && totalMc > 0 && (
                    <button onClick={handleSubmitMc}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                      Nộp bài Phần I ({Object.keys(mcAnswers).length}/{totalMc} câu đã chọn)
                    </button>
                  )}
                  {mcSubmitted && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center">
                      <p className="font-bold text-blue-700">
                        ✅ Đã nộp! Đúng {calculateMcScore().correct}/{calculateMcScore().total} câu
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* TF Questions */
                <div className="space-y-4">
                  {exam.tfQuestions.length > 0 ? (
                    exam.tfQuestions.map(q => (
                      <div key={q.number} className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <p className="font-bold text-gray-800">Câu {q.number}:</p>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{q.text}</p>

                        {['a', 'b', 'c', 'd'].map(item => {
                          const itemText = q.items[item];
                          if (!itemText && !q.answers[item] && q.answers[item] === undefined) return null;
                          const userAns = tfAnswers[q.number]?.[item];
                          const correctAns = q.answers[item];
                          const submitted = tfSubmitted;
                          const isCorrect = submitted && userAns === correctAns;
                          const isWrong = submitted && userAns !== undefined && userAns !== correctAns;

                          return (
                            <div key={item} className={`p-3 rounded-lg border ${isCorrect ? 'border-green-400 bg-green-50' :
                                isWrong ? 'border-red-400 bg-red-50' :
                                  'border-gray-200 bg-white'
                              }`}>
                              <p className="text-sm text-gray-700 mb-2">
                                <span className="font-bold">{item})</span> {itemText || '(Nội dung trong đề thi)'}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleTfAnswer(q.number, item, true)}
                                  disabled={tfSubmitted}
                                  className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all ${userAns === true
                                      ? (submitted && correctAns === true ? 'bg-green-500 text-white' : submitted ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    }`}
                                >
                                  Đúng
                                </button>
                                <button
                                  onClick={() => handleTfAnswer(q.number, item, false)}
                                  disabled={tfSubmitted}
                                  className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all ${userAns === false
                                      ? (submitted && correctAns === false ? 'bg-green-500 text-white' : submitted ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    }`}
                                >
                                  Sai
                                </button>
                              </div>
                              {submitted && correctAns !== undefined && (
                                <p className={`text-xs mt-1 font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                  {isCorrect ? '✅ Chính xác!' : `❌ Đáp án: ${correctAns ? 'Đúng' : 'Sai'}`}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Không có câu hỏi Đúng/Sai</p>
                  )}

                  {!tfSubmitted && exam.tfQuestions.length > 0 && (
                    <button onClick={handleSubmitTf}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                      Nộp bài Phần II
                    </button>
                  )}
                  {tfSubmitted && (
                    <div className="p-3 bg-green-50 rounded-xl text-center">
                      <p className="font-bold text-green-700">
                        ✅ Đã nộp! Đúng {calculateTfScore().correct}/{calculateTfScore().total} ý
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Show Results button */}
              {(mcSubmitted || totalMc === 0) && (tfSubmitted || exam.tfQuestions.length === 0) && !showScore && (
                <button onClick={handleShowResults}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                  🏆 Xem kết quả tổng
                </button>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
