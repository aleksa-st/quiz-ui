import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PointTransaction, User } from '../types';
import { Card, CardContent } from './ui/Card';
import { Coins, Zap } from 'lucide-react';

interface WalletProps {
    user: User;
}

export const TransactionHistory: React.FC<WalletProps> = ({ user }) => {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [filter, setFilter] = useState<'all' | 'points' | 'xp'>('all');
    const [loading, setLoading] = useState(true);
    const [totalPoints, setTotalPoints] = useState(0);
    const [totalXP, setTotalXP] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const type = filter === 'all' ? undefined : filter;
                const res = await api.transactions.getAll(type);
                if (res.success && res.data) {
                    setTransactions(res.data.data);
                }

                // Fetch totals if showing all
                if (filter === 'all') {
                    const pointsRes = await api.transactions.getAll('points');
                    const xpRes = await api.transactions.getAll('xp');

                    if (pointsRes.success && pointsRes.data) {
                        const total = pointsRes.data.data.reduce((sum, t) => sum + t.amount, 0);
                        setTotalPoints(total);
                    }
                    if (xpRes.success && xpRes.data) {
                        const total = xpRes.data.data.reduce((sum, t) => sum + t.amount, 0);
                        setTotalXP(total);
                    }
                }
            } catch (error) {
                console.error('Failed to load transactions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filter]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventIcon = (event: string) => {
        if (event.includes('puzzle')) return '🧩';
        if (event.includes('quiz')) return '📝';
        if (event.includes('achievement')) return '🏆';
        if (event.includes('challenge')) return '⚔️';
        return '✨';
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-800 mb-2">My Wallet</h1>
                <p className="text-slate-500 font-semibold">Your recent points and XP history</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'all'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('points')}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'points'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                >
                    Points
                </button>
                <button
                    onClick={() => setFilter('xp')}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'xp'
                            ? 'bg-slate-800 text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                >
                    XP
                </button>
            </div>

            {/* Summary Cards */}
            {filter === 'all' && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Total Points Card */}
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Coins className="h-5 w-5" />
                            <span className="font-bold text-sm opacity-90">Total Points</span>
                        </div>
                        <div className="text-5xl font-black mb-1">{totalPoints}</div>
                        <div className="text-sm font-semibold opacity-80">Every point counts!</div>
                    </div>

                    {/* Total XP Card */}
                    <div className="bg-gradient-to-br from-lavender-500 to-lavender-700 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-5 w-5" />
                            <span className="font-bold text-sm opacity-90">Total XP</span>
                        </div>
                        <div className="text-5xl font-black mb-1">{totalXP}</div>
                        <div className="text-sm font-semibold opacity-80">Level {Math.floor(totalXP / 100)} - Keep growing!</div>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                    <h3 className="text-xl font-black text-slate-700 mb-4">
                        {filter === 'all' ? 'Today' : filter === 'points' ? 'Point History' : 'XP History'}
                    </h3>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">💰</div>
                            <p className="text-slate-400 font-semibold">No transactions yet</p>
                            <p className="text-slate-300 text-sm mt-2">Complete quizzes and puzzles to earn rewards!</p>
                        </div>
                    ) : (
                        <div className="space-y-0 divide-y divide-slate-100">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between py-4 hover:bg-slate-50 -mx-4 px-4 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${transaction.type === 'xp'
                                                ? 'bg-lavender-100'
                                                : 'bg-yellow-100'
                                            }`}>
                                            {getEventIcon(transaction.event)}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <p className="font-bold text-slate-800">
                                                {transaction.description}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                {transaction.event} • {formatDate(transaction.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className={`font-black text-base ${transaction.type === 'xp' ? 'text-lavender-600' : 'text-yellow-600'
                                        }`}>
                                        +{transaction.amount} {transaction.type === 'xp' ? 'XP' : 'POINTS'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
