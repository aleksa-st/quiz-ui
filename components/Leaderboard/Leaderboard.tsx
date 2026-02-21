
import React, { useEffect, useState, useCallback } from 'react';
import { LeaderboardEntry } from '../../types';
import { api } from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Trophy, Medal, Crown, Zap, Target, Award } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLeaderboard = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) setIsLoading(true);
      else setLoadingMore(true);

      const response = await api.leaderboard.get({ page, per_page: 50 });

      if (response.success) {
        const newEntries = response.data || [];
        setEntries(prev => reset || page === 1 ? newEntries : [...prev, ...newEntries]);
        setHasMore(response.pagination?.has_more || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to load leaderboard", error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchLeaderboard(currentPage + 1);
    }
  };

  useEffect(() => {
    setIsLoading(false); // Show UI immediately
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pt-20 md:pt-0">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-xs md:text-sm mb-4 md:mb-6 shadow-lg shadow-orange-500/30">
            <Crown className="h-4 w-4 md:h-5 md:w-5" />
            HALL OF FAME
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight">
            Global Leaderboard
          </h1>
          <p className="text-slate-600 text-sm md:text-lg font-medium">Champions who conquered the quiz realm</p>
        </div>

        {/* Podium */}
        {isLoading ? (
          <div className="flex justify-center items-end gap-2 md:gap-6 mb-12 md:mb-16">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center animate-pulse">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-slate-200 mb-4"></div>
                <div className={`w-28 md:w-40 rounded-t-3xl bg-slate-200 ${i === 1 ? 'h-60 md:h-72' : i === 0 ? 'h-48 md:h-60' : 'h-40 md:h-48'}`}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-end gap-2 md:gap-6 mb-12 md:mb-16">
            {topThree[1] && <PodiumItem entry={topThree[1]} rank={2} />}
            {topThree[0] && <PodiumItem entry={topThree[0]} rank={1} />}
            {topThree[2] && <PodiumItem entry={topThree[2]} rank={3} />}
          </div>
        )}

        {/* List */}
        <Card className="border-0 shadow-2xl shadow-slate-900/10 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Award className="h-6 w-6 text-yellow-400" />
              Top Performers
            </h2>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-slate-100">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-6 animate-pulse">
                    <div className="w-12 h-6 bg-slate-200 rounded mr-6"></div>
                    <div className="w-12 h-12 rounded-full bg-slate-200 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-6 w-16 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-12 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rest.length > 0 ? rest.map((entry) => (
                  <div key={entry.rank} className="flex items-center p-6 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all duration-300 group">
                    <div className="w-12 font-black text-2xl text-slate-400 text-center group-hover:text-violet-600 transition-colors">#{entry.rank}</div>
                    <div className="flex items-center gap-4 flex-1 ml-6">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 p-0.5 shadow-lg">
                          <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            {entry.avatar_url ? (
                              <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-violet-600">
                                {entry.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                          <Zap className="h-3 w-3 text-yellow-800" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-slate-800 group-hover:text-violet-900 transition-colors">{entry.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <Target className="h-3 w-3" />
                          {entry.total_quizzes} quizzes completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {entry.total_points}
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">POINTS</div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-slate-500">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No other champions yet.</p>
                    <p className="text-sm">Be the first to claim your spot!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load More Button */}
        {!isLoading && entries.length > 0 && hasMore && (
          <div className="text-center mt-10">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30 transform hover:scale-105 transition-all"
            >
              {loadingMore ? 'Loading Champions...' : 'Load More Champions'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const PodiumItem: React.FC<{ entry: LeaderboardEntry, rank: number }> = ({ entry, rank }) => {
  const configs = {
    1: { height: 'h-60 md:h-72', bg: 'from-yellow-400 to-orange-500', border: 'border-yellow-400', icon: Trophy, iconBg: 'bg-yellow-500', shadow: 'shadow-yellow-500/50' },
    2: { height: 'h-48 md:h-60', bg: 'from-slate-300 to-slate-400', border: 'border-slate-400', icon: Medal, iconBg: 'bg-slate-500', shadow: 'shadow-slate-500/30' },
    3: { height: 'h-40 md:h-48', bg: 'from-orange-400 to-red-500', border: 'border-orange-400', icon: Medal, iconBg: 'bg-orange-500', shadow: 'shadow-orange-500/30' }
  };
  const config = configs[rank as keyof typeof configs];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center group hover:scale-105 transition-transform duration-300 z-10">
      <div className="mb-3 md:mb-6 relative">
        <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 ${config.border} overflow-hidden shadow-xl ${config.shadow} bg-white p-1`}>
          {entry.avatar_url ? (
            <img src={entry.avatar_url} alt={entry.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl md:text-2xl text-white">
              {entry.name.charAt(0)}
            </div>
          )}
        </div>
        <div className={`absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 md:w-12 md:h-12 ${config.iconBg} rounded-full flex items-center justify-center shadow-lg ${config.shadow}`}>
          <Icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
        </div>
        {rank === 1 && (
          <div className="absolute -top-8 md:-top-10 left-1/2 transform -translate-x-1/2">
            <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 animate-bounce" />
          </div>
        )}
      </div>
      <div className={`w-28 md:w-40 rounded-t-2xl md:rounded-t-3xl bg-gradient-to-t ${config.bg} flex flex-col items-center justify-end pb-4 md:pb-6 ${config.height} shadow-2xl ${config.shadow} relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center w-full px-1">
          <div className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 drop-shadow-lg">{rank}</div>
          <div className="font-bold text-white text-xs md:text-sm mb-0.5 md:mb-1 px-1 truncate w-full block">{entry.name}</div>
          <div className="text-[10px] md:text-xs font-bold text-white/80">{entry.total_points} pts</div>
        </div>
      </div>
    </div>
  );
};

