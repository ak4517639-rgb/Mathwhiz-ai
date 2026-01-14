
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const solveMathFromImage = async (base64Image: string): Promise<{ solution: string; steps: string[]; explanation: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Identify the math problem in this image. Provide the final solution, a step-by-step breakdown, and a brief conceptual explanation. Format the response in JSON." }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          solution: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          explanation: { type: Type.STRING }
        },
        required: ['solution', 'steps', 'explanation']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 multiple-choice quiz questions for the math topic: ${topic}. Each question should have 4 options, one correct answer, and a short explanation.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ['question', 'options', 'correctAnswer', 'explanation']
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const chatWithTutor = async (history: any[], message: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are MathWhiz, a friendly and expert math tutor. Your goal is to help students understand concepts, not just give answers. Use clear steps and encourage critical thinking. If asked a non-math question, gently guide the conversation back to mathematics."
    }
  });

  // Reconstruct history for the SDK format if needed, though for simplicity we just send the message
  const response = await chat.sendMessage({ message });
  return response.text;
};
