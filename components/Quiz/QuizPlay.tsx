import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Timer, ArrowRight, CheckCircle2, X, Sparkles, Zap } from 'lucide-react';
import { ConfettiEffect } from '../animations/ConfettiEffect';
import { FloatingShapes } from '../animations/FloatingShapes';
import { EmojiExplosion } from '../animations/EmojiExplosion';
import { SoundEffect } from '../animations/SoundEffect';
import { CharacterReaction } from '../animations/CharacterReaction';
import { StarBurst } from '../animations/StarBurst';
import '../../styles/animations.css';
import '../../styles/kid-theme.css';

interface QuizPlayProps {
  quizId: number;
  onComplete: (quizId: number) => void;
}

interface QuizQuestion extends Question {
  option_keys: string[];
}

export const QuizPlay: React.FC<QuizPlayProps> = ({ quizId, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  // Timer state
  const DURATION_PER_QUESTION = 30;
  const [timeLeft, setTimeLeft] = useState(DURATION_PER_QUESTION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());

  // Animation states for kid-friendly effects
  const [showConfetti, setShowConfetti] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showEmojiExplosion, setShowEmojiExplosion] = useState(false);
  const [showSoundEffect, setShowSoundEffect] = useState<'correct' | 'wrong' | 'perfect' | 'timeout' | 'click' | null>(null);
  const [showCharacter, setShowCharacter] = useState(false);
  const [characterMood, setCharacterMood] = useState<'happy' | 'thinking' | 'excited' | 'sad' | 'motivated'>('thinking');
  const [showStarBurst, setShowStarBurst] = useState(false);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        const startResponse = await api.quizzes.startQuiz(quizId);
        if (startResponse.success) {
          setAttemptId(startResponse.data.attempt_id);
          const questionsResponse = await api.quizzes.getQuestions(startResponse.data.attempt_id);
          if (questionsResponse.success) {
            setQuestions(questionsResponse.data as QuizQuestion[]);
            setQuizStartTime(Date.now());
          }
        }
      } catch (error) {
        console.error("Failed to load questions", error);
      } finally {
        setIsLoading(false);
      }
    };
    initQuiz();
  }, [quizId]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(DURATION_PER_QUESTION);
    setSelectedOption(null);
    setShowConfetti(false);
    setAnswerFeedback(null);
  }, [currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (isLoading || questions.length === 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNext(null, true); // Auto-advance on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, questions, currentQuestionIndex, isSubmitting]);

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null || isSubmitting) return; // Prevent changing answer

    setSelectedOption(optionIndex);

    // MEGA celebration for kids!
    setShowConfetti(true);
    setShowEmojiExplosion(true);
    setShowStarBurst(true);
    setShowSoundEffect('correct');
    setCharacterMood('excited');
    setShowCharacter(true);

    // Clear animations after they play
    setTimeout(() => {
      setShowConfetti(false);
      setShowEmojiExplosion(false);
      setShowStarBurst(false);
      setShowSoundEffect(null);
      setShowCharacter(false);
    }, 2500);

    // Auto submit after letting animations play
    setTimeout(() => {
      handleNext(optionIndex);
    }, 1500);
  };

  const handleNext = async (explicitOptionIndex: number | null = null, isTimeout: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const currentQuestion = questions[currentQuestionIndex];
    // Use explicitly passed option (from click) or current state (if any), otherwise null (timeout)
    const finalOptionIndex = explicitOptionIndex !== null ? explicitOptionIndex : selectedOption;

    const optionKey = finalOptionIndex !== null ? currentQuestion.option_keys[finalOptionIndex] : null;
    const timeSpent = DURATION_PER_QUESTION - timeLeft;

    // Send answer to API (only if an answer was selected or it's a timeout)
    if ((optionKey || isTimeout) && attemptId) {
      try {
        await api.quizzes.submitAnswer(attemptId, {
          question_id: currentQuestion.id,
          selected_answer: optionKey || 'TIMEOUT',
          time_spent: timeSpent
        });
      } catch (e) {
        console.error("Failed to submit answer", e);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Timer and selection reset by useEffect dependency on index
      setIsSubmitting(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    if (!attemptId) {
      console.error("No attempt ID available");
      onComplete(quizId);
      return;
    }
    try {
      const response = await api.quizzes.finish(attemptId);
      if (response.success && response.data) {
        onComplete(response.data.result_id);
      } else {
        console.error("Finish response missing data", response);
        onComplete(quizId);
      }
    } catch (error) {
      console.error("Failed to finish quiz", error);
      onComplete(quizId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800 animate-pulse">Loading your quiz...</h2>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">No questions found.</h2>
          <Button className="mt-4" onClick={() => onComplete(quizId)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-sky-50 flex flex-col relative overflow-hidden">
      {/* Floating background shapes */}
      <FloatingShapes count={12} />

      {/* MEGA Celebrations for kids! */}
      <ConfettiEffect active={showConfetti} duration={3000} particleCount={100} />
      <EmojiExplosion active={showEmojiExplosion} type="correct" duration={2000} />
      <StarBurst active={showStarBurst} duration={1500} />
      <SoundEffect type={showSoundEffect || 'correct'} show={showSoundEffect !== null} />
      <CharacterReaction mood={characterMood} show={showCharacter} />

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Question</span>
              <span className="text-lg font-bold text-slate-800 leading-none">
                <span className="text-violet-600 text-2xl">{currentQuestionIndex + 1}</span>
                <span className="text-slate-300 mx-1">/</span>
                {questions.length}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full font-mono font-bold text-slate-700 border border-slate-200 transition-all duration-300 ${timeLeft < 10 ? 'animate-shake bg-red-50 border-red-300 animate-pulse-glow' : ''
            }`}>
            <Timer className={`h-5 w-5 transition-all duration-300 ${timeLeft < 10 ? 'text-red-500 animate-bounce-scale' : 'text-slate-400'
              }`} />
            <span className={`transition-all duration-300 ${timeLeft < 10 ? 'text-red-600 text-xl' : ''
              }`}>{formatTime(timeLeft)}</span>
            {timeLeft < 10 && <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />}
          </div>

          <div className="flex-1 flex justify-end">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600" onClick={() => window.confirm("Are you sure you want to quit?") && onComplete(quizId)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-100 to-pink-100">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-sky-500 transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <Card className="border-0 shadow-2xl shadow-violet-500/10 overflow-visible">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-relaxed mb-8">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-6 rounded-2xl border-3 transition-all duration-300 group relative flex items-center transform hover-lift
                      ${selectedOption === idx
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-2xl scale-[1.05] animate-bounce-in'
                        : selectedOption !== null
                          ? 'border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-xl hover:scale-[1.02]'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center mr-4 transition-all duration-300 font-bold
                      ${selectedOption === idx
                        ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg animate-bounce-scale'
                        : 'border-slate-300 text-slate-500 bg-white group-hover:border-purple-400 group-hover:text-purple-600 group-hover:scale-110'
                      }`}>
                      {selectedOption === idx ? (
                        <CheckCircle2 className="h-6 w-6 animate-bounce-in" />
                      ) : (
                        <span className="text-lg">{String.fromCharCode(65 + idx)}</span>
                      )}
                    </div>
                    <span className={`text-lg font-semibold transition-all ${selectedOption === idx ? 'text-purple-900' : 'text-slate-700 group-hover:text-purple-800'
                      }`}>
                      {typeof option === 'string' ? option : option.text || option}
                    </span>
                    {selectedOption === idx && (
                      <Sparkles className="absolute right-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-yellow-500 animate-spin-slow" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-slate-200 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500 hidden sm:block font-medium">
            {questions.length - currentQuestionIndex - 1 === 0 ? (
              <span className="text-violet-600 font-bold">Last Question!</span>
            ) : (
              <>
                <span className="font-bold text-slate-900">{questions.length - currentQuestionIndex - 1}</span> questions remaining
              </>
            )}
          </div>
          <div className="flex gap-4 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              onClick={() => handleNext(null, true)}
              disabled={isSubmitting || selectedOption !== null}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Skip & Finish' : 'Skip Question'} <ArrowRight className="h-4 w-4 ml-2 opacity-50" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
