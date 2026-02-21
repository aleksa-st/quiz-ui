import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface LiveQuizGameProps {
    sessionCode: string;
    onExit: () => void;
}

export const LiveQuizGame: React.FC<LiveQuizGameProps> = ({ sessionCode, onExit }) => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);

    useEffect(() => {
        const interval = setInterval(fetchStatus, 1000); // Fast polling for real-time feel
        return () => clearInterval(interval);
    }, [sessionCode]);

    // Reset selection when question changes
    const prevQuestionId = React.useRef<number | null>(null);
    useEffect(() => {
        const currentQId = status?.current_question?.id;
        if (currentQId && currentQId !== prevQuestionId.current) {
            setSelectedAnswer(null);
            prevQuestionId.current = currentQId;
        }
    }, [status?.current_question?.id]);

    const fetchStatus = async () => {
        try {
            const res = await api.liveQuiz.getSessionStatus(sessionCode);
            if (res.success) {
                setStatus(res.data);
                setIsHost(res.data.is_host);
                if (res.data.status === 'completed') {
                    setGameEnded(true);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (answerId: number) => {
        if (selectedAnswer) return; // Prevent multiple answers
        setSelectedAnswer(answerId);
        try {
            await api.liveQuiz.submitAnswer({
                session_code: sessionCode,
                question_id: status.current_question.id,
                answer: String(answerId),
                time_taken: 0 // TODO: Implement timer
            });
        } catch (error) {
            console.error("Failed to submit answer", error);
        }
    };

    const handleNext = async () => {
        try {
            await api.liveQuiz.nextQuestion(sessionCode);
            setSelectedAnswer(null); // Reset for next question
        } catch (error) {
            console.error("Failed to next", error);
        }
    };

    if (loading) return <div className="min-h-screen bg-violet-900 flex items-center justify-center"><Loader2 className="h-10 w-10 text-white animate-spin" /></div>;

    if (gameEnded) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
                <h1 className="text-4xl font-bold mb-4">Quiz Finished!</h1>
                <div className="bg-white/10 rounded-3xl p-8 max-w-lg w-full">
                    <h2 className="text-2xl mb-6 border-b border-white/10 pb-2">Leaderboard</h2>
                    <div className="space-y-4">
                        {status?.participants?.sort((a: any, b: any) => b.score - a.score).map((p: any, idx: number) => (
                            <div key={p.id} className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                                <span className="font-bold text-lg"><span className="text-violet-400 mr-4">#{idx + 1}</span> {p.name}</span>
                                <span className="font-mono text-yellow-400">{p.score} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
                <Button onClick={onExit} className="mt-8 bg-violet-600">Back to Dashboard</Button>
            </div>
        );
    }

    if (!status?.current_question) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-900 to-slate-900 flex flex-col items-center justify-center text-white p-8 font-sans">
                <h2 className="text-3xl font-bold mb-4">Get Ready!</h2>
                <p className="opacity-70">Question loading...</p>
                {isHost && (
                    <Button onClick={handleNext} className="mt-8 bg-white/20 hover:bg-white/30">Force Start / Next</Button>
                )}
            </div>
        );
    }

    const q = status.current_question;

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-black/20">
                <div className="text-sm font-bold opacity-50">Room: {sessionCode}</div>
                <div className="bg-violet-600 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider">
                    Live
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-5xl mx-auto w-full">
                <div className="w-full text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black leading-tight mb-8">
                        {q.text}
                    </h2>
                    {q.image && (
                        <img src={q.image} alt="Question" className="max-h-64 mx-auto rounded-2xl shadow-2xl mb-8" />
                    )}
                </div>

                {/* Options Grid */}
                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {(Array.isArray(q.options)
                        ? q.options
                        : Object.entries(q.options || {}).map(([key, value]) => ({ id: key, text: value as string }))
                    ).map((opt: any) => (
                        <button
                            key={opt.id}
                            disabled={selectedAnswer !== null}
                            onClick={() => handleAnswer(opt.id)}
                            className={`p-6 rounded-2xl text-left transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl font-bold text-xl flex items-center justify-between
                                ${selectedAnswer === opt.id
                                    ? 'bg-violet-500 ring-4 ring-violet-300'
                                    : 'bg-white/10 hover:bg-white/20'
                                }
                            `}
                        >
                            {opt.text}
                            {selectedAnswer === opt.id && <CheckCircle className="h-6 w-6" />}
                        </button>
                    ))}
                </div>

                {/* Host Controls */}
                {isHost && (
                    <div className="mt-12">
                        <Button variant="ghost" onClick={handleNext} className="bg-white text-slate-900 hover:bg-violet-50 px-8 py-4 text-lg rounded-full shadow-lg font-black">
                            Next Question <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

