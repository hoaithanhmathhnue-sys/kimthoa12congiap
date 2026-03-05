import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Model list theo LỆNH.md - thứ tự fallback
const MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];

// Timeout cho API requests (30 giây)
const API_TIMEOUT = 30000;

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Phân loại lỗi API để xử lý đúng
   */
  static parseError(error: any): { type: 'QUOTA_EXCEEDED' | 'RATE_LIMIT' | 'INVALID_KEY' | 'NETWORK' | 'UNKNOWN'; message: string } {
    const msg = error?.message || error?.toString() || '';

    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return { type: 'QUOTA_EXCEEDED', message: 'API Key đã hết quota hôm nay. Hãy dùng key khác hoặc chờ đến ngày mai.' };
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return { type: 'RATE_LIMIT', message: 'Gửi yêu cầu quá nhanh. Vui lòng chờ vài giây rồi thử lại.' };
    }
    if (msg.includes('401') || msg.includes('403') || msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
      return { type: 'INVALID_KEY', message: 'API Key không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt.' };
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      return { type: 'NETWORK', message: 'Lỗi mạng. Vui lòng kiểm tra kết nối internet và thử lại.' };
    }

    return { type: 'UNKNOWN', message: `Lỗi không xác định: ${msg.substring(0, 100)}` };
  }

  /**
   * Tạo câu hỏi quiz với fallback model và timeout
   */
  async generateQuestion(subject: string, difficulty: string = 'medium', modelIndex: number = 0): Promise<Question | null> {
    if (!this.client) return null;

    const modelName = MODELS[modelIndex];
    const prompt = `Tạo một câu hỏi trắc nghiệm về chủ đề "${subject}" dành cho học sinh Việt Nam.
    Độ khó: ${difficulty}.
    Định dạng JSON:
    {
      "content": "Nội dung câu hỏi",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0, // Index của đáp án đúng (0-3)
      "explanation": "Giải thích ngắn gọn tại sao đúng"
    }
    Chỉ trả về JSON, không có markdown block.`;

    try {
      // Tạo request với timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await this.client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["content", "options", "correctAnswer", "explanation"]
          }
        }
      });

      clearTimeout(timeoutId);

      const text = response.text;
      if (!text) throw new Error("Empty response");

      const data = JSON.parse(text);
      return {
        id: Date.now().toString(),
        content: data.content,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        difficulty: difficulty as 'easy' | 'medium' | 'hard'
      };

    } catch (error: any) {
      console.error(`Error with model ${modelName}:`, error);

      const parsed = GeminiService.parseError(error);

      // Nếu lỗi quota hoặc rate limit hoặc unknown, thử fallback model
      if (parsed.type !== 'INVALID_KEY' && modelIndex < MODELS.length - 1) {
        console.log(`🔄 Fallback sang model ${MODELS[modelIndex + 1]}`);
        return this.generateQuestion(subject, difficulty, modelIndex + 1);
      }

      // Throw error với message rõ ràng
      throw new Error(parsed.message);
    }
  }
}
