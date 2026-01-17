import React, { useEffect, useState } from 'react';
import { QuizHistoryEntry, PageRoute } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Home, Trophy, Star, Sparkles } from 'lucide-react';
import '../../styles/animations.css';
import '../../styles/kid-theme.css';

interface QuizHistoryProps {
    onNavigate: (page: PageRoute, data?: any) => void;
}

export const QuizHistory: React.FC<QuizHistoryProps> = ({ onNavigate }) => {
    const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.quizzes.getHistory();
                if (response.success) {
                    setHistory(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="animate-slide-in-left">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            🏆 Quiz History
                        </h1>
                        <p className="text-slate-600 mt-2 font-semibold">View your past adventures and achievements!</p>
                    </div>
                    <Button variant="outline" onClick={() => onNavigate('dashboard')}>
                        <Home className="h-4 w-4 mr-2" /> Dashboard
                    </Button>
                </div>

                <Card className="border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        {history.length === 0 ? (
                            <div className="text-center p-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No attempts yet</h3>
                                <p className="text-slate-500 mb-6">Start playing quizzes to see them here.</p>
                                <Button onClick={() => onNavigate('discovery')}>Browse Quizzes</Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Quiz Title</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Score</th>
                                            <th className="px-6 py-4">Accuracy</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((entry, idx) => (
                                            <tr key={entry.id} className="stagger-item hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover-lift cursor-pointer"
                                                style={{ animationDelay: `${idx * 0.1}s` }}>
                                                <td className="px-6 py-5 font-bold text-slate-900 flex items-center gap-2">
                                                    {entry.accuracy === 100 && <Trophy className="h-5 w-5 text-yellow-500 animate-bounce-gentle" />}
                                                    {entry.quiz_title}
                                                </td>
                                                <td className="px-6 py-5 text-slate-600 font-medium">{entry.completed_at}</td>
                                                <td className="px-6 py-5">
                                                    <span className="font-black text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                        {entry.score}
                                                    </span>
                                                    <span className="text-sm text-slate-500 ml-1">pts</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all hover:scale-110
                                                        ${entry.accuracy >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse-glow' :
                                                            entry.accuracy >= 70 ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white' :
                                                                entry.accuracy >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                                                                    'bg-gradient-to-r from-red-400 to-pink-500 text-white'}`}>
                                                        {entry.accuracy >= 90 ? '🌟' : entry.accuracy >= 70 ? '⭐' : entry.accuracy >= 50 ? '✨' : '💪'}
                                                        {entry.accuracy}%
                                                        {entry.accuracy === 100 && <Sparkles className="h-4 w-4 animate-spin-slow" />}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onNavigate('quiz-results', entry.id)}
                                                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                                    >
                                                        View Result <ArrowRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
