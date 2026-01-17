import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Swords, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageRoute } from '../../types';

interface Challenge {
    id: number;
    challenger_name: string;
    quiz_title: string;
    challenger_score: number;
    message?: string;
    quiz_id: number;
}

interface ChallengeListProps {
    onNavigate: (page: PageRoute, data?: any) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({ onNavigate }) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (isMounted) {
                await loadChallenges();
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    const loadChallenges = async () => {
        try {
            const res = await api.challenges.getReceived();
            if (res.success && Array.isArray(res.data)) {
                setChallenges(res.data);
            }
        } catch (error) {
            console.error("Failed to load challenges", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (id: number, accept: boolean, quizId: number) => {
        try {
            // Using the updated api.respond which calls /challenges/{id}/accept or /decline
            await api.challenges.respond(id, accept ? 'accept' : 'decline');

            if (accept) {
                // Determine if we should navigate directly to play or details
                // The user wants to "start the quiz again to beat the score"
                // Navigating to quiz-play starts the quiz.
                onNavigate('quiz-play', quizId);
            } else {
                setChallenges(prev => prev.filter(c => c.id !== id));
            }
        } catch (error: any) {
            console.error("Failed to respond", error);
            // If the quiz is gone (410) or not found (404), remove the challenge from the list
            if (error.status === 410 || error.status === 404 || (error.message && error.message.includes('quiz'))) {
                alert("This challenge is no longer valid as the quiz has been removed.");
                setChallenges(prev => prev.filter(c => c.id !== id));
            }
        }
    };

    if (challenges.length === 0) return null;

    return (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-900 rounded-xl text-yellow-400 shadow-lg shadow-slate-900/20">
                        <Swords className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Challenges</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Defend Your Title</p>
                    </div>
                </div>
                <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-red-500/30 shadow-md animate-pulse">
                    {challenges.length} BATTLES
                </span>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-6 px-1.5 -mx-1 snap-x custom-scrollbar">
                {challenges.map(c => (
                    <div key={c.id} className="min-w-[300px] sm:min-w-[340px] relative group cursor-default snap-center">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>

                        <div className="relative bg-slate-900 rounded-[1.3rem] p-6 text-white overflow-hidden shadow-2xl">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            {/* Top Row: Opponent Info */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 p-0.5 shadow-lg shadow-orange-500/20">
                                        <div className="w-full h-full bg-slate-800 rounded-[0.6rem] flex items-center justify-center font-black text-xl text-yellow-500">
                                            {c.challenger_name[0]}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Challenger</div>
                                        <h3 className="font-bold text-lg leading-none">{c.challenger_name}</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Target</div>
                                    <div className="font-black text-2xl text-yellow-400 leading-none tracking-tight">{c.challenger_score}</div>
                                </div>
                            </div>

                            {/* Quiz Info */}
                            <div className="mb-6 relative">
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-500 to-red-500 rounded-r-full"></div>
                                <div className="text-sm text-slate-300 font-medium truncate pl-2">{c.quiz_title}</div>
                                {c.message && (
                                    <div className="mt-2 text-xs text-slate-400 italic bg-white/5 p-2 rounded-lg border border-white/5">
                                        "{c.message}"
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleRespond(c.id, false, c.quiz_id)}
                                    className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleRespond(c.id, true, c.quiz_id)}
                                    className="flex-1 bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-400 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/50 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    ACCEPT DUEL
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
