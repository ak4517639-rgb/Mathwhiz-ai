
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { AppTab, MathTopic, QuizQuestion, ChatMessage } from './types';
import { MATH_TOPICS } from './constants';
import * as gemini from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LEARN);
  const [loading, setLoading] = useState(false);
  
  // Learning State
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | null>(null);

  // Solving State
  const [solvedData, setSolvedData] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Tutor State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const handleSolveImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setSolvedData(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      try {
        const result = await gemini.solveMathFromImage(base64);
        setSolvedData(result);
      } catch (err) {
        console.error(err);
        alert("Failed to solve the image. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const startQuiz = async (topicId: string) => {
    setLoading(true);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    try {
      const questions = await gemini.generateQuiz(topicId);
      setQuizQuestions(questions);
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (answer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    try {
      const responseText = await gemini.chatWithTutor(chatMessages, chatInput);
      const modelMsg: ChatMessage = { role: 'model', parts: [{ text: responseText || "I'm not sure how to respond to that." }] };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-4 max-w-2xl mx-auto">
        
        {/* LEARN TAB */}
        {activeTab === AppTab.LEARN && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Welcome to MathWhiz!</h2>
              <p className="opacity-90">Select a topic to start your learning journey today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MATH_TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => { setSelectedTopic(topic); setActiveTab(AppTab.QUIZ); startQuiz(topic.title); }}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all text-left group"
                >
                  <div className={`w-12 h-12 rounded-lg ${topic.color} flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform`}>
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{topic.title}</h3>
                    <p className="text-sm text-slate-500">{topic.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOLVE TAB */}
        {activeTab === AppTab.SOLVE && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-xl font-bold mb-2">Solve with Camera</h2>
              <p className="text-slate-500 mb-6">Take a photo of a math problem to get instant solutions.</p>
              
              <div className="relative inline-block w-full">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSolveImage}
                  className="hidden"
                  id="cameraInput"
                />
                <label
                  htmlFor="cameraInput"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-md active:scale-95"
                >
                  <span>📷</span> Capture or Upload
                </label>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 animate-pulse">Analyzing your math problem...</p>
              </div>
            )}

            {solvedData && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {imagePreview && (
                  <img src={imagePreview} alt="Problem Preview" className="w-full rounded-xl border border-slate-200 h-48 object-cover shadow-sm" />
                )}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-blue-600 mb-2">Final Solution</h3>
                  <div className="bg-blue-50 p-4 rounded-lg text-xl font-mono text-center border border-blue-100 mb-6">
                    {solvedData.solution}
                  </div>

                  <h3 className="font-bold text-slate-800 mb-3">Step-by-step Breakdown</h3>
                  <div className="space-y-3">
                    {solvedData.steps.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                          {i + 1}
                        </span>
                        <p className="text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>

                  <hr className="my-6 border-slate-100" />
                  
                  <h3 className="font-bold text-slate-800 mb-2">The Concept</h3>
                  <p className="text-slate-600 italic">"{solvedData.explanation}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === AppTab.QUIZ && (
          <div className="space-y-6">
            {!quizQuestions.length && !loading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-400 mb-4">Choose a topic from the Learn tab to start a quiz!</p>
                <button onClick={() => setActiveTab(AppTab.LEARN)} className="text-blue-600 font-bold hover:underline">
                  Go to Topics
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500">Preparing your interactive quiz...</p>
              </div>
            )}

            {quizQuestions.length > 0 && !quizFinished && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-slate-400">Question {currentQuestionIndex + 1}/{quizQuestions.length}</span>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-300" 
                      style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">{quizQuestions[currentQuestionIndex].question}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {quizQuestions[currentQuestionIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className="w-full p-4 text-left border border-slate-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-slate-700 active:scale-95"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {quizFinished && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center animate-in zoom-in duration-300">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-slate-500 mb-6">You scored <span className="text-indigo-600 font-bold">{quizScore}</span> out of {quizQuestions.length}</p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => startQuiz(selectedTopic?.title || 'math')}
                    className="py-3 px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => setActiveTab(AppTab.LEARN)}
                    className="py-3 px-6 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Back to Topics
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TUTOR TAB */}
        {activeTab === AppTab.TUTOR && (
          <div className="flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pb-4">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">🤖</div>
                  <h3 className="font-bold text-slate-600">I'm MathWhiz, your tutor!</h3>
                  <p className="text-sm">Ask me any math question, or ask for an explanation of a concept you're stuck on.</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="glass p-2 rounded-2xl border border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask about algebra, calculus..."
                className="flex-1 bg-transparent px-4 py-3 outline-none"
              />
              <button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || loading}
                className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-90"
              >
                ➔
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default App;
