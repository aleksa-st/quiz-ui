import React, { useState, useEffect } from 'react';
import { AchievementHero } from './AchievementHero';
import { api } from '../../services/api';
import { PageRoute, Achievement } from '../../types';
import { Button } from '../ui/Button';
import {
    Trophy, Star, Target, Zap, Rocket, Lock, ArrowLeft, Crown,
    Map, ChevronRight, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface AchievementSystemProps {
    onNavigate: (page: PageRoute) => void;
}

interface UserStats {
    level: number;
    xp: number;
    current_streak: number;
    progress_xp: number;
    needed_xp: number;
    next_level_xp: number;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ onNavigate }) => {
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'unlocked' | 'all'>('unlocked');

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const [userResponse, allResponse] = await Promise.all([
                api.achievements.getUser(),
                api.achievements.getAll()
            ]);

            if (userResponse.success && allResponse.success) {
                const rawUserData: any = userResponse.data;

                if (rawUserData.user_stats) {
                    setUserStats(rawUserData.user_stats);
                    setAchievements(rawUserData.achievements);
                } else {
                    setAchievements(Array.isArray(rawUserData) ? rawUserData : []);
                    setUserStats({
                        level: 1,
                        xp: 0,
                        current_streak: 0,
                        progress_xp: 0,
                        needed_xp: 100,
                        next_level_xp: 100
                    });
                }
                setAllAchievements(Array.isArray(allResponse.data) ? allResponse.data : []);
            }
        } catch (error) {
            console.error('Error fetching achievements', error);
            // Fallback for demo if API fails
            setUserStats({
                level: 1,
                xp: 0,
                current_streak: 0,
                progress_xp: 0,
                needed_xp: 100,
                next_level_xp: 100
            });
            setAchievements([]);
            setAllAchievements(mockAchievements);
        } finally {
            setLoading(false);
        }
    };

    const getProgressPercentage = () => {
        if (!userStats) return 0;
        return Math.min(100, Math.round((userStats.progress_xp / userStats.needed_xp) * 100));
    };

    const isUnlocked = (id: number) => achievements.some(a => a.id === id);

    // Identify next target achievement for fresh users
    const getNextTarget = () => {
        const locked = allAchievements.filter(a => !isUnlocked(a.id));
        return locked.length > 0 ? locked[0] : null;
    };

    const nextTarget = getNextTarget();

    if (loading) {
        return (
            <div className="flex bg-slate-50 min-h-screen justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const displayedAchievements = activeTab === 'unlocked' ? achievements : allAchievements;
    const isFreshUser = userStats?.level === 1 && achievements.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="-ml-2 text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Achievements</h1>
                        <p className="text-slate-500">Unlock badges and level up your profile</p>
                    </div>
                </div>

                {/* Level Progress Hero */}
                <AchievementHero
                    userStats={userStats}
                    achievements={achievements}
                    allAchievements={allAchievements}
                    onNavigate={onNavigate}
                />

                {/* Filters */}
                <div className="max-w-md mx-auto bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                    <button
                        onClick={() => setActiveTab('unlocked')}
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'unlocked' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Unlocked ({achievements.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All Badges ({allAchievements.length})
                    </button>
                </div>

                {/* Grid */}
                {displayedAchievements.length === 0 && activeTab === 'unlocked' ? (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-10 w-10 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Badges Yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            Start playing quizzes to unlock your first badge. It's closer than you think!
                        </p>
                        <Button onClick={() => setActiveTab('all')} variant="outline" className="mr-4">
                            View All Badges
                        </Button>
                        <Button onClick={() => onNavigate('discovery')}>
                            Start Playing
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayedAchievements.map(achievement => {
                            const unlocked = isUnlocked(achievement.id);
                            return (
                                <Card
                                    key={achievement.id}
                                    className={`border-0 shadow-lg transition-all duration-300 group ${unlocked ? 'bg-white hover:-translate-y-1 hover:shadow-xl' : 'bg-slate-50 opacity-80'}`}
                                >
                                    <div className={`h-2 ${unlocked ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-slate-200'}`}></div>
                                    <CardContent className="p-6 flex flex-col items-center text-center h-full relative overflow-hidden">
                                        {!unlocked && <Lock className="absolute top-4 right-4 h-4 w-4 text-slate-300" />}

                                        <div className={`p-5 rounded-2xl mb-4 transition-transform group-hover:scale-110 duration-300 ${unlocked ? 'bg-indigo-50 shadow-inner' : 'bg-slate-200 grayscale'}`}>
                                            {getIcon(achievement.icon, unlocked ? 'text-indigo-600' : 'text-slate-400')}
                                        </div>

                                        <h3 className={`text-lg font-bold mb-2 ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                            {achievement.title || achievement.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-4 flex-grow leading-relaxed">
                                            {achievement.description}
                                        </p>

                                        {unlocked ? (
                                            <div className="w-full pt-4 border-t border-slate-100 mt-auto">
                                                <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    <Crown className="h-3 w-3 mr-1" /> Unlocked
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-full pt-4 border-t border-slate-200 mt-auto">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    XP Reward: {achievement.xp_reward || 50}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

// Reuse previous StatCard and getIcon...
const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-4 rounded-full ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-slate-500 font-medium text-sm">{title}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const getIcon = (type: string, className: string) => {
    const props = { className: `h-8 w-8 ${className}` };
    switch (type?.toUpperCase()) {
        case 'TROPHY': return <Trophy {...props} />;
        case 'STAR': return <Star {...props} />;
        case 'TARGET': return <Target {...props} />;
        case 'FLAME': return <Zap {...props} />;
        case 'ROCKET': return <Rocket {...props} />;
        default: return <Trophy {...props} />;
    }
};

const mockAchievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first quiz', icon: 'ROCKET', xp_reward: 50 },
    { id: 2, name: 'Sharpshooter', description: 'Get 100% accuracy on a quiz', icon: 'TARGET', xp_reward: 100 },
    { id: 3, name: 'Knowledge Seeker', description: 'Play quizzes for 7 days in a row', icon: 'FLAME', xp_reward: 200 },
    { id: 4, name: 'Quiz Master', description: 'Reach Level 10', icon: 'TROPHY', xp_reward: 500 },
    { id: 5, name: 'Speed Demon', description: 'Complete a quiz in under 30 seconds', icon: 'ZAP', xp_reward: 150 },
];

