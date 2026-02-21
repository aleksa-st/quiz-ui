import React, { useState } from 'react';
import { Play, Users, ArrowLeft, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { PageRoute } from '../../types';
import { LiveQuizCreate } from './LiveQuizCreate';
import { LiveQuizLobby } from './LiveQuizLobby';
import { LiveQuizGame } from './LiveQuizGame';

interface LiveQuizProps {
    onNavigate: (page: PageRoute, data?: any) => void;
    teamId?: number;
}

type LiveQuizState = 'menu' | 'create' | 'join' | 'lobby' | 'game' | 'results';

export const LiveQuiz: React.FC<LiveQuizProps> = ({ onNavigate, teamId }) => {
    const [currentState, setCurrentState] = useState<LiveQuizState>('menu');
    const [sessionCode, setSessionCode] = useState<string>('');
    const [isHost, setIsHost] = useState<boolean>(false);

    // Join screen state (Must be at top level)
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    const handleCreateSession = (code: string) => {
        setSessionCode(code);
        setIsHost(true);
        setCurrentState('lobby');
    };

    const handleJoinSession = (code: string) => {
        setSessionCode(code);
        setIsHost(false);
        setCurrentState('lobby');
    };

    const handleStartQuiz = () => {
        setCurrentState('game');
    };

    const handleGameEnd = () => {
        setCurrentState('results');
    };

    const handleLeaveSession = () => {
        setCurrentState('menu');
        setSessionCode('');
        setIsHost(false);
        setJoinCode('');
        setJoinError('');
    };

    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.length !== 6) {
            setJoinError('Code must be 6 characters');
            return;
        }

        setJoining(true);
        setJoinError('');

        try {
            const res = await api.liveQuiz.join(joinCode.toUpperCase());
            if (res.success) {
                handleJoinSession(joinCode.toUpperCase());
            } else {
                setJoinError('Failed to join session. Please check the code.');
            }
        } catch (err: any) {
            console.error('Join error:', err);
            if (err.response?.status === 401) {
                setJoinError('You must be logged in to join.');
            } else {
                setJoinError(err.response?.data?.error || 'Invalid session code or session full.');
            }
        } finally {
            setJoining(false);
        }
    };

    // Render lobby
    if (currentState === 'lobby' && sessionCode) {
        return (
            <LiveQuizLobby
                sessionCode={sessionCode}
                isHost={isHost}
                onStartQuiz={handleStartQuiz}
                onLeaveSession={handleLeaveSession}
            />
        );
    }

    // Render game
    if (currentState === 'game' && sessionCode) {
        return (
            <LiveQuizGame
                sessionCode={sessionCode}
                isHost={isHost}
                onSessionEnd={handleGameEnd}
            />
        );
    }

    // Create session screen (3-step wizard)
    if (currentState === 'create') {
        return (
            <LiveQuizCreate
                teamId={teamId}
                onSessionCreated={handleCreateSession}
                onBack={() => setCurrentState('menu')}
            />
        );
    }

    // Join session screen (code input)
    if (currentState === 'join') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setCurrentState('menu')}
                                className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <h1 className="text-white text-3xl font-black">Join Live Quiz</h1>
                        </div>

                        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter Session Code</h2>
                                <p className="text-slate-500">Ask the host for the 6-character code</p>
                            </div>

                            <form onSubmit={handleJoinSubmit} className="space-y-6">
                                <div>
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => {
                                            setJoinCode(e.target.value.toUpperCase());
                                            setJoinError('');
                                        }}
                                        placeholder="AB12CD"
                                        maxLength={6}
                                        className="w-full text-center text-4xl font-mono font-bold tracking-widest py-4 border-b-4 border-slate-200 focus:border-purple-600 focus:outline-none placeholder:text-slate-200 uppercase"
                                        autoFocus
                                    />
                                    {joinError && (
                                        <p className="text-red-500 text-sm font-bold mt-2 text-center animate-pulse">
                                            {joinError}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={joining || joinCode.length !== 6}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-purple-200"
                                >
                                    {joining ? 'Joining...' : 'Join Session'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main menu
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => onNavigate('teams')}
                            className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <h1 className="text-white text-3xl sm:text-4xl font-black flex items-center gap-2">
                                <Zap className="w-8 h-8" />
                                Live Quiz
                            </h1>
                            <p className="text-white/80 text-sm mt-1">Kahoot-style team competition!</p>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-white/90 text-lg font-semibold">
                            Create or join real-time multiplayer quiz sessions
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Host a Quiz */}
                        <button
                            onClick={() => setCurrentState('create')}
                            className="bg-white/10 hover:bg-white/20 rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all text-center group hover:scale-[1.02]"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                <Play className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-white text-2xl font-bold mb-3">Host a Quiz</h2>
                            <p className="text-white/70">
                                Create a live quiz session and invite team members to join
                            </p>
                        </button>

                        {/* Join a Quiz */}
                        <button
                            onClick={() => setCurrentState('join')}
                            className="bg-white/10 hover:bg-white/20 rounded-3xl p-8 border-2 border-white/20 hover:border-white/40 transition-all text-center group hover:scale-[1.02]"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-white text-2xl font-bold mb-3">Join a Quiz</h2>
                            <p className="text-white/70">
                                Enter a session code to join an existing live quiz
                            </p>
                        </button>
                    </div>

                    {/* How it works */}
                    <div className="mt-8 bg-white/10 rounded-2xl p-6">
                        <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                            ⚡ How Live Quiz Works
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-6 text-white/80">
                            <div>
                                <div className="font-bold text-white mb-2 flex items-center gap-2">
                                    👑 For Hosts:
                                </div>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-300">✓</span>
                                        Select a quiz from your team collection
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-300">✓</span>
                                        Set time limits for each question
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-300">✓</span>
                                        Share the 6-digit session code
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-300">✓</span>
                                        Start when everyone has joined
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-bold text-white mb-2 flex items-center gap-2">
                                    🎮 For Players:
                                </div>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-sky-300">✓</span>
                                        Get session code from the host
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-sky-300">✓</span>
                                        Join the waiting room/lobby
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-sky-300">✓</span>
                                        Answer questions in real-time
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-sky-300">✓</span>
                                        Compete for the top score!
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

