import React, { useState, useEffect } from 'react';
import { Quiz, PageRoute } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Clock, HelpCircle, Trophy, AlertCircle, Play, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface QuizDetailsProps {
  quizId: number;
  onNavigate: (page: PageRoute, data?: any) => void;
  onBack: () => void;
}

export const QuizDetails: React.FC<QuizDetailsProps> = ({ quizId, onNavigate, onBack }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await api.quizzes.getDetail(quizId);
        if (response.success) {
          setQuiz(response.data);
        }
      } catch (error) {
        console.error("Failed to load quiz details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizDetails();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Quiz not found</h2>
        <Button variant="secondary" onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent">
        <ChevronLeft className="h-5 w-5 mr-1" /> Back to Explore
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Quiz Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg mb-6 group">
            {quiz.image && (quiz.image.startsWith('http') || quiz.image.startsWith('/')) ? (
              <img src={quiz.image} alt={quiz.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-8xl">
                {quiz.image || '📝'}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-md">{quiz.title}</h1>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider">
                {quiz.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {quiz.difficulty}
              </span>
            </div>


            <p className="text-lg text-slate-600 leading-relaxed mb-8">{quiz.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mb-1 text-sm font-medium">
                  <HelpCircle className="h-4 w-4" /> Questions
                </div>
                <div className="text-xl font-bold text-slate-900">{quiz.total_questions}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mb-1 text-sm font-medium">
                  <Clock className="h-4 w-4" /> Time
                </div>
                <div className="text-xl font-bold text-slate-900">{quiz.time_limit || 15}m</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mb-1 text-sm font-medium">
                  <Trophy className="h-4 w-4" /> Points
                </div>
                <div className="text-xl font-bold text-slate-900">{quiz.total_questions * 10}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mb-1 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" /> Pass %
                </div>
                <div className="text-xl font-bold text-slate-900">70%</div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Before you start</h3>
              <ul className="space-y-3">
                {[
                  "You cannot pause the quiz once started.",
                  "You will get 10 points for each correct answer.",
                  "There is no negative marking for wrong answers.",
                  "Make sure you have a stable internet connection."
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: CTA */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 border-0 shadow-2xl shadow-violet-500/20 bg-gradient-to-b from-violet-600 to-indigo-700 text-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                <Play className="h-10 w-10 text-white fill-current ml-1" />
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Ready to play?</h3>
                <p className="text-violet-100 text-sm opacity-90">
                  Challenge yourself and earn points to climb the leaderboard!
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  size="xl"
                  className="w-full bg-white text-violet-700 hover:bg-slate-50 border-none font-bold shadow-lg"
                  onClick={() => onNavigate('quiz-play', quizId)}
                >
                  Start Quiz Now
                </Button>
                <Button
                  className="w-full bg-violet-800 text-white hover:bg-violet-900 border-white/20"
                  onClick={async () => {
                    try {
                      const res = await api.liveQuiz.createSession(quizId);
                      if (res.success) {
                        onNavigate('live-quiz-lobby', res.data.session_code);
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  Host Live Session
                </Button>
                <p className="text-xs text-violet-200">1,245 people took this today</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};