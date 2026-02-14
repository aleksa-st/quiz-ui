import React, { useEffect, useState } from 'react';
import { User, Quiz, DashboardStats, PageRoute, Achievement } from '../types';
import { AchievementHero } from './Achievements/AchievementHero';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { api } from '../services/api';
import {
  Play, Plus, Users, Award,
  TrendingUp, Calendar, ArrowRight, Star, Zap, Clock, Trophy, BarChart2
} from 'lucide-react';

import { ChallengeList } from './Social/ChallengeList';

interface DashboardProps {
  user: User;
  onNavigate: (page: PageRoute, data?: any) => void;
  onOpenPuzzle?: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onOpenPuzzle }) => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<any>(null); // Add state for user stats
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(false); // Show UI immediately

    // Load data in background
    const fetchData = async () => {
      if (!isMounted) return;
      try {
        const [statsResponse, quizzesResponse, achievementsResponse, allAchievementsResponse] = await Promise.all([
          api.stats.getDashboardStats(),
          api.quizzes.getExplore({ sort: 'Recently Added' }),
          api.achievements.getUser(),
          api.achievements.getAll()
        ]);

        if (!isMounted) return;

        if (statsResponse.success) {
          setDashboardData(statsResponse.data);
        }

        if (quizzesResponse.success) {
          setRecentQuizzes(quizzesResponse.data.slice(0, 4));
        }

        if (achievementsResponse.success) {
          const raw: any = achievementsResponse.data;
          setAchievements(raw.achievements || (Array.isArray(raw) ? raw : []));
          if (raw.user_stats) {
            setUserStats(raw.user_stats);
          }
        }

        if (allAchievementsResponse.success && Array.isArray(allAchievementsResponse.data)) {
          setAllAchievements(allAchievementsResponse.data);
        }

      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);



  const stats = dashboardData?.stats || {
    quizzes_taken: 0,
    average_score: 0,
    teams_joined: 0,
    achievements: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome / Achievement Hero */}
      {dashboardData?.stats ? (
        <AchievementHero
          userStats={userStats || {
            level: 1,
            xp: 0,
            progress_xp: 0,
            needed_xp: 100
          }}
          achievements={achievements}
          allAchievements={allAchievements}
          onNavigate={onNavigate}
        />
      ) : (
        <div className="bg-slate-200 rounded-[2.5rem] p-8 md:p-12 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="h-6 bg-slate-300 rounded-full w-32 mb-4"></div>
              <div className="h-12 bg-slate-300 rounded w-64 mb-3"></div>
              <div className="h-5 bg-slate-300 rounded w-80"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-12 bg-slate-300 rounded-lg w-32"></div>
              <div className="h-12 bg-slate-300 rounded-lg w-24"></div>
              <div className="h-12 bg-slate-300 rounded-lg w-32"></div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Challenges */}
      <ChallengeList onNavigate={onNavigate} />

      {/* Puzzle Game Quick Launch - Redesigned */}
      {onOpenPuzzle && (
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute -inset-1 bg-gradient-to-r from-lavender-400 via-skyblue-300 to-lavender-500 rounded-[3rem] opacity-20 blur-xl"></div>

          <Card className="border-0 shadow-2xl bg-white overflow-hidden relative">
            <CardContent className="p-0">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-br from-lavender-500 via-lavender-400 to-skyblue-400 px-8 py-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl opacity-10 -mr-8 -mt-4">🧠</div>
                <div className="absolute bottom-0 left-0 text-7xl opacity-10 -ml-4 -mb-2">✨</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl animate-bounce">
                      🎮
                    </div>
                    <h3 className="text-3xl font-black text-white">
                      Brain Training Arena
                    </h3>
                  </div>
                  <p className="text-white/90 font-semibold text-lg ml-0.5">
                    Test your memory skills • Earn XP & Points • Level Up Fast!
                  </p>
                </div>
              </div>

              {/* Difficulty Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                {[
                  {
                    difficulty: 'easy' as const,
                    emoji: '🌱',
                    label: 'Easy Mode',
                    desc: '4x4 Grid • Perfect for Beginners',
                    color: 'from-green-400 to-emerald-500',
                    borderColor: 'border-green-400',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700',
                    points: '+50 XP'
                  },
                  {
                    difficulty: 'medium' as const,
                    emoji: '⚡',
                    label: 'Medium Mode',
                    desc: '6x6 Grid • Ready for Challenge',
                    color: 'from-skyblue-400 to-skyblue-600',
                    borderColor: 'border-skyblue-400',
                    bgColor: 'bg-skyblue-50',
                    textColor: 'text-skyblue-700',
                    points: '+100 XP'
                  },
                  {
                    difficulty: 'hard' as const,
                    emoji: '🔥',
                    label: 'Hard Mode',
                    desc: '8x8 Grid • Ultimate Challenge',
                    color: 'from-lavender-500 to-lavender-700',
                    borderColor: 'border-lavender-500',
                    bgColor: 'bg-lavender-50',
                    textColor: 'text-lavender-700',
                    points: '+200 XP'
                  }
                ].map((mode) => (
                  <div
                    key={mode.difficulty}
                    onClick={() => onOpenPuzzle(mode.difficulty)}
                    className="group relative cursor-pointer"
                  >
                    {/* Card glow effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${mode.color} rounded-3xl opacity-0 group-hover:opacity-30 blur transition duration-300`}></div>

                    {/* Main card */}
                    <div className={`relative bg-white rounded-3xl border-4 ${mode.borderColor} p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300`}>
                      {/* Emoji badge */}
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-4xl shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                        {mode.emoji}
                      </div>

                      {/* Content */}
                      <h4 className={`text-xl font-black text-center mb-2 ${mode.textColor}`}>
                        {mode.label}
                      </h4>
                      <p className="text-slate-500 text-sm text-center font-semibold leading-relaxed mb-4">
                        {mode.desc}
                      </p>

                      {/* XP Badge */}
                      <div className={`${mode.bgColor} rounded-full px-4 py-2 text-center`}>
                        <span className={`font-black text-sm ${mode.textColor}`}>
                          {mode.points}
                        </span>
                      </div>

                      {/* Play button */}
                      <div className="mt-4">
                        <div className={`w-full bg-gradient-to-r ${mode.color} text-white font-black py-3 rounded-2xl text-center shadow-lg group-hover:shadow-xl transition-all`}>
                          Play Now →
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {dashboardData ? [
          { label: 'Total Quizzes', value: stats.quizzes_taken || 0, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-400', border: 'border-blue-500' },
          { label: 'Avg Accuracy', value: `${stats.average_score || 0}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-400', border: 'border-emerald-500' },
          { label: 'Total XP', value: userStats?.xp || 0, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-400', border: 'border-yellow-500' },
          { label: 'Study Streak', value: `${userStats?.current_streak || 0} days`, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-400', border: 'border-orange-500' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-3xl p-6 border-b-4 ${stat.border} shadow-sm hover:-translate-y-1 transition-transform cursor-default`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shadow-inner`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`font-black text-2xl ${stat.color}`}>{stat.value}</div>
            </div>
            <div className="font-extrabold text-slate-400 uppercase text-xs tracking-wider">{stat.label}</div>
          </div>
        )) : Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
              <div className="h-8 w-16 bg-slate-200 rounded"></div>
            </div>
            <div className="h-3 w-20 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Trend (Last 7 Days)</h3>
              <div className="h-64 w-full">
                <div className="grid grid-cols-7 gap-2 h-full items-end">
                  {[
                    { day: 'Mon', accuracy: 65 },
                    { day: 'Tue', accuracy: 70 },
                    { day: 'Wed', accuracy: 68 },
                    { day: 'Thu', accuracy: 75 },
                    { day: 'Fri', accuracy: 82 },
                    { day: 'Sat', accuracy: 85 },
                    { day: 'Sun', accuracy: 80 },
                  ].map((data, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-full bg-indigo-100 rounded-t-lg mb-2 relative" style={{ height: '200px' }}>
                        <div className="absolute bottom-0 w-full bg-indigo-600 rounded-t-lg transition-all duration-500" style={{ height: `${(data.accuracy / 100) * 200}px` }}></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600">{data.day}</span>
                      <span className="text-xs font-bold text-indigo-600">{data.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Category Breakdown</h3>
            <div className="space-y-4">
              {[
                { name: 'Science', count: 10, color: 'bg-blue-500', percentage: 42 },
                { name: 'History', count: 8, color: 'bg-purple-500', percentage: 33 },
                { name: 'Geography', count: 4, color: 'bg-green-500', percentage: 17 },
                { name: 'Arts', count: 2, color: 'bg-yellow-500', percentage: 8 },
              ].map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                      <span className="font-medium text-slate-600">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{cat.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className={`${cat.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quiz Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              Top Picks For You
            </h2>
            <button onClick={() => onNavigate('discovery')} className="text-violet-600 font-extrabold hover:text-violet-700 hover:underline flex items-center transition-colors">
              See All <ArrowRight className="h-5 w-5 ml-1" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {recentQuizzes.length > 0 ? recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="group bg-white rounded-3xl border-2 border-slate-100 overflow-hidden hover:border-violet-500 hover:shadow-xl hover:shadow-violet-200 transition-all duration-300 cursor-pointer" onClick={() => onNavigate('quiz-details', quiz.id)}>
                <div className="h-40 relative bg-slate-100 overflow-hidden group">
                  {quiz.thumbnail && (quiz.thumbnail.startsWith('http') || quiz.thumbnail.startsWith('/')) ? (
                    <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">
                      {quiz.thumbnail || '📝'}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black text-white shadow-sm border-b-2 border-black/10
                          ${quiz.difficulty === 'Easy' ? 'bg-green-500' :
                        quiz.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-500'}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xs font-extrabold text-violet-500 uppercase tracking-wider mb-1">{quiz.category}</div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2 group-hover:text-violet-600 leading-tight">{quiz.title}</h3>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-xs font-bold text-slate-400 gap-3">
                      <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {Math.floor(Math.random() * 1000) + 100}</span>
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {quiz.time_limit || 15}m</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
                      <Play className="h-4 w-4 text-violet-600 group-hover:text-white ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            )) : Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200"></div>
                <div className="p-5">
                  <div className="h-3 w-16 bg-slate-200 rounded mb-2"></div>
                  <div className="h-6 w-full bg-slate-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-slate-200 rounded"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-b-4 border-slate-200">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-black text-slate-800">Quick Actions</h3>
            </div>
            <CardContent className="space-y-3">
              {[
                { label: 'Join Team', icon: Users, page: 'teams-discovery', color: 'bg-sky-100 text-sky-600' },
                { label: 'Create Quiz', icon: Plus, page: 'create-quiz', color: 'bg-purple-100 text-purple-600' },
                { label: 'Leaderboard', icon: Trophy, page: 'leaderboard', color: 'bg-amber-100 text-amber-600' },
                { label: 'My History', icon: Clock, page: 'history', color: 'bg-blue-100 text-blue-600' },
                { label: 'Achievements', icon: Award, page: 'achievements', color: 'bg-pink-100 text-pink-600' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(action.page as PageRoute)}
                  className="w-full flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group border-2 border-transparent hover:border-slate-100"
                >
                  <div className={`p-3 rounded-xl mr-4 ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{action.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-b-4 border-indigo-200">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-600" />
                Performance
              </h3>
            </div>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Accuracy</span>
                  <span className="text-lg font-bold text-indigo-600">{stats.average_score}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${stats.average_score}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Quizzes Taken</span>
                  <span className="text-lg font-bold text-green-600">{stats.quizzes_taken}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Current Streak</span>
                  <span className="text-lg font-bold text-orange-600">{userStats?.current_streak || 0} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};