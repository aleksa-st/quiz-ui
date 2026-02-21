import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Play, Copy, Check, LogOut, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface Participant {
    id: number;
    name: string;
    avatar_url?: string;
    avatar_initials?: string;
    is_connected: boolean;
    score: number;
}

interface LiveQuizLobbyProps {
    sessionCode: string;
    onStartQuiz: () => void;
    onLeaveSession: () => void;
}

export const LiveQuizLobby: React.FC<LiveQuizLobbyProps> = ({ sessionCode, onStartQuiz, onLeaveSession }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSessionStatus();
        const interval = setInterval(loadSessionStatus, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, [sessionCode]);

    const loadSessionStatus = async () => {
        try {
            const res = await api.liveQuiz.getSession(sessionCode);
            if (res.success) {
                setParticipants(res.data.participants || []);
                setIsHost(res.data.is_host || false);

                // If status changes to active/started, auto-trigger start
                if (res.data.status === 'active' || res.data.status === 'in_progress') {
                    onStartQuiz();
                }
            }
        } catch (error) {
            console.error('Failed to load session status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = async () => {
        try {
            await api.liveQuiz.start(sessionCode);
            onStartQuiz();
        } catch (error) {
            console.error('Failed to start quiz:', error);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(sessionCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-2xl w-full text-center shadow-2xl">
                <h1 className="text-4xl font-black text-white mb-2">Quiz Lobby</h1>
                <p className="text-violet-100 mb-8">Waiting for players to join...</p>

                {/* Code Display */}
                <div className="bg-white/20 rounded-2xl p-6 mb-8 inline-block backdrop-blur-sm">
                    <div className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Session Code</div>
                    <div className="flex items-center gap-4">
                        <span className="text-5xl font-mono font-bold text-white tracking-widest">{sessionCode}</span>
                        <button onClick={copyCode} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                            {copied ? <Check className="h-6 w-6 text-green-400" /> : <Copy className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Participants */}
                <div className="bg-black/20 rounded-2xl p-6 mb-8 text-left h-64 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-4 text-white/80 border-b border-white/10 pb-2">
                        <Users className="h-5 w-5" />
                        <span className="font-bold">{participants.length} Participants Joined</span>
                    </div>

                    {loading && participants.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {participants.map(p => (
                                <div key={p.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                    {/* Status Indicator */}
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${p.is_connected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`}></div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                                        {p.avatar_url ? (
                                            <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-lavender-400 to-skysky-400 flex items-center justify-center text-white font-bold text-sm">
                                                {p.avatar_initials || p.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <span className="text-white font-medium truncate">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {participants.length === 0 && !loading && (
                        <p className="text-white/40 text-center py-10">Share the code to invite players!</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Button
                        variant="ghost"
                        onClick={onLeaveSession}
                        className="bg-white/10 hover:bg-white/20 text-white border-0"
                    >
                        <LogOut className="h-5 w-5 mr-2" /> Leave
                    </Button>

                    {isHost && (
                        <Button
                            onClick={handleStartQuiz}
                            disabled={participants.length === 0}
                            className="bg-green-500 hover:bg-green-600 text-white border-0 px-8 py-6 text-lg shadow-xl shadow-green-500/30"
                        >
                            <Play className="h-6 w-6 mr-2 fill-current" /> Start Game
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

