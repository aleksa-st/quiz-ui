import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageRoute } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Sparkles, Brain, CheckCircle, ArrowRight, Loader2, RotateCcw, Home } from 'lucide-react';

interface AIQuizCreationProps {
    onNavigate: (page: PageRoute) => void;
}

export const AIQuizCreation: React.FC<AIQuizCreationProps> = ({ onNavigate }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dailyLimit, setDailyLimit] = useState<{ remaining: number; next_reset?: string } | null>(null);
    const [formData, setFormData] = useState({
        topic: '',
        difficulty: 'Medium',
        question_count: 10,
        questionType: 'multiple_choice',
    });
    const [generatedQuizId, setGeneratedQuizId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkDailyLimit();
    }, []);

    const checkDailyLimit = async () => {
        try {
            const response = await api.ai.checkLimit();
            if (response.success && response.data) {
                setDailyLimit(response.data);
            }
        } catch (err) {
            console.error("Failed to check limit", err);
        }
    };

    const handleGenerate = async () => {
        if (!formData.topic.trim()) return;

        setLoading(true);
        setError(null);
        setCurrentStep(1); // Move to loading step

        try {
            const response = await api.ai.generateQuiz({
                topic: formData.topic,
                difficulty: formData.difficulty,
                question_count: formData.question_count
            });

            if (response.success && response.data) {
                setGeneratedQuizId(response.data.quiz_id);
                setCurrentStep(2); // Move to success step
                // Refresh limit
                checkDailyLimit();
            } else {
                throw new Error(response.message || 'Generation failed');
            }
        } catch (err: any) {
            setError(err.message || "Failed to generate quiz. Please try again.");
            setCurrentStep(0); // Go back
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-4 rounded-2xl shadow-lg shadow-violet-500/30">
                            <Sparkles className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">AI Quiz Creator</h1>
                    <p className="text-lg text-slate-600">Instantly generate quizzes on any topic using AI.</p>
                </div>

                <Card className="border-0 shadow-xl overflow-hidden">
                    <CardContent className="p-8">
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">What should the quiz be about?</label>
                                        <Input
                                            placeholder="e.g. Quantum Physics, History of Rome, 90s Pop Music..."
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                                value={formData.difficulty}
                                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Questions</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                                value={formData.question_count}
                                                onChange={(e) => setFormData({ ...formData, question_count: Number(e.target.value) })}
                                            >
                                                <option value={5}>5 Questions</option>
                                                <option value={10}>10 Questions</option>
                                                <option value={15}>15 Questions</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                {dailyLimit && (
                                    <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-violet-100 p-2 rounded-lg">
                                                <Brain className="h-5 w-5 text-violet-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-violet-900 text-sm">Daily Generations</div>
                                                <div className="text-violet-600 text-xs">Reset at midnight</div>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-black text-violet-600">{dailyLimit.remaining}</div>
                                    </div>
                                )}

                                <Button
                                    className="w-full py-6 text-lg shadow-lg shadow-violet-500/20"
                                    onClick={handleGenerate}
                                    disabled={!formData.topic.trim() || (dailyLimit?.remaining === 0)}
                                >
                                    {dailyLimit?.remaining === 0 ? 'Daily Limit Reached' : 'Generate Quiz'}
                                    {!dailyLimit || dailyLimit.remaining > 0 ? <ArrowRight className="ml-2 h-5 w-5" /> : null}
                                </Button>

                                <div className="text-center">
                                    <button onClick={() => onNavigate('dashboard')} className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors">Cancel</button>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="text-center py-12">
                                <div className="relative inline-block mb-8">
                                    <div className="absolute inset-0 bg-violet-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                    <Loader2 className="h-20 w-20 text-violet-600 animate-spin relative z-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mb-3">Crafting your Quiz...</h2>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    Our AI is researching <strong>{formData.topic}</strong> and generating {formData.difficulty} questions just for you.
                                </p>
                            </div>
                        )}

                        {currentStep === 2 && generatedQuizId && (
                            <div className="text-center space-y-8">
                                <div className="flex justify-center">
                                    <div className="bg-green-100 p-4 rounded-full">
                                        <CheckCircle className="h-12 w-12 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-2">Quiz Ready!</h2>
                                    <p className="text-slate-500">Your quiz on <strong>{formData.topic}</strong> has been generated successfully.</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        size="lg"
                                        onClick={() => onNavigate('quiz-details', generatedQuizId)}
                                        className="w-full py-4 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20"
                                    >
                                        View & Play Quiz
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={() => { setGeneratedQuizId(null); setCurrentStep(0); }}>
                                            <RotateCcw className="mr-2 h-4 w-4" /> Create Another
                                        </Button>
                                        <Button variant="outline" className="flex-1" onClick={() => onNavigate('dashboard')}>
                                            <Home className="mr-2 h-4 w-4" /> Dashboard
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
