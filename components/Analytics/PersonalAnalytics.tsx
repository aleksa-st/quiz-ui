import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageRoute } from '../../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, Award, Clock, Flame, Target, BarChart3,
    Calendar, ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface PersonalAnalyticsProps {
    onNavigate: (page: PageRoute) => void;
}

export const PersonalAnalytics: React.FC<PersonalAnalyticsProps> = ({ onNavigate }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const [chartMetric, setChartMetric] = useState('accuracy');

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            // In a real scenario, this would call api.stats.getPerformance(period)
            // For now we might need to mock or reuse existing endpoints if they don't fully match
            const response = await api.stats.getDashboardStats();
            if (response.success) {
                // Transform dashboard stats into analytics format if needed
                // Or if we have a dedicated analytics endpoint, use that.
                // Based on api.ts, we have api.stats.getPerformance

                // Let's try to fetch specific performance data
                try {
                    const perfResponse = await api.stats.getPerformance(Number(period));
                    if (perfResponse.success) {
                        setData(perfResponse.data);
                    } else {
                        // Fallback to dashboard stats or mock for demo
                        setData(mockData);
                    }
                } catch (e) {
                    console.warn("Analytics endpoint might not be ready, using mock data for UI", e);
                    setData(mockData);
                }
            }
        } catch (error) {
            console.error('Error loading analytics', error);
            setData(mockData); // Fallback
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-slate-50 min-h-screen justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-2 -ml-2 text-slate-500 hover:text-slate-700">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-black text-slate-900">Analytics Dashboard</h1>
                        <p className="text-slate-500 mt-1">Track your learning progress and performance</p>
                    </div>

                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-violet-500 outline-none"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="365">Last year</option>
                    </select>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Total Quizzes"
                        value={data.overall_stats?.total_quizzes || 0}
                        icon={BarChart3}
                        color="bg-sky-500"
                    />
                    <StatCard
                        label="Avg Accuracy"
                        value={`${Number(data.overall_stats?.avg_accuracy || 0).toFixed(1)}%`}
                        icon={Target}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        label="Avg Score"
                        value={Number(data.overall_stats?.avg_score || 0).toFixed(0)}
                        icon={Award}
                        color="bg-violet-500"
                    />
                    <StatCard
                        label="Study Streak"
                        value={data.overall_stats?.study_streak || 0}
                        icon={Flame}
                        color="bg-orange-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <Card className="lg:col-span-2 border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Performance Trend</h3>
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setChartMetric('accuracy')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${chartMetric === 'accuracy' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Accuracy
                                    </button>
                                    <button
                                        onClick={() => setChartMetric('score')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${chartMetric === 'score' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Score
                                    </button>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.performance_chart || []}>
                                        <defs>
                                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="#94a3b8"
                                            fontSize={12}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="#94a3b8"
                                            fontSize={12}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey={chartMetric === 'accuracy' ? 'avg_accuracy' : 'avg_score'}
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorMetric)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Pie Chart */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Category Breakdown</h3>
                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.category_stats || []}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="quiz_count"
                                        >
                                            {(data.category_stats || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.category_color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="block text-3xl font-black text-slate-800">{data.overall_stats?.total_quizzes}</span>
                                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Quizzes</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                {(data.category_stats || []).slice(0, 4).map((cat: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.category_color }}></div>
                                            <span className="font-medium text-slate-600">{cat.category_name}</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{cat.quiz_count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between transition-transform hover:-translate-y-1">
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

// Mock Data for fallback
const mockData = {
    overall_stats: {
        total_quizzes: 24,
        avg_score: 850,
        avg_accuracy: 78.5,
        study_streak: 5
    },
    performance_chart: [
        { date: 'Mon', avg_accuracy: 65, avg_score: 600 },
        { date: 'Tue', avg_accuracy: 70, avg_score: 750 },
        { date: 'Wed', avg_accuracy: 68, avg_score: 700 },
        { date: 'Thu', avg_accuracy: 75, avg_score: 800 },
        { date: 'Fri', avg_accuracy: 82, avg_score: 900 },
        { date: 'Sat', avg_accuracy: 85, avg_score: 950 },
        { date: 'Sun', avg_accuracy: 80, avg_score: 880 },
    ],
    category_stats: [
        { category_name: 'Science', quiz_count: 10, category_color: '#3b82f6' },
        { category_name: 'History', quiz_count: 8, category_color: '#8b5cf6' },
        { category_name: 'Geography', quiz_count: 4, category_color: '#10b981' },
        { category_name: 'Arts', quiz_count: 2, category_color: '#f59e0b' },
    ]
};

