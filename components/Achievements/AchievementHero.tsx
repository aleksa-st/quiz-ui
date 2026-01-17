import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Trophy, Target, Sparkles, ChevronRight, Info, X } from 'lucide-react';
import { Achievement, PageRoute } from '../../types';

interface AchievementHeroProps {
    userStats: {
        level: number;
        xp: number;
        progress_xp: number;
        needed_xp: number;
    } | null;
    achievements: Achievement[];
    allAchievements: Achievement[];
    onNavigate: (page: PageRoute) => void;
}

export const AchievementHero: React.FC<AchievementHeroProps> = ({ userStats, achievements, allAchievements, onNavigate }) => {
    const [showInfo, setShowInfo] = useState(false);

    if (!userStats) return null;

    const isUnlocked = (id: number) => achievements.some(a => a.id === id);
    const isFreshUser = userStats.level === 1 && achievements.length === 0;

    const getNextTarget = () => {
        const locked = allAchievements.filter(a => !isUnlocked(a.id));
        return locked.length > 0 ? locked[0] : null;
    };

    const nextTarget = getNextTarget();

    const getProgressPercentage = () => {
        return Math.min(100, Math.round((userStats.progress_xp / userStats.needed_xp) * 100));
    };

    const getIcon = (type: string, className: string) => {
        // ... existing getIcon code ...
        const props = { className: `h-8 w-8 ${className}` };
        // Fallback for icons since we can't import everything here smoothly if dynamic
        // But for this component reuse, we can use the main ones
        return <Target {...props} />;
    };

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-6 tracking-wide uppercase">
                        <Sparkles className="h-3 w-3" />
                        {isFreshUser ? "Rookie Journey" : "Legend Path"}
                    </div>

                    <h2 className="text-5xl font-black mb-2 tracking-tight">
                        Level {userStats.level}
                    </h2>
                    <div className="flex items-center gap-2 mb-8">
                        <p className="text-indigo-200 text-lg font-medium">
                            {isFreshUser
                                ? "Your journey has just begun! Play quizzes to gain XP."
                                : `${userStats.xp} Total XP earned so far.`}
                        </p>
                        <button
                            onClick={() => setShowInfo(true)}
                            className="p-1 rounded-full hover:bg-white/10 text-indigo-300 transition-colors"
                            title="How is XP calculated?"
                        >
                            <Info className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">

                        <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                            <span>Current Progress</span>
                            <span>{userStats?.progress_xp} / {userStats?.needed_xp} XP</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4 mb-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                                style={{ width: `${Math.max(5, getProgressPercentage())}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-400">
                            {userStats.needed_xp - userStats.progress_xp} more XP to reach Level {userStats.level + 1}
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 rounded-3xl p-6 border border-white/10 backdrop-blur-md">

                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
                        Next Milestone
                    </h3>

                    {nextTarget ? (
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700 shadow-inner group">
                                {getIcon(nextTarget.icon, "text-slate-500 group-hover:text-indigo-400 transition-colors")}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-1">{nextTarget.title || nextTarget.name}</h4>
                                <p className="text-slate-400 text-sm mb-3">{nextTarget.description}</p>
                                <div className="inline-flex items-center text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded pointer-events-none">
                                    <Target className="w-3 h-3 mr-1" />
                                    Reward: {nextTarget.xp_reward || 100} XP
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400">
                            <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                            <p>All milestones achieved! You are a legend.</p>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                        <div className="text-xs text-slate-400">
                            <strong>Tip:</strong> Daily streaks grant bonus XP!
                        </div>
                        <Button size="sm" onClick={() => onNavigate('discovery')} className="bg-white text-slate-900 hover:bg-indigo-50 border-0">
                            Play Now <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* XP Info Modal */}
            {showInfo && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
                        <button
                            onClick={() => setShowInfo(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-400" /> XP Rules
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                    <Target className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Quizzes</h4>
                                    <p className="text-sm text-slate-400">Earn points equal to your score % (e.g. 100% = 100 XP).</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center shrink-0">
                                    <Trophy className="h-5 w-5 text-fuchsia-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Achievements</h4>
                                    <p className="text-sm text-slate-400">Unlock badges for one-time XP bonuses (50-500 XP).</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Streaks</h4>
                                    <p className="text-sm text-slate-400">Login daily to build your multiplier.</p>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500" onClick={() => setShowInfo(false)}>
                            Got it!
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
