import React, { useEffect, useState } from 'react';
import { QuizResult, PageRoute, QuestionBreakdown } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Trophy, Clock, Target, BarChart2, RotateCcw, Home, Eye } from 'lucide-react';

interface QuizResultsProps {
  resultId: number;
  onNavigate: (page: PageRoute) => void;
}

import { ChallengeModal } from '../Social/ChallengeModal';
import { Swords } from 'lucide-react';

export const QuizResults: React.FC<QuizResultsProps> = ({ resultId, onNavigate }) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    // ... existing fetch logic
    const fetchResult = async () => {
      try {
        const response = await api.quizzes.getResult(resultId);
        if (response.success) {
          setResult(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  if (isLoading) {
    // ... existing loading
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  if (!result) return <div className="text-center p-8">Results not found or quiz not completed.</div>;

  // Use leaderboard data for current user as it has correct values
  const currentUserData = result.leaderboard?.find(entry => entry.is_current_user);
  const actualAccuracy = currentUserData?.accuracy || result.accuracy;
  const actualScore = currentUserData?.score || result.total_score;
  const actualCorrect = Math.round((actualAccuracy / 100) * result.total_questions);
  const actualIncorrect = result.total_questions - actualCorrect;
  
  let message = "Good Attempt!";
  let subMessage = "Keep practicing to improve your score.";

  if (actualAccuracy >= 90) {
    message = "Outstanding!";
    subMessage = "You're a true master of this topic.";
  } else if (actualAccuracy >= 70) {
    message = "Great Job!";
    subMessage = "You have a solid understanding.";
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Score Card */}
        <div className="relative bg-white rounded-3xl shadow-xl shadow-violet-500/10 overflow-hidden text-center p-12 border border-slate-100">
          {/* ... existing scorecard UI ... */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500"></div>

          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/20 animate-bounce">
            <Trophy className="h-12 w-12 text-yellow-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 font-poppins">{message}</h1>
          <p className="text-slate-500 text-lg mb-8">{subMessage}</p>

          <div className="flex justify-center items-end gap-2 mb-8">
            <span className="text-6xl font-black text-violet-600 tracking-tighter">{actualScore}</span>
            <span className="text-xl font-bold text-slate-400 mb-2">pts</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
                <Target className="h-3 w-3" /> Accuracy
              </div>
              <div className="text-xl font-bold text-slate-800">{actualAccuracy}%</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
                <Clock className="h-3 w-3" /> Time
              </div>
              <div className="text-xl font-bold text-slate-800">{Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s</div>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
              <div className="text-green-600 text-xs font-bold uppercase mb-1">Correct</div>
              <div className="text-xl font-bold text-green-700">{actualCorrect}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <div className="text-red-600 text-xs font-bold uppercase mb-1">Wrong</div>
              <div className="text-xl font-bold text-red-700">{actualIncorrect}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Button onClick={() => onNavigate('dashboard')} variant="outline" size="lg" className="w-full">
            <Home className="h-4 w-4 mr-2" /> Home
          </Button>
          <Button onClick={() => onNavigate('discovery')} variant="primary" size="lg" className="w-full shadow-lg shadow-violet-500/20">
            <RotateCcw className="h-4 w-4 mr-2" /> Play Another
          </Button>
          <Button onClick={() => setShowReview(!showReview)} variant="outline" size="lg" className="w-full sm:col-span-2">
            <Eye className="h-4 w-4 mr-2" /> {showReview ? 'Hide Review' : 'Review Answers'}
          </Button>
          <Button
            onClick={() => setShowChallengeModal(true)}
            className="w-full sm:col-span-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 shadow-xl shadow-orange-500/20 border-0"
          >
            <Swords className="h-5 w-5 mr-2" /> Challenge Friends
          </Button>
        </div>

        {/* Review Section */}
        {showReview && result.question_breakdown && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Answer Review</h3>
              <div className="space-y-4">
                {result.question_breakdown.map((item: QuestionBreakdown, idx: number) => (
                  <div key={idx} className={`p-4 rounded-xl border ${
                    item.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 mb-2">{item.question}</p>
                        <div className="space-y-1 text-sm">
                          <div className={`flex items-center gap-2 ${
                            item.correct ? 'text-green-700' : 'text-red-700'
                          }`}>
                            <span className="font-medium">Your answer:</span>
                            <span>{item.user_answer}</span>
                          </div>
                          {!item.correct && (
                            <div className="flex items-center gap-2 text-green-700">
                              <span className="font-medium">Correct answer:</span>
                              <span>{item.correct_answer}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-slate-500 text-xs mt-2">
                            <span>Time: {item.time_spent}s</span>
                            <span>Points: {item.points_earned}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mini Leaderboard */}
        {result.leaderboard && result.leaderboard.length > 0 && (
          <Card className="border-0 shadow-lg">
            {/* ... existing leaderboard UI ... */}
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-violet-500" /> Leaderboard
                </h3>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('leaderboard')}>View Full</Button>
              </div>

              <div className="space-y-3">
                {result.leaderboard.map((entry, idx) => (
                  <div key={idx} className={`flex items-center p-4 rounded-xl border ${entry.is_current_user ? 'bg-violet-50 border-violet-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-4
                      ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        entry.rank === 2 ? 'bg-slate-200 text-slate-700' :
                          entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-500'}`}>
                      {entry.rank}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                        {entry.avatar_url ? <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-300 flex items-center justify-center text-xs">{entry.name.charAt(0)}</div>}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{entry.name} {entry.is_current_user && '(You)'}</div>
                        <div className="text-xs text-slate-500">{entry.accuracy}% Accuracy</div>
                      </div>
                    </div>
                    <div className="font-bold text-violet-600">{entry.score} pts</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showChallengeModal && result && (
          <ChallengeModal
            onClose={() => setShowChallengeModal(false)}
            quizResultId={resultId}
            quizTitle={result.quiz_title || "Quiz"} // Ensure quiz_title comes from API or defaults
            score={result.total_score}
          />
        )}
      </div>
    </div>
  );
};