
export interface MathProblem {
  id: string;
  expression: string;
  solution: string;
  steps: string[];
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export enum AppTab {
  LEARN = 'learn',
  SOLVE = 'solve',
  QUIZ = 'quiz',
  TUTOR = 'tutor'
}

export interface MathTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}
